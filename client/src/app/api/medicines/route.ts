import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: medicines, error } = await supabase
      .from('medicines')
      .select('*')
      .gt('stock', 0);
      
    if (error) throw error;
    
    return NextResponse.json(medicines);
  } catch (err: any) {
    console.error('Fetch medicines error:', err);
    return NextResponse.json({ error: 'Failed to fetch medicines' }, { status: 500 });
  }
}
