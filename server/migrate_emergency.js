const db = require('./src/db');

async function migrate() {
  try {
    console.log('Adding is_emergency column to orders table...');
    await db.query('ALTER TABLE orders ADD COLUMN is_emergency BOOLEAN DEFAULT 0');
    console.log('Migration successful.');
  } catch (err) {
    if (err.message.includes('duplicate column name')) {
      console.log('Column is_emergency already exists.');
    } else {
      console.error('Migration failed:', err);
    }
  } finally {
    process.exit(0);
  }
}

migrate();
