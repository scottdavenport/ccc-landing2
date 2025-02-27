import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Get Supabase credentials from environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const branch = process.env.NEXT_PUBLIC_SUPABASE_BRANCH;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          error: 'Missing Supabase credentials',
          details: {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseKey,
            branch,
          },
        },
        { status: 500 }
      );
    }

    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'api',
      },
    });

    // Test connection by getting the count of sponsors
    const { data: sponsorsCount, error: sponsorsError } = await supabase
      .from('sponsors')
      .select('count');

    // Test connection by getting the count of sponsor_levels
    const { data: levelsCount, error: levelsError } = await supabase
      .from('sponsor_levels')
      .select('count');

    // Check if we can get the current user (should be null for anon)
    const { data: authData, error: authError } = await supabase.auth.getUser();

    return NextResponse.json({
      status: 'success',
      environment: process.env.NODE_ENV,
      branch,
      supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      sponsors: {
        data: sponsorsCount,
        error: sponsorsError ? { message: sponsorsError.message, code: sponsorsError.code } : null,
      },
      sponsorLevels: {
        data: levelsCount,
        error: levelsError ? { message: levelsError.message, code: levelsError.code } : null,
      },
      auth: {
        user: authData?.user ? { id: authData.user.id, email: authData.user.email } : null,
        error: authError ? { message: authError.message, name: authError.name } : null,
      },
    });
  } catch (error) {
    console.error('Diagnostic error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
