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

    // 2. Security Check: Verify Prices & Recalculate Total
    let calculatedTotal = 0;
    for (const item of items) {
      const { data: med } = await supabase
        .from('medicines')
        .select('price, stock')
        .eq('id', item.id)
        .single();
      
      if (!med) return NextResponse.json({ error: `Medicine ${item.id} not found` }, { status: 400 });
      if (med.stock < item.quantity) return NextResponse.json({ error: `Insufficient stock for ${item.name}` }, { status: 400 });
      
      calculatedTotal += med.price * item.quantity;
    }

    // Allow for a tiny rounding difference (0.01)
    if (Math.abs(calculatedTotal - total_amount) > 0.1) {
      return NextResponse.json({ error: 'Security Alert: Price mismatch detected!' }, { status: 403 });
    }

    // 3. Create Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: shortId,
        user_id: decoded.id,
        user_name: decoded.name,
        total_amount: calculatedTotal, // Use our calculated total for security
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

    // 4. Atomic Stock Reduction
    for (const item of items) {
      await supabase.rpc('decrement_stock', { 
        med_id: item.id, 
        qty: item.quantity 
      });
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
