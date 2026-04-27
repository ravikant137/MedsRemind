const db = require('./server/src/db');
async function checkOrders() {
  try {
    const res = await db.query('SELECT id, total_amount, created_at FROM orders ORDER BY created_at DESC LIMIT 5');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
checkOrders();
