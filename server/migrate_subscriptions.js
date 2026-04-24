const db = require('./src/db');

async function migrate() {
  try {
    console.log('Migrating subscriptions table...');
    const columns = [
      'ALTER TABLE subscriptions ADD COLUMN medicine_name TEXT',
      'ALTER TABLE subscriptions ADD COLUMN frequency_days INTEGER',
      'ALTER TABLE subscriptions ADD COLUMN next_refill_date DATETIME'
    ];

    for (const sql of columns) {
      try {
        await db.query(sql);
      } catch (e) {
        console.log(`Skipping: ${e.message}`);
      }
    }
    console.log('Migration successful.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

migrate();
