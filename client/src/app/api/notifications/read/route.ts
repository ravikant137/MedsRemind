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
    
    // Mark all unread notifications as read for this user
    // We use a broad update to ensure everything is cleared
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .match({ user_id: decoded.id, read: false });

    if (error) {
      console.error('Supabase Update Error:', error);
      // Fallback: try update without the read:false filter in case of state mismatch
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', decoded.id);
    }
    
    return NextResponse.json({ success: true, message: 'All notifications cleared' });
  } catch (err: any) {
    console.error('Mark as read error:', err);
    return NextResponse.json({ error: 'Failed to clear notifications' }, { status: 500 });
  }
}
