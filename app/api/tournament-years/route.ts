import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

// GET /api/tournament-years - Get all tournament years
export async function GET(request: NextRequest) {
  try {
    const tournamentYears = await prisma.$queryRaw`
      SELECT * FROM api.tournament_years
      ORDER BY year DESC
    `;

    return NextResponse.json(tournamentYears);
  } catch (error) {
    console.error('Error fetching tournament years:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournament years' },
      { status: 500 }
    );
  }
}

// POST /api/tournament-years - Create a new tournament year
export async function POST(request: NextRequest) {
  const authResult = await auth();
  
  // Only authenticated users can create tournament years
  if (!authResult.userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    
    // Validate input
    if (!data.year || typeof data.year !== 'number' || data.year < 1900 || data.year > 2100) {
      return NextResponse.json(
        { error: 'Invalid year provided' },
        { status: 400 }
      );
    }

    // Check if year already exists
    const existingYears = await prisma.$queryRaw`
      SELECT * FROM api.tournament_years
      WHERE year = ${data.year}
    `;

    if (existingYears && (existingYears as any[]).length > 0) {
      return NextResponse.json(
        { error: 'Tournament year already exists' },
        { status: 409 }
      );
    }

    // Create new tournament year
    const newTournamentYear = await prisma.$queryRaw`
      INSERT INTO api.tournament_years (year, created_at, updated_at)
      VALUES (${data.year}, NOW(), NOW())
      RETURNING *
    `;

    return NextResponse.json((newTournamentYear as any[])[0], { status: 201 });
  } catch (error) {
    console.error('Error creating tournament year:', error);
    return NextResponse.json(
      { error: 'Failed to create tournament year' },
      { status: 500 }
    );
  }
} 