import { NextResponse } from 'next/server';
import { sql } from '@/lib/neon/server-client';

export async function POST(request: Request) {
  try {
    const { sql: sqlQuery, params } = await request.json();

    if (!sqlQuery) {
      return NextResponse.json({ error: 'SQL query is required' }, { status: 400 });
    }

    // Execute the query
    const result = await sql(sqlQuery, params || []);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json(
      { error: 'Database query failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 