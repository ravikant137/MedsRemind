const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// Use an absolute path that is stable across WSL/Windows when possible
// If running from server/ directory, this will point to server/database.sqlite
const DB_PATH = path.resolve(__dirname, '../../database.sqlite');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log(`Connected to the SQLite database at: ${DB_PATH}`);
  }
});

// Helper to run queries with promises
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    // PRAGMA and SELECT use .all
    if (sql.trim().toLowerCase().startsWith('select') || sql.trim().toLowerCase().startsWith('pragma')) {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve({ rows: rows || [] });
      });
    } else {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ rows: [], lastID: this.lastID, changes: this.changes });
      });
    }
  });
};

module.exports = {
  query,
  db,
};
