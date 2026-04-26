import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) throw error;

    return NextResponse.json(data[0]);
  } catch (err: any) {
    console.error('Update order status error:', err);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
