import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // SECURITY FIX: Verify Identity
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized: Please log in to track' }, { status: 401 });
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
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

    // The medicines are already in the order.items column as a JSON string
    let items = [];
    try {
      items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
    } catch (e) {
      items = [];
    }

    // 2. Fetch Status History
    const { data: history } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', order.id)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      ...order,
      items: items,
      history: history || [],
      user_name: order.users?.name || 'Customer',
      statusHistory: history?.map(h => ({
        status: h.status,
        timestamp: h.created_at
      })) || [],
      // Pharmacy (Store) Location - Anjaneya Pharmacy
      store_lat: 12.9345, // Example coordinates for Bangalore
      store_lng: 77.6101,
      // Default location if missing
      delivery_lat: order.delivery_lat || 12.9716,
      delivery_lng: order.delivery_lng || 77.5946,
      distance_km: "4.2 km",
      est_time: "12 mins"
    });
  } catch (err: any) {
    console.error('Track API Error:', err);
    return NextResponse.json({ error: 'Failed to fetch tracking details' }, { status: 500 });
  }
}
