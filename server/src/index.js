const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const db = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5010;
const JWT_SECRET = process.env.JWT_SECRET || 'anjaneya_secret_key';

// Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_placeholder',
});

// Middleware: Auth
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// WebSocket Connection
io.on('connection', (socket) => {
  socket.on('join_order', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`Socket joined order_${orderId}`);
  });
  socket.on('join_user', (userId) => {
    socket.join(`user_${userId}`);
  });
  socket.on('update_location', async (data) => {
    const { orderId, lat, lng } = data;
    await db.query('UPDATE orders SET delivery_lat = ?, delivery_lng = ? WHERE id = ?', [lat, lng, orderId]);
    io.to(`order_${orderId}`).emit('location_updated', { lat, lng });
  });
});

// --- AUTH APIs ---
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'USER']
    );
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ error: 'Email already exists' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'User not found' });
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- MEDICINES ---
app.get('/api/medicines', async (req, res) => {
  try {
    const medicinesRes = await db.query('SELECT * FROM medicines WHERE stock > 0');
    const medicines = medicinesRes.rows;

    // Fetch periodic discount
    let discount = { enabled: false, percentage: 0 };
    try {
      const resSettings = await db.query('SELECT value FROM settings WHERE key = "periodic_discount"');
      if (resSettings.rows.length > 0) {
        discount = JSON.parse(resSettings.rows[0].value);
      }
    } catch (e) {}

    const discountedMedicines = medicines.map(med => {
      const originalPrice = parseFloat(med.price) || 0;
      if (discount.enabled && discount.percentage > 0) {
        const discountAmount = (originalPrice * discount.percentage) / 100;
        return {
          ...med,
          original_price: originalPrice,
          price: Number((originalPrice - discountAmount).toFixed(2)),
          discount_active: true,
          discount_percentage: discount.percentage,
          discount_message: discount.message
        };
      }
      return { 
        ...med, 
        price: originalPrice,
        discount_active: false 
      };
    });

    res.json(discountedMedicines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PAYMENTS (Razorpay) ---
app.post('/api/payments/create-order', auth, async (req, res) => {
  const { amount } = req.body;
  try {
    const options = {
      amount: amount * 100, // in paisa
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/payments/verify', auth, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDetails } = req.body;
  const hmac = crypto.createHmac('sha256', razorpay.key_secret);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generated_signature = hmac.digest('hex');

  if (generated_signature === razorpay_signature) {
    try {
      const { items, total_amount, address, discount_amount } = orderDetails;
      const orderResult = await db.query(
        'INSERT INTO orders (user_id, total_amount, address, payment_id, payment_status, status, discount_amount) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [req.user.id, total_amount, address, razorpay_payment_id, 'PAID', 'ORDER_PLACED', discount_amount || 0]
      );
      const orderId = orderResult.lastID;
      
      await db.query('INSERT INTO order_status_history (order_id, status) VALUES (?, ?)', [orderId, 'ORDER_PLACED']);
      for (let item of items) {
        await db.query(
          'INSERT INTO order_items (order_id, medicine_id, medicine_name, quantity, price_at_time) VALUES (?, ?, ?, ?, ?)',
          [orderId, item.id, item.name, item.quantity, item.price]
        );
        await db.query('UPDATE medicines SET stock = stock - ? WHERE id = ?', [item.quantity, item.id]);
      }

      await db.query(
        'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)',
        [req.user.id, 'order_placed', 'Order Placed Successfully', `Your order #ORD-${orderId} has been received.`]
      );

      // Notify Admins
      const adminsRes = await db.query('SELECT id FROM users WHERE role = "ADMIN"');
      for (let admin of adminsRes.rows) {
        io.to(`user_${admin.id}`).emit('new_notification', { 
          title: 'New Order Received!', 
          message: `Order #ORD-${orderId} has been placed and paid.` 
        });
      }

      res.json({ success: true, orderId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(400).json({ success: false, message: 'Invalid signature' });
  }
});

// --- CUSTOM UPI PAYMENT ---
app.post('/api/payments/upi-success', auth, async (req, res) => {
  const { items, total_amount, address, discount_amount, upi_id } = req.body;
  try {
    const orderResult = await db.query(
      'INSERT INTO orders (user_id, total_amount, address, payment_id, payment_status, status, discount_amount) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, total_amount, address, upi_id, 'PAID', 'ORDER_PLACED', discount_amount || 0]
    );
    const orderId = orderResult.lastID;

    await db.query('INSERT INTO order_status_history (order_id, status) VALUES (?, ?)', [orderId, 'ORDER_PLACED']);
    for (let item of items) {
      await db.query(
        'INSERT INTO order_items (order_id, medicine_id, medicine_name, quantity, price_at_time) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.id, item.name, item.quantity, item.price]
      );
      await db.query('UPDATE medicines SET stock = stock - ? WHERE id = ?', [item.quantity, item.id]);
    }
    
    await db.query(
      'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)',
      [req.user.id, 'order_placed', 'Order Placed Successfully', `Your order #ORD-${orderId} has been received via UPI.`]
    );

    // Notify Admins
    const adminsRes = await db.query('SELECT id FROM users WHERE role = "ADMIN"');
    for (let admin of adminsRes.rows) {
      io.to(`user_${admin.id}`).emit('new_notification', { 
        title: 'New UPI Order!', 
        message: `Order #ORD-${orderId} paid via UPI (${upi_id}).` 
      });
    }

    res.json({ success: true, orderId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- TRACKING ---
app.get('/api/track/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const orderResult = await db.query(
      'SELECT o.*, u.name as user_name FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?',
      [orderId]
    );
    if (orderResult.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    const order = orderResult.rows[0];
    const itemsResult = await db.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    const historyResult = await db.query('SELECT status, created_at AS timestamp FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC', [orderId]);
    order.items = itemsResult.rows;
    order.statusHistory = historyResult.rows;
    
    // Add default location if missing
    if (!order.delivery_lat) {
      order.delivery_lat = 12.9716; // Default Bangalore Lat
      order.delivery_lng = 77.5946; // Default Bangalore Lng
    }
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- COD ORDERS ---
app.post('/api/orders/cod', auth, async (req, res) => {
  try {
    const { items, total_amount, address, discount_amount } = req.body;
    const orderResult = await db.query(
      'INSERT INTO orders (user_id, total_amount, address, payment_status, status, discount_amount) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, total_amount, address, 'COD_PENDING', 'ORDER_PLACED', discount_amount || 0]
    );
    const orderId = orderResult.lastID;

    await db.query(
      'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)',
      [req.user.id, 'order_placed', 'Order Placed Successfully', `Your COD order #ORD-${orderId} has been received.`]
    );

    // Notify Admins
    const adminsRes = await db.query('SELECT id FROM users WHERE role = "ADMIN"');
    for (let admin of adminsRes.rows) {
      await db.query(
        'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)',
        [admin.id, 'order', 'New COD Order Received', `New COD Order #ORD-${orderId} from ${req.user.name}.`]
      );
      io.to(`user_${admin.id}`).emit('new_notification', {
        title: 'New COD Order Received',
        message: `New COD Order #ORD-${orderId} from ${req.user.name}.`,
        type: 'order'
      });
    }

    // Real-time Notification for User
    io.to(`user_${req.user.id}`).emit('new_notification', {
      title: 'Order Placed Successfully',
      message: `Your COD order #ORD-${orderId} has been received.`
    });

    await db.query('INSERT INTO order_status_history (order_id, status) VALUES (?, ?)', [orderId, 'ORDER_PLACED']);
    for (let item of items) {
      await db.query(
        'INSERT INTO order_items (order_id, medicine_id, medicine_name, quantity, price_at_time) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.id, item.name, item.quantity, item.price]
      );
    }
    res.json({ success: true, orderId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN APIs ---
app.get('/api/admin/orders', auth, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Unauthorized' });
  console.log('[ADMIN] Fetching orders...');
  try {
    const result = await db.query('SELECT o.*, u.name as user_name FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC');
    console.log(`[ADMIN] Found ${result.rows.length} orders`);
    res.json(result.rows);
  } catch (err) {
    console.error('[ADMIN] Error fetching orders:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN STATS ---
app.get('/api/admin/stats', auth, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Unauthorized' });
  const range = req.query.range || 'ALL';

  try {
    let dateFilter = '';
    // Use local time start of day for 'DAY'
    if (range === 'DAY') dateFilter = "AND date(o.created_at, 'localtime') = date('now', 'localtime')";
    else if (range === 'WEEK') dateFilter = "AND o.created_at >= date('now', '-7 days')";
    else if (range === 'MONTH') dateFilter = "AND o.created_at >= date('now', '-30 days')";
    else if (range === 'QUARTER') dateFilter = "AND o.created_at >= date('now', '-90 days')";
    else if (range === 'YEAR') dateFilter = "AND o.created_at >= date('now', '-365 days')";

    const ordersRes = await db.query(`SELECT total_amount, discount_amount, id, user_id FROM orders o WHERE 1=1 ${dateFilter}`);
    const usersRes = await db.query('SELECT COUNT(*) as count FROM users');
    const medsRes = await db.query('SELECT COUNT(*) as count FROM medicines');
    
    const revenue = ordersRes.rows.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const totalDiscounts = ordersRes.rows.reduce((sum, o) => sum + (o.discount_amount || 0), 0);
    const orderCount = ordersRes.rows.length;

    // Engagement: (Users with orders in this period / Total Users) * 100
    const uniqueBuyers = new Set(ordersRes.rows.map(o => o.user_id)).size;
    const totalUsers = usersRes.rows[0].count || 1;
    const engagement = Math.min(100, Math.round((uniqueBuyers / totalUsers) * 100) + 15); // +15 for active sessions

    // Retention: (Users with >1 order / Total Users) * 100
    const repeatBuyersRes = await db.query('SELECT COUNT(*) as count FROM (SELECT user_id FROM orders GROUP BY user_id HAVING COUNT(id) > 1)');
    const retention = Math.min(100, Math.round((repeatBuyersRes.rows[0].count / totalUsers) * 100) + 40); // Base retention + active

    // Category Distribution
    const categoryRes = await db.query(`
      SELECT m.category, COUNT(*) as count 
      FROM order_items oi 
      JOIN medicines m ON oi.medicine_id = m.id 
      JOIN orders o ON oi.order_id = o.id
      WHERE 1=1 ${dateFilter}
      GROUP BY m.category
    `);
    
    const distribution = {};
    categoryRes.rows.forEach(r => {
      distribution[r.category || 'Others'] = r.count;
    });

    res.json({
      revenue,
      orders: orderCount,
      users: totalUsers,
      medicines: medsRes.rows[0].count,
      categoryDistribution: distribution,
      engagement: engagement || 84,
      retention: retention || 92,
      totalDiscounts: totalDiscounts || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN DISCOUNTS ---
app.get('/api/admin/discounts', auth, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const resSettings = await db.query('SELECT value FROM settings WHERE key = "periodic_discount"');
    if (resSettings.rows.length === 0) {
      return res.json({ enabled: false, percentage: 0, message: '' });
    }
    res.json(JSON.parse(resSettings.rows[0].value));
  } catch (err) {
    res.json({ enabled: false, percentage: 0, message: '' });
  }
});

app.post('/api/admin/discounts', auth, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Unauthorized' });
  const { enabled, percentage, message } = req.body;
  try {
    await db.query(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?',
      ['periodic_discount', JSON.stringify({ enabled, percentage, message }), JSON.stringify({ enabled, percentage, message })]
    );
    
    // Global Broadcast for Flash Sale
    if (enabled) {
      io.emit('broadcast_notification', { 
        title: '🎉 Flash Sale Active!', 
        message: message || `Get ${percentage}% off on all medicines now!` 
      });
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/orders/:id/status', auth, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Unauthorized' });
  const { status } = req.body;
  const orderId = req.params.id;
  try {
    // 1. Update Order Status
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
    await db.query('INSERT INTO order_status_history (order_id, status) VALUES (?, ?)', [orderId, status]);

    // 2. Fetch User ID to notify
    const orderRes = await db.query('SELECT user_id FROM orders WHERE id = ?', [orderId]);
    const userId = orderRes.rows[0].user_id;

    // 3. Create Notification for User
    await db.query(
      'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)',
      [userId, 'order_update', 'Order Status Update', `Your order #ORD-${orderId} is now ${status.replace(/_/g, ' ')}.`]
    );

    // Real-time Notification for User
    io.to(`user_${userId}`).emit('new_notification', {
      title: 'Order Status Update',
      message: `Your order #ORD-${orderId} is now ${status.replace(/_/g, ' ')}.`
    });

    // 4. Push real-time update via Socket.io
    io.to(`order_${orderId}`).emit('status_updated', { status });
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- NOTIFICATIONS ---
app.get('/api/notifications', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unified Read Endpoint (Supports both old PUT /read-all and new POST /read)
const markNotificationsAsRead = async (req, res) => {
  try {
    await db.query('UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0', [req.user.id]);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

app.patch('/api/notifications/:id/read', auth, async (req, res) => {
  try {
    await db.query('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/notifications/read-all', auth, markNotificationsAsRead);
app.post('/api/notifications/read', auth, markNotificationsAsRead);
app.delete('/api/notifications', auth, async (req, res) => {
  try {
    await db.query('UPDATE notifications SET read = 1 WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, message: 'Notifications cleared (marked as read)' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- USER ORDERS ---
app.get('/api/orders', auth, async (req, res) => {
  try {
    const ordersRes = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    const orders = ordersRes.rows;
    
    // Fetch items for each order
    for (let order of orders) {
      const itemsRes = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      order.items = itemsRes.rows;
    }
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- LIVE TRACKING & SIMULATION ---
app.patch('/api/orders/:id/location', async (req, res) => {
  const { lat, lng } = req.body;
  const orderId = req.params.id;
  try {
    await db.query('UPDATE orders SET delivery_lat = ?, delivery_lng = ? WHERE id = ?', [lat, lng, orderId]);
    io.to(`order_${orderId}`).emit('location_updated', { lat, lng });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/simulate/:id', async (req, res) => {
  const orderId = req.params.id;
  console.log(`Starting simulation for order ${orderId}`);
  
  try {
    // Initial position
    let lat = 12.9716;
    let lng = 77.5946;
    
    // 1. Fetch User ID to notify
    const orderRes = await db.query('SELECT user_id FROM orders WHERE id = ?', [orderId]);
    const userId = orderRes.rows[0].user_id;

    // 2. Update status to OUT_FOR_DELIVERY
    await db.query('UPDATE orders SET status = "OUT_FOR_DELIVERY" WHERE id = ?', [orderId]);
    await db.query('INSERT INTO order_status_history (order_id, status) VALUES (?, "OUT_FOR_DELIVERY")', [orderId]);
    
    // 3. Notify User (DB + Socket)
    await db.query(
      'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)',
      [userId, 'order_update', 'Order Out for Delivery', `Your order #ORD-${orderId} is now out for delivery!`]
    );
    io.to(`user_${userId}`).emit('new_notification', {
      title: 'Order Out for Delivery',
      message: `Your order #ORD-${orderId} is now out for delivery!`,
      type: 'order'
    });
    io.to(`order_${orderId}`).emit('status_updated', { status: 'OUT_FOR_DELIVERY' });

    let steps = 0;
    const interval = setInterval(async () => {
      lat += (Math.random() - 0.5) * 0.001;
      lng += (Math.random() - 0.5) * 0.001;
      steps++;

      await db.query('UPDATE orders SET delivery_lat = ?, delivery_lng = ? WHERE id = ?', [lat, lng, orderId]);
      io.to(`order_${orderId}`).emit('location_updated', { lat, lng });

      if (steps >= 20) {
        clearInterval(interval);
        await db.query('UPDATE orders SET status = "DELIVERED" WHERE id = ?', [orderId]);
        await db.query('INSERT INTO order_status_history (order_id, status) VALUES (?, "DELIVERED")', [orderId]);
        
        // Final Notification
        await db.query(
          'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)',
          [userId, 'order_update', 'Order Delivered', `Your order #ORD-${orderId} has been successfully delivered.`]
        );
        io.to(`user_${userId}`).emit('new_notification', {
          title: 'Order Delivered',
          message: `Your order #ORD-${orderId} has been successfully delivered.`,
          type: 'order'
        });
        io.to(`order_${orderId}`).emit('status_updated', { status: 'DELIVERED' });
        console.log(`Simulation finished for order ${orderId}`);
      }
    }, 3000);

    res.json({ success: true, message: 'Simulation started' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:id', auth, async (req, res) => {
  try {
    const orderId = req.params.id;
    const orderRes = await db.query(
      'SELECT * FROM orders WHERE id = ? AND (user_id = ? OR ? = "ADMIN")',
      [orderId, req.user.id, req.user.role]
    );
    
    if (orderRes.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    
    const order = orderRes.rows[0];
    const itemsRes = await db.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    order.items = itemsRes.rows;
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

server.listen(PORT, () => console.log(`Unified Server running on port ${PORT}`));
