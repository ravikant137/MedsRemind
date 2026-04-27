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
    const userId = decoded.id;
    
    // Mark all unread notifications as read for this user
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
      .select();

    console.log(`Marked ${data?.length || 0} notifications as read for user ${userId}`);

    if (error) {
      console.error('Supabase Update Error:', error);
      // Fallback
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId);
    }
    
    return NextResponse.json({ success: true, message: 'All notifications cleared' });
  } catch (err: any) {
    console.error('Mark as read error:', err);
    return NextResponse.json({ error: 'Failed to clear notifications' }, { status: 500 });
  }
}
