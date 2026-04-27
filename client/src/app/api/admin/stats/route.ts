import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    // SECURITY FIX: Verify Admin Token
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'ALL'; // DAY, WEEK, MONTH, QUARTER, YEAR, ALL

    let query = supabase.from('orders').select('total_amount, created_at, items');

    if (range !== 'ALL') {
      const now = new Date();
      let startDate = new Date();

      if (range === 'DAY') startDate.setHours(0, 0, 0, 0);
      else if (range === 'WEEK') startDate.setDate(now.getDate() - 7);
      else if (range === 'MONTH') startDate.setMonth(now.getMonth() - 1);
      else if (range === 'QUARTER') startDate.setMonth(now.getMonth() - 3);
      else if (range === 'YEAR') startDate.setFullYear(now.getFullYear() - 1);

      query = query.gte('created_at', startDate.toISOString());
    }

    const [
      { count: medicineCount },
      { count: userCount },
      { data: orders }
    ] = await Promise.all([
      supabase.from('medicines').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      query
    ]);

    const totalRevenue = orders?.reduce((acc, order) => acc + (Number(order.total_amount) || 0), 0) || 0;
    const totalOrders = orders?.length || 0;

    // Calculate category distribution (Mock logic based on order items)
    // In a real app, you'd have a categories column
    const categories: Record<string, number> = {
      'Antibiotics': 0, 'Pain Relief': 0, 'Vitamins': 0, 'Others': 0
    };

    orders?.forEach(order => {
      try {
        const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
        items.forEach((item: any) => {
          const cat = item.category || 'Others';
          if (categories[cat] !== undefined) categories[cat]++;
          else categories['Others']++;
        });
      } catch (e) {}
    });

    return NextResponse.json({
      revenue: totalRevenue,
      orders: totalOrders,
      users: userCount || 0,
      medicines: medicineCount || 0,
      categoryDistribution: categories
    });
  } catch (err: any) {
    console.error('Fetch stats error:', err);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
