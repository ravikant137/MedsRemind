import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || 'anjaneya_secret_key';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    const { items, total_amount, address } = await request.json();
    
    // Generate a shorter, human-readable Order ID (e.g. ANJ-1234)
    const shortId = `ANJ-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: shortId,
        user_id: decoded.id,
        user_name: decoded.name,
        total_amount,
        address,
        status: 'ORDER_PLACED',
        payment_status: 'PENDING',
        payment_method: 'COD',
        items: JSON.stringify(items)
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Add a notification for the user
    await supabase.from('notifications').insert({
      user_id: decoded.id,
      title: 'Order Placed Successfully',
      message: `Your order #${order.id} for ₹${total_amount} has been placed.`,
      type: 'order'
    });

    // Notify all ADMINS about the new order
    const { data: admins } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'ADMIN');

    if (admins && admins.length > 0) {
      const adminNotifications = admins.map(admin => ({
        user_id: admin.id,
        title: 'New Order Received! 🚨',
        message: `A new order (${order.id}) has been placed by ${decoded.name || 'a customer'} for ₹${total_amount}.`,
        type: 'order'
      }));
      await supabase.from('notifications').insert(adminNotifications);
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (err: any) {
    console.error('COD Order Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', decoded.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
