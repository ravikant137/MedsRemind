const db = require('./src/db');

async function checkSchema() {
  try {
    const result = await db.query("PRAGMA table_info(orders)");
    console.log('Orders table schema:');
    console.log(result.rows);
    
    const orders = await db.query("SELECT * FROM orders LIMIT 5");
    console.log('Sample orders:');
    console.log(orders.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

checkSchema();
