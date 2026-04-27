import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Smart Search: Try 3 different variants to ensure we find the order
    let order = null;
    let orderError = null;

    // 1. Try exact match (e.g., "ANJ-9939")
    const { data: exactOrder } = await supabase
      .from('orders')
      .select('*, users(name)')
      .eq('id', id)
      .single();
    
    if (exactOrder) {
      order = exactOrder;
    } else {
      // 2. Try with prefix (if it's just the number)
      const { data: prefixedOrder } = await supabase
        .from('orders')
        .select('*, users(name)')
        .eq('id', id.startsWith('ANJ-') ? id : `ANJ-${id}`)
        .single();
      
      if (prefixedOrder) {
        order = prefixedOrder;
      } else {
        // 3. Try without prefix (just in case the DB has plain IDs)
        const cleanId = id.replace('ANJ-', '');
        const { data: cleanOrder } = await supabase
          .from('orders')
          .select('*, users(name)')
          .eq('id', cleanId)
          .single();
        
        if (cleanOrder) {
          order = cleanOrder;
        }
      }
    }

    if (!order) {
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
