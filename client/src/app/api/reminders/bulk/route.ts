import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.split(' ')[1];
    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { medicines } = await request.json();
    if (!medicines || !Array.isArray(medicines)) {
      return NextResponse.json({ error: 'Invalid medicines data' }, { status: 400 });
    }

    // Map medicines to reminder format
    const reminders = medicines.map(med => ({
      user_id: user.id,
      medicine_name: med.name,
      dosage: med.dosage || '1 pill',
      schedule: med.frequency || '1-0-1',
      timing: med.timing || 'After Food',
      is_active: true,
      created_at: new Date().toISOString()
    }));

    const { error } = await supabase.from('reminders').insert(reminders);

    if (error) throw error;

    return NextResponse.json({ success: true, count: reminders.length });
  } catch (err: any) {
    console.error('Bulk reminders error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
