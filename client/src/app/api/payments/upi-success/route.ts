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

    // 1. Generate a shorter, human-readable Order ID (e.g. ANJ-1234)
    const shortId = `ANJ-${Math.floor(1000 + Math.random() * 9000)}`;

    // 2. Create the Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: shortId,
        user_id: decoded.id,
        user_name: decoded.name,
        total_amount,
        address,
        status: 'CONFIRMED',
        items: JSON.stringify(items)
      })
      .select()
      .single();

    if (orderError) {
      console.error('UPI Order Error:', orderError);
      throw orderError;
    }

    // 3. Decrease Stock
    try {
      for (const item of items) {
        if (item.id) {
          const { data: med } = await supabase.from('medicines').select('stock').eq('id', item.id).single();
          if (med) {
            const newStock = Math.max(0, med.stock - (item.quantity || 1));
            await supabase.from('medicines').update({ stock: newStock }).eq('id', item.id);
          }
        }
      }
    } catch (stockErr) {
      console.error('Stock Update Error:', stockErr);
    }

    // 4. Create initial status history
    await supabase.from('order_status_history').insert([
      { order_id: order.id, status: 'ORDER_PLACED' },
      { order_id: order.id, status: 'CONFIRMED' }
    ]);

    // 5. Create notifications
    await supabase.from('notifications').insert({
      user_id: decoded.id,
      title: 'Order Confirmed! 🚀',
      message: `Your order ${order.id} has been successfully placed via UPI.`,
      type: 'order'
    });

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      message: 'Payment successful and order placed.' 
    });

  } catch (err: any) {
    console.error('UPI Payment Route Error:', err);
    return NextResponse.json({ 
      error: err.message || 'Failed to process UPI payment order',
      details: err.details || ''
    }, { status: 500 });
  }
}
