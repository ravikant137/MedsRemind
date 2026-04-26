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
    const result = await db.query('SELECT * FROM medicines WHERE stock > 0');
    res.json(result.rows);
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
      const { items, total_amount, address } = orderDetails;
      const orderResult = await db.query(
        'INSERT INTO orders (user_id, total_amount, address, payment_id, payment_status, status) VALUES (?, ?, ?, ?, ?, ?)',
        [req.user.id, total_amount, address, razorpay_payment_id, 'PAID', 'ORDER_PLACED']
      );
      const orderId = orderResult.lastID;
      
      await db.query(
        'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)',
        [req.user.id, 'order_placed', 'Order Placed Successfully', `Your order #ORD-${orderId} has been received.`]
      );

      await db.query('INSERT INTO order_status_history (order_id, status) VALUES (?, ?)', [orderId, 'ORDER_PLACED']);
      for (let item of items) {
        await db.query(
          'INSERT INTO order_items (order_id, medicine_id, medicine_name, quantity, price_at_time) VALUES (?, ?, ?, ?, ?)',
          [orderId, item.id, item.name, item.quantity, item.price]
        );
        await db.query('UPDATE medicines SET stock = stock - ? WHERE id = ?', [item.quantity, item.id]);
      }
      res.json({ success: true, orderId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(400).json({ success: false, message: 'Invalid signature' });
  }
});

// --- TRACKING ---
app.get('/api/track/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const orderResult = await db.query(
      'SELECT o.*, u.name as user_name FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?',
      [orderId]
    );
    if (orderResult.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    const order = orderResult.rows[0];
    const itemsResult = await db.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    const historyResult = await db.query('SELECT status, created_at AS timestamp FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC', [orderId]);
    order.items = itemsResult.rows;
    order.statusHistory = historyResult.rows;
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- COD ORDERS ---
app.post('/api/orders/cod', auth, async (req, res) => {
  try {
    const { items, total_amount, address } = req.body;
    const orderResult = await db.query(
      'INSERT INTO orders (user_id, total_amount, address, payment_status, status) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, total_amount, address, 'COD_PENDING', 'ORDER_PLACED']
    );
    const orderId = orderResult.lastID;

    await db.query(
      'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)',
      [req.user.id, 'order_placed', 'Order Placed Successfully', `Your COD order #ORD-${orderId} has been received.`]
    );

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
  try {
    const result = await db.query('SELECT o.*, u.name as user_name FROM orders o JOIN users u ON o.user_id = u.id ORDER BY created_at DESC');
    res.json(result.rows);
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

app.put('/api/notifications/read-all', auth, async (req, res) => {
  try {
    await db.query('UPDATE notifications SET read = 1 WHERE user_id = ?', [req.user.id]);
    res.json({ success: true });
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
