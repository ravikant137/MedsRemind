const db = require('./src/db');

async function checkOrders() {
  try {
    const res = await db.query("SELECT id FROM orders ORDER BY id DESC LIMIT 10");
    console.log("Recent Order IDs:", res.rows.map(r => r.id));
    
    const check21 = await db.query("SELECT id FROM orders WHERE id = 21");
    console.log("Does ID 21 exist?", check21.rows.length > 0 ? "YES" : "NO");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkOrders();
