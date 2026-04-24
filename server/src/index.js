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
  const { items, total_amount, address } = req.body;
  const user_id = req.user.id;
  try {
    const orderResult = await db.query(
      'INSERT INTO orders (user_id, total_amount, address, payment_status) VALUES (?, ?, ?, ?)',
      [user_id, total_amount, address, 'PAID']
    );
    const orderId = orderResult.lastID;
    
    for (const item of items) {
      await db.query(
        'INSERT INTO order_items (order_id, medicine_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',
        [orderId, item.id, item.quantity, item.price]
      );
      await db.query('UPDATE medicines SET stock = stock - ? WHERE id = ?', [item.quantity, item.id]);
    }
    
    res.status(201).json({ id: orderId, message: 'Order placed successfully' });
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
    const result = await db.query(
      'INSERT INTO reminders (user_id, medicine_name, dosage, time, frequency, status) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, medicine_name, dosage, time, frequency, 'ACTIVE']
    );
    res.status(201).json({ id: result.lastID, message: 'Reminder set' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reminders/bulk', auth, async (req, res) => {
  const { medicines } = req.body;
  try {
    for (const med of medicines) {
      await db.query(
        'INSERT INTO reminders (user_id, medicine_name, dosage, time, frequency, status) VALUES (?, ?, ?, ?, ?, ?)',
        [req.user.id, med.name, med.dosage, '09:00 AM', med.duration, 'ACTIVE']
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

// --- SUBSCRIPTION ROUTES ---
app.get('/api/subscriptions', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT s.*, m.name as medicine_name FROM subscriptions s JOIN medicines m ON s.medicine_id = m.id WHERE s.user_id = ?',
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
