import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: medicines, error } = await supabase
      .from('medicines')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;

    const { data: discountSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'periodic_discount')
      .single();

    const discount = discountSetting?.value || { enabled: false, percentage: 0 };

    const discountedMedicines = medicines.map(med => {
      const originalPrice = parseFloat(med.price) || 0;
      if (discount.enabled && discount.percentage > 0) {
        const discountAmount = (originalPrice * discount.percentage) / 100;
        return {
          ...med,
          original_price: originalPrice,
          price: Number((originalPrice - discountAmount).toFixed(2)), // Convert back to Number to avoid frontend crash
          discount_active: true,
          discount_percentage: discount.percentage,
          discount_message: discount.message
        };
      }
      return { 
        ...med, 
        price: originalPrice, // Ensure it's a number
        discount_active: false 
      };
    });
    
    return NextResponse.json(discountedMedicines);
  } catch (err: any) {
    console.error('Fetch medicines error:', err);
    return NextResponse.json({ error: 'Failed to fetch medicines' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, composition, price, stock, category, description, image_url } = body;

    const { data, error } = await supabase
      .from('medicines')
      .insert([
        { name, composition, price, stock, category, description, image_url }
      ])
      .select();

    if (error) throw error;

    return NextResponse.json(data[0], { status: 201 });
  } catch (err: any) {
    console.error('Add medicine error:', err);
    return NextResponse.json({ error: 'Failed to add medicine' }, { status: 500 });
  }
}
