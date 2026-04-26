import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function PATCH(
  request: NextRequest,
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

    // Notify all ADMINS about the status change
    const { data: admins } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'ADMIN');

    if (admins && admins.length > 0) {
      const adminNotifications = admins.map(admin => ({
        user_id: admin.id,
        title: `Order Update: ${id}`,
        message: `Order #${id} has been moved to ${status.replace(/_/g, ' ')}.`,
        type: 'order'
      }));
      await supabase.from('notifications').insert(adminNotifications);
    }

    return NextResponse.json(data[0]);
  } catch (err: any) {
    console.error('Update order status error:', err);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
