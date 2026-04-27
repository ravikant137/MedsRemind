const db = require('./src/db');

async function migrate() {
  try {
    await db.query("ALTER TABLE orders ADD COLUMN delivery_lat REAL");
    await db.query("ALTER TABLE orders ADD COLUMN delivery_lng REAL");
    console.log("Migration successful: Added delivery_lat and delivery_lng to orders table.");
  } catch (err) {
    console.error("Migration failed or columns already exist:", err.message);
  } finally {
    process.exit(0);
  }
}

migrate();
