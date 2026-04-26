import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reminderId } = await params;
    
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.split(' ')[1];
    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    // 1. Fetch the reminder to check scheduled time
    const { data: reminder, error: rError } = await supabase
      .from('reminders')
      .select('*')
      .eq('id', reminderId)
      .single();

    if (rError) throw rError;

    // 2. TIME-WINDOW LOGIC
    // Check if the current time is within +/- 1 hour of the remind_at time
    const now = new Date();
    const [hours, minutes] = (reminder.remind_at || '08:00:00').split(':');
    const scheduledTime = new Date();
    scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0);

    const diffInMinutes = Math.abs(now.getTime() - scheduledTime.getTime()) / (1000 * 60);
    
    // Reward Window: 60 minutes
    const isWithinWindow = diffInMinutes <= 60;
    const coinsEarned = isWithinWindow ? 10 : 0;

    // 3. Update the user's reward_coins
    if (coinsEarned > 0) {
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('reward_coins')
        .eq('id', user.id)
        .single();

      if (!fetchError) {
        const newBalance = (userData.reward_coins || 0) + coinsEarned;
        await supabase
          .from('users')
          .update({ reward_coins: newBalance })
          .eq('id', user.id);
      }
    }

    // 4. Update reminder status
    await supabase
      .from('reminders')
      .update({ 
        status: 'TAKEN', 
        taken_at: now.toISOString(),
        earned_reward: coinsEarned
      })
      .eq('id', reminderId);

    return NextResponse.json({ 
      success: true, 
      pointsEarned: coinsEarned,
      isLate: !isWithinWindow,
      message: isWithinWindow ? 'Perfect timing! You earned 10 coins!' : 'Medicine taken, but late. No coins earned this time.'
    });
  } catch (err: any) {
    console.error('Complete reminder error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
