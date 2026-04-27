import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || 'anjaneya_secret_key';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Update notification error:', err);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
