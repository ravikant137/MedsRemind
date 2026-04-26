// VERCEL_DEPLOY_VERIFICATION_V3
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;

    const { error } = await supabase
      .from('medicines')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Medicine deleted successfully' });
  } catch (err: any) {
    console.error('Delete medicine error:', err);
    return NextResponse.json({ error: 'Failed to delete medicine' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const { data, error } = await supabase
      .from('medicines')
      .update(body)
      .eq('id', id)
      .select();

    if (error) throw error;

    return NextResponse.json(data[0]);
  } catch (err: any) {
    console.error('Update medicine error:', err);
    return NextResponse.json({ error: 'Failed to update medicine' }, { status: 500 });
  }
}
