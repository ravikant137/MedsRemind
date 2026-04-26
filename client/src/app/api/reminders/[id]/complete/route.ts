import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.split(' ')[1];
    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const reminderId = params.id;

    // 1. Calculate Reward (5 to 10 coins)
    const coinsEarned = Math.floor(Math.random() * 6) + 5; // Random between 5 and 10

    // 2. Update the user's reward_coins in the database
    // We fetch current coins first to ensure we don't overwrite
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('reward_coins')
      .eq('id', user.id)
      .single();

    if (fetchError) throw fetchError;

    const newBalance = (userData.reward_coins || 0) + coinsEarned;

    const { error: updateError } = await supabase
      .from('users')
      .update({ reward_coins: newBalance })
      .eq('id', user.id);

    if (updateError) throw updateError;

    // 3. Mark the reminder as taken (Optional: add to a logs table)
    // For now, we just return the success
    
    return NextResponse.json({ 
      success: true, 
      pointsEarned: coinsEarned,
      newBalance: newBalance
    });
  } catch (err: any) {
    console.error('Complete reminder error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
