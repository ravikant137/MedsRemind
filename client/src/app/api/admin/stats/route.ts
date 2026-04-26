import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // In a real app, you'd check for ADMIN role here using JWT
    
    const [
      { count: medicineCount },
      { count: userCount },
      { data: orders }
    ] = await Promise.all([
      supabase.from('medicines').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('total_amount')
    ]);

    const totalRevenue = orders?.reduce((acc, order) => acc + (Number(order.total_amount) || 0), 0) || 0;
    const totalOrders = orders?.length || 0;

    return NextResponse.json({
      revenue: totalRevenue,
      orders: totalOrders,
      users: userCount || 0,
      medicines: medicineCount || 0
    });
  } catch (err: any) {
    console.error('Fetch stats error:', err);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
