const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('./db');
const { auth, adminAuth } = require('./middleware/auth');
const { predictNextRefill } = require('./utils/refillEngine');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// --- AUTH ROUTES ---
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, phone, address } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone, address]
    );
    const userId = result.lastID;
    const user = { id: userId, name, email, role: 'USER' };
    const token = jwt.sign({ id: userId, role: 'USER' }, process.env.JWT_SECRET);
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- MEDICINE ROUTES ---
app.get('/api/medicines', async (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = 'SELECT * FROM medicines WHERE 1=1';
    const params = [];
    
    if (category) {
      const categories = category.split(',');
      const placeholders = categories.map(() => '?').join(',');
      sql += ` AND category IN (${placeholders})`;
      params.push(...categories);
    }
    if (search) {
      params.push(`%${search}%`, `%${search}%`);
      sql += ' AND (name LIKE ? OR description LIKE ?)';
    }
    
    const result = await db.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/medicines', auth, async (req, res) => {
  const { name, composition, price, stock, category, description } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO medicines (name, composition, price, stock, category, description) VALUES (?, ?, ?, ?, ?, ?)',
      [name, composition, price, stock, category, description]
    );
    res.status(201).json({ id: result.lastID, message: 'Medicine added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/medicines/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM medicines WHERE id = ?', [req.params.id]);
    res.json({ message: 'Medicine deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ORDER ROUTES ---
app.post('/api/orders', auth, async (req, res) => {
  const { items, total_amount, address, is_emergency } = req.body;
  const user_id = req.user.id;
  try {
    const orderResult = await db.query(
      'INSERT INTO orders (user_id, total_amount, address, payment_status, is_emergency, status, deliveryLocation) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, total_amount, address, 'PAID', is_emergency ? 1 : 0, 'ORDER_PLACED', req.body.deliveryLocation || null]
    );
    const orderId = orderResult.lastID;

    // Add status history
    await db.query('INSERT INTO order_status_history (order_id, status) VALUES (?, ?)', [orderId, 'ORDER_PLACED']);

    
    for (const item of items) {
      await db.query(
        'INSERT INTO order_items (order_id, medicine_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',
        [orderId, item.id, item.quantity, item.price]
      );
      await db.query('UPDATE medicines SET stock = stock - ? WHERE id = ?', [item.quantity, item.id]);
    }
    
    res.status(201).json({ id: orderId, message: 'Order placed successfully' });

    // Create Notification
    await db.query(
      'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)',
      [user_id, 'info', 'Order Placed', `Your order #ORD-${orderId} for ₹${total_amount} has been placed successfully.`]
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:id', auth, async (req, res) => {
  try {
    const orderId = req.params.id.replace(/[^0-9]/g, '');
    if (!orderId) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }
    const orderResult = await db.query(
      'SELECT o.*, u.name as user_name FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];
    
    // Authorization check
    if (Number(order.user_id) !== Number(req.user.id) && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized access to this order' });
    }

    const itemsResult = await db.query(
      'SELECT oi.*, m.name as medicine_name FROM order_items oi JOIN medicines m ON oi.medicine_id = m.id WHERE oi.order_id = ?',
      [orderId]
    );

    const historyResult = await db.query(
      'SELECT status, created_at AS timestamp FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC',
      [orderId]
    );

    order.items = itemsResult.rows;
    order.statusHistory = historyResult.rows;
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public Tracking Endpoint
app.get('/api/track/:id', async (req, res) => {
  try {
    const orderId = req.params.id.replace(/[^0-9]/g, '');
    if (!orderId) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }
    const orderResult = await db.query(
      'SELECT o.id, o.status, o.created_at, o.total_amount, o.address, u.name as user_name FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    const itemsResult = await db.query(
      'SELECT oi.quantity, oi.price_at_time, m.name as medicine_name FROM order_items oi JOIN medicines m ON oi.medicine_id = m.id WHERE oi.order_id = ?',
      [orderId]
    );

    const historyResult = await db.query(
      'SELECT status, created_at AS timestamp FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC',
      [orderId]
    );

    order.items = itemsResult.rows;
    order.statusHistory = historyResult.rows;
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/orders/:id/status', auth, async (req, res) => {
  try {
    // Only ADMIN should be able to update status
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to update order status' });
    }

    const orderId = req.params.id;
    const { status, deliveryLocation } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Verify order exists
    const orderResult = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order status
    if (deliveryLocation) {
       await db.query('UPDATE orders SET status = ?, deliveryLocation = ? WHERE id = ?', [status, deliveryLocation, orderId]);
    } else {
       await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
    }
    
    // Add to history
    await db.query('INSERT INTO order_status_history (order_id, status) VALUES (?, ?)', [orderId, status]);

    // Create Notification for the user
    await db.query(
      'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)',
      [orderResult.rows[0].user_id, 'info', 'Order Update', `Your order #ORD-${orderId} status has been updated to ${status}.`]
    );

    res.json({ message: 'Order status updated successfully', status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/reminders', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM reminders WHERE user_id = ?', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reminders', auth, async (req, res) => {
  const { medicine_name, dosage, time, frequency } = req.body;
  try {
    const suggestion = getSuggestion(medicine_name);
    const result = await db.query(
      'INSERT INTO reminders (user_id, medicine_name, dosage, time, frequency, suggestion) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, medicine_name, dosage, time, frequency, suggestion]
    );
    res.status(201).json({ id: result.lastID, message: 'Reminder set', suggestion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const getSuggestion = (name) => {
  const n = name.toLowerCase();
  if (n.includes('paracetamol') || n.includes('ibuprofen') || n.includes('pain')) 
    return 'Take after food to avoid stomach upset. Avoid alcohol.';
  if (n.includes('amoxicillin') || n.includes('antibiotic') || n.includes('penicillin'))
    return 'Complete the full course even if you feel better. Take with plenty of water.';
  if (n.includes('cetirizine') || n.includes('allergy') || n.includes('loratadine'))
    return 'May cause drowsiness. Avoid driving if affected.';
  if (n.includes('vitamin') || n.includes('multivitamin'))
    return 'Best taken with your largest meal of the day for better absorption.';
  if (n.includes('metformin') || n.includes('diabetes'))
    return 'Take with meals to reduce gastrointestinal side effects.';
  if (n.includes('atorvastatin') || n.includes('cholesterol'))
    return 'Avoid grapefruit juice. Contact doctor if you experience unusual muscle pain.';
  return 'Follow your doctor\'s instructions. Maintain consistent timings.';
};

app.post('/api/reminders/:id/complete', auth, async (req, res) => {
  try {
    // Award 10 points for taking medicine
    await db.query('UPDATE users SET points = points + 10 WHERE id = ?', [req.user.id]);
    // Delete or mark as completed (here we just keep it but user gets points)
    res.json({ message: 'Reminder completed! You earned 10 points.', pointsEarned: 10 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/user/points', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT points FROM users WHERE id = ?', [req.user.id]);
    res.json({ points: result.rows[0]?.points || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reminders/bulk', auth, async (req, res) => {
  const { medicines } = req.body;
  try {
    for (const med of medicines) {
      const suggestion = getSuggestion(med.name);
      await db.query(
        'INSERT INTO reminders (user_id, medicine_name, dosage, time, frequency, suggestion, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [req.user.id, med.name, med.dosage, '09:00 AM', med.duration, suggestion, 'ACTIVE']
      );
    }
    res.status(201).json({ message: 'All reminders set successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/reminders/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM reminders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Reminder deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN ROUTES ---
app.get('/api/admin/orders', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT o.*, u.name as user_name 
      FROM orders o 
      JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/users', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, role, phone, created_at FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/stats', auth, async (req, res) => {
  try {
    const revenue = await db.query('SELECT SUM(total_amount) as total FROM orders');
    const orders = await db.query('SELECT COUNT(*) as count FROM orders');
    const users = await db.query('SELECT COUNT(*) as count FROM users');
    const medicines = await db.query('SELECT COUNT(*) as count FROM medicines');
    
    res.json({
      revenue: revenue.rows[0].total || 0,
      orders: orders.rows[0].count,
      users: users.rows[0].count,
      medicines: medicines.rows[0].count
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SCHEDULE ROUTES ---
app.get('/api/schedules', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM schedules WHERE user_id = ?', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/schedules', auth, async (req, res) => {
  const { medicine_name, dosage, timings, start_date } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO schedules (user_id, medicine_name, dosage, timings, start_date) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, medicine_name, dosage, timings, start_date]
    );
    res.status(201).json({ id: result.lastID, message: 'Schedule created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- NOTIFICATION ROUTES ---
app.get('/api/notifications', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/notifications/read-all', auth, async (req, res) => {
  try {
    await db.query('UPDATE notifications SET read = 1 WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/notifications/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM notifications WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SUBSCRIPTION ROUTES ---
app.get('/api/subscriptions', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM subscriptions WHERE user_id = ?',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
