import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    const medicines = await db.all('SELECT * FROM medicines WHERE stock > 0');
    return NextResponse.json(medicines);
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch medicines' }, { status: 500 });
  }
}
