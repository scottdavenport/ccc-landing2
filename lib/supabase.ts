import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Get environment information
const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;
const gitRef = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF;

// Use api schema for all environments
const schema = 'api';

console.log('Supabase Client Config:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  schema,
  vercelEnv,
  gitRef
});

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Add error event listener
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth event:', event, session?.user?.id);
});
