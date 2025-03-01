import { NextResponse } from 'next/server';
import { checkConnection } from '@/lib/neon/improved-server-client';

export async function GET() {
  try {
    const isConnected = await checkConnection();
    
    return NextResponse.json({ connected: isConnected });
  } catch (error) {
    console.error('Database connection check error:', error);
    return NextResponse.json(
      { connected: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 