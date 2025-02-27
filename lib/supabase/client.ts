import { createBrowserClient } from '@supabase/ssr';

import { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Use api schema for all environments
const schema = 'api';

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
  db: {
    schema,
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Add error event listener
supabase.auth.onAuthStateChange((event, session) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Supabase auth event:', event, session?.user?.id);
  }
});

// Add connection error logging
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('Supabase')) {
      console.error('Supabase connection error details:', {
        message: event.message,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    }
  });
}
