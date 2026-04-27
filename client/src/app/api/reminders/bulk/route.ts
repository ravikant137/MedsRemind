import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

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

    // Map medicines to reminder format using only existing columns
    const reminders = medicines.map(med => ({
      user_id: user.id,
      medicine_name: med.name,
      dosage: med.dosage || '1 dose',
      frequency: med.frequency || '1-0-1',
      timing: med.timing || 'After Food',
      duration: med.duration || '5 Days',
      total_doses: (med.total_days || 5) * (med.doses_per_day || 3),
      remaining_doses: (med.total_days || 5) * (med.doses_per_day || 3),
      doses_per_day: med.doses_per_day || 3,
      status: 'ACTIVE',
      created_at: new Date().toISOString()
    }));

    const { error } = await supabase.from('reminders').insert(reminders);

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: reminders.length });
  } catch (err: any) {
    console.error('Bulk reminders error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
