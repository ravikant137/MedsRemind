import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Fetch single order error:', error);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
