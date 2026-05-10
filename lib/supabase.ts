// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Get env vars with fallbacks for debugging
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Debug: Log if vars are missing (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('=== Supabase Env Check ===');
  console.log('URL present:', !!supabaseUrl);
  console.log('Anon Key present:', !!supabaseAnonKey);
  console.log('Service Key present:', !!supabaseServiceKey);
  console.log('==========================');
}

// Throw clear error if critical vars missing
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase environment variables missing. Check .env.local:\n' +
    'NEXT_PUBLIC_SUPABASE_URL=...\n' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=...'
  );
}

// Client for browser (anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client for server (service role - bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: { persistSession: false },
});