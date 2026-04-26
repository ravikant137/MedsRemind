import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { name, email, password, phone, address } = await request.json();
    
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
      
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const { data, error } = await supabase
      .from('users')
      .insert([
        { 
          name, 
          email, 
          password: hashedPassword, 
          role: 'USER',
          phone: phone || null,
          address: address || null
        }
      ])
      .select();
      
    if (error) {
      console.error('Supabase Insert Error:', error);
      return NextResponse.json({ error: `Database Error: ${error.message} (Code: ${error.code})` }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'User created successfully', user: data[0] }, { status: 201 });
  } catch (err: any) {
    console.error('Signup crash:', err);
    return NextResponse.json({ error: `System Error: ${err.message || 'Unknown error'}` }, { status: 500 });
  }
}
