import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

// GET /api/contests - Get all contests or contests for a specific tournament year
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentYearId = searchParams.get('tournamentYearId');

    let contests;
    if (tournamentYearId) {
      contests = await prisma.$queryRaw`
        SELECT c.*, ty.year
        FROM api.contests c
        JOIN api.tournament_years ty ON c.tournament_year_id = ty.id
        WHERE c.tournament_year_id = ${tournamentYearId}::uuid
        ORDER BY c.name ASC
      `;
    } else {
      contests = await prisma.$queryRaw`
        SELECT c.*, ty.year
        FROM api.contests c
        JOIN api.tournament_years ty ON c.tournament_year_id = ty.id
        ORDER BY ty.year DESC, c.name ASC
      `;
    }

    return NextResponse.json(contests);
  } catch (error) {
    console.error('Error fetching contests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contests' },
      { status: 500 }
    );
  }
}

// POST /api/contests - Create a new contest
export async function POST(request: NextRequest) {
  const authResult = await auth();
  
  // Only authenticated users can create contests
  if (!authResult.userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    
    // Validate input
    if (!data.name || !data.tournamentYearId) {
      return NextResponse.json(
        { error: 'Missing required fields: name and tournamentYearId' },
        { status: 400 }
      );
    }

    // Check if tournament year exists
    const tournamentYears = await prisma.$queryRaw`
      SELECT * FROM api.tournament_years
      WHERE id = ${data.tournamentYearId}::uuid
    `;

    if (!tournamentYears || (tournamentYears as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Tournament year not found' },
        { status: 404 }
      );
    }

    // Create new contest
    const newContest = await prisma.$queryRaw`
      INSERT INTO api.contests (name, tournament_year_id, created_at, updated_at)
      VALUES (${data.name}, ${data.tournamentYearId}::uuid, NOW(), NOW())
      RETURNING *
    `;

    return NextResponse.json((newContest as any[])[0], { status: 201 });
  } catch (error) {
    console.error('Error creating contest:', error);
    return NextResponse.json(
      { error: 'Failed to create contest' },
      { status: 500 }
    );
  }
} 