import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.error('Supabase Client Error: Missing credentials in browser. Ensure NEXT_PUBLIC_ variables are set in Vercel.');
  }
}

// Create the standard client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create the admin client (only works on server-side)
export const supabaseAdmin = (supabaseServiceKey && supabaseUrl)
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase;
