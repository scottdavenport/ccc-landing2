import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

import { Database } from './database.types';

export async function createClient() {
  const cookieStore = await cookies();
  
  // Determine if we're in a preview environment
  const isPreview = process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';
  // Use public schema for preview environments to avoid permission issues
  const schema = isPreview ? 'public' : 'api';
  
  console.log(`Supabase server client initialized with schema: ${schema}`);

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false, // Since this is server-side
      },
      db: {
        schema,
      },
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // Handle cookie errors in development
            console.error('Error setting cookie:', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 });
          } catch (error) {
            console.error('Error removing cookie:', error);
          }
        },
      },
    }
  );
}
