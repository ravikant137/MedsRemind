import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'anjaneya_secret_key';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const db = await getDb();
    
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET);
    
    return NextResponse.json({ 
      token, 
      user: { id: user.id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
