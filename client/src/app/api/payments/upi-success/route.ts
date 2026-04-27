import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || 'anjaneya_secret_key';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.split(' ')[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { items, total_amount, address, discount_amount, upi_id } = await request.json();

    // 1. Create the Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: decoded.id,
        total_amount,
        address,
        status: 'CONFIRMED', // UPI payments are confirmed immediately
        payment_method: 'UPI',
        upi_id: upi_id,
        discount_applied: discount_amount || 0,
        payment_status: 'PAID'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Create Order Items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      medicine_id: item.id,
      medicine_name: item.name,
      quantity: item.quantity,
      price_at_time: item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // 3. Create initial status history
    await supabase.from('order_status_history').insert([
      { order_id: order.id, status: 'ORDER_PLACED' },
      { order_id: order.id, status: 'CONFIRMED' }
    ]);

    // 4. Create notification for the user
    await supabase.from('notifications').insert({
      user_id: decoded.id,
      title: 'Order Confirmed! 🚀',
      message: `Your order ANJ-${order.id} has been successfully placed via UPI.`,
      type: 'ORDER_STATUS'
    });

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      message: 'Payment successful and order placed.' 
    });

  } catch (err: any) {
    console.error('UPI Payment Success API Error:', err);
    return NextResponse.json({ error: 'Failed to process UPI payment order' }, { status: 500 });
  }
}
