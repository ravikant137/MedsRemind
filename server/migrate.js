const db = require('./src/db');

async function migrate() {
  console.log('Migrating database...');
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_status_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        status TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id)
      )
    `);

    // In SQLite, adding columns is supported via ALTER TABLE ADD COLUMN
    try {
      await db.query(`ALTER TABLE orders ADD COLUMN deliveryLocation TEXT`);
    } catch (e) {
      console.log('deliveryLocation column might already exist:', e.message);
    }
    
    // We will ensure that the current orders table has their creation time stored as ORDER_PLACED in the history
    const existingOrders = await db.query(`SELECT id, created_at, status FROM orders`);
    for (const order of existingOrders.rows) {
      const history = await db.query(`SELECT id FROM order_status_history WHERE order_id = ?`, [order.id]);
      if (history.rows.length === 0) {
        let initialStatus = 'ORDER_PLACED';
        if (order.status === 'PENDING') {
           initialStatus = 'ORDER_PLACED';
           await db.query(`UPDATE orders SET status = ? WHERE id = ?`, [initialStatus, order.id]);
        } else {
           initialStatus = order.status;
        }
        await db.query(`INSERT INTO order_status_history (order_id, status, timestamp) VALUES (?, ?, ?)`, [order.id, initialStatus, order.created_at]);
      }
    }

    console.log('Migration successful');
  } catch (err) {
    console.error('Migration failed', err);
  } finally {
    process.exit(0);
  }
}
migrate();
