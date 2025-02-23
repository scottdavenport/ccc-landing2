import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Get the current branch name from environment variable, default to 'main' if not set
const branch = process.env.NEXT_PUBLIC_SUPABASE_BRANCH || 'main';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: branch
  }
});
