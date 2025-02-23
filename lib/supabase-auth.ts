import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const createClient = () => {
  console.log('Creating Supabase client with:', {
    url: supabaseUrl,
    hasKey: !!supabaseAnonKey
  });
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
