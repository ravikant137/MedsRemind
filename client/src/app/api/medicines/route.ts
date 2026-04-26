import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: medicines, error } = await supabase
      .from('medicines')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return NextResponse.json(medicines);
  } catch (err: any) {
    console.error('Fetch medicines error:', err);
    return NextResponse.json({ error: 'Failed to fetch medicines' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, composition, price, stock, category, description, image_url } = body;

    const { data, error } = await supabase
      .from('medicines')
      .insert([
        { name, composition, price, stock, category, description, image_url }
      ])
      .select();

    if (error) throw error;

    return NextResponse.json(data[0], { status: 201 });
  } catch (err: any) {
    console.error('Add medicine error:', err);
    return NextResponse.json({ error: 'Failed to add medicine' }, { status: 500 });
  }
}
