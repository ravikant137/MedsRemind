const db = require('./src/db');
const bcrypt = require('bcryptjs');

async function init() {
  console.log('Initializing database...');

  const schema = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'USER',
      points INTEGER DEFAULT 0,
      phone TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS medicines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      composition TEXT,
      price REAL NOT NULL,
      stock INTEGER DEFAULT 0,
      category TEXT,
      description TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'PENDING',
      payment_status TEXT DEFAULT 'UNPAID',
      address TEXT,
      is_emergency BOOLEAN DEFAULT 0,
      deliveryLocation TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS order_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      status TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )`,
    `CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      medicine_id INTEGER,
      quantity INTEGER NOT NULL,
      price_at_time REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (medicine_id) REFERENCES medicines(id)
    )`,
    `CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      medicine_name TEXT NOT NULL,
      dosage TEXT,
      timings TEXT NOT NULL,
      start_date TEXT NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      medicine_name TEXT NOT NULL,
      dosage TEXT,
      time TEXT NOT NULL,
      frequency TEXT,
      suggestion TEXT,
      status TEXT DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      medicine_name TEXT,
      frequency_days INTEGER,
      next_refill_date DATETIME,
      plan_name TEXT,
      price REAL,
      status TEXT DEFAULT 'ACTIVE',
      start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      end_date DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      type TEXT DEFAULT 'info',
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`
  ];

  try {
    for (const sql of schema) {
      await db.query(sql);
    }

    // Seed Data
    const medicines = [
      ['Paracetamol 500mg', 'Paracetamol', 12.50, 100, 'Fever', 'Effective pain reliever.'],
      ['Amoxicillin 250mg', 'Amoxicillin', 45.00, 50, 'Antibiotic', 'Bacterial infection treatment.'],
      ['Cetirizine 10mg', 'Cetirizine', 18.00, 80, 'Allergy', 'Allergy relief.'],
      ['Ibuprofen 400mg', 'Ibuprofen', 22.00, 120, 'Pain Relief', 'Anti-inflammatory.']
    ];

    for (const med of medicines) {
      await db.query(
        'INSERT OR IGNORE INTO medicines (name, composition, price, stock, category, description) VALUES (?, ?, ?, ?, ?, ?)',
        med
      );
    }

    // Default Admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.query(
      'INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Admin', 'admin@smartpharmacy.com', hashedPassword, 'ADMIN']
    );

    console.log('Database initialized successfully.');

    // Attempt to alter table if columns are missing (safe to fail if they exist)
    try {
      await db.query("ALTER TABLE orders ADD COLUMN is_emergency BOOLEAN DEFAULT 0");
    } catch (e) {}
    try {
      await db.query("ALTER TABLE orders ADD COLUMN deliveryLocation TEXT");
    } catch (e) {}
    try {
      await db.query("ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0");
    } catch (e) {}

  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    process.exit(0);
  }
}

init();
