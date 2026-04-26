import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function getDb() {
  return open({
    filename: path.join(process.cwd(), '../server/database.sqlite'),
    driver: sqlite3.Database
  });
}

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    const db = await getDb();
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'USER']
    );
    
    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Registration failed' }, { status: 500 });
  }
}
