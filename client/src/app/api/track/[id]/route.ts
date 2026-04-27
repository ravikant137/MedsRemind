import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Clean the ID (remove #ORD- or ANJ- prefixes)
    const cleanId = String(id).replace(/#ORD-|ANJ-|ORD-/, '').trim();

    // 1. Fetch Order Details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, users(name)')
      .eq('id', cleanId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 2. Fetch Order Items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', cleanId);

    // 3. Fetch Status History
    const { data: history, error: historyError } = await supabase
      .from('order_status_history')
      .select('status, created_at')
      .eq('order_id', cleanId)
      .order('created_at', { ascending: true });

    // Format the response to match what the frontend expects
    const response = {
      ...order,
      user_name: order.users?.name || 'Customer',
      items: items || [],
      statusHistory: history?.map(h => ({
        status: h.status,
        timestamp: h.created_at
      })) || [],
      // Default location if missing
      delivery_lat: order.delivery_lat || 12.9716,
      delivery_lng: order.delivery_lng || 77.5946
    };

    return NextResponse.json(response);
  } catch (err: any) {
    console.error('Track API Error:', err);
    return NextResponse.json({ error: 'Failed to fetch tracking details' }, { status: 500 });
  }
}
