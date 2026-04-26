import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.split(' ')[1];
    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { data, error } = await supabase
      .from('users')
      .select('reward_coins')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ points: data.reward_coins || 0 });
  } catch (err: any) {
    console.error('Fetch points error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
