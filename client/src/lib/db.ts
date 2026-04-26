import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let db: any = null;

export async function getDb() {
  if (db) return db;
  
  // Use a persistent path for local dev, and a temp path for Vercel 
  // (Note: Vercel resets SQLite data on every deploy)
  const dbPath = process.env.NODE_ENV === 'production' 
    ? '/tmp/database.sqlite' 
    : path.join(process.cwd(), '../server/database.sqlite');

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
  
  // Initialize tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'USER'
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      total_amount REAL,
      address TEXT,
      payment_id TEXT,
      payment_status TEXT,
      status TEXT DEFAULT 'ORDER_PLACED',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS medicines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      composition TEXT,
      price REAL,
      stock INTEGER,
      category TEXT,
      description TEXT,
      image TEXT
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      type TEXT,
      title TEXT,
      message TEXT,
      read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  return db;
}
