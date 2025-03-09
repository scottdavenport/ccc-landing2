import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

// GET /api/flights - Get all flights or flights for a specific tournament year
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentYearId = searchParams.get('tournamentYearId');

    let flights;
    if (tournamentYearId) {
      flights = await prisma.$queryRaw`
        SELECT * FROM api.flights
        WHERE tournament_year_id = ${tournamentYearId}::uuid
        ORDER BY name ASC
      `;
    } else {
      flights = await prisma.$queryRaw`
        SELECT f.*, ty.year 
        FROM api.flights f
        JOIN api.tournament_years ty ON f.tournament_year_id = ty.id
        ORDER BY ty.year DESC, f.name ASC
      `;
    }

    return NextResponse.json(flights);
  } catch (error) {
    console.error('Error fetching flights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flights' },
      { status: 500 }
    );
  }
}

// POST /api/flights - Create a new flight
export async function POST(request: NextRequest) {
  const authResult = await auth();
  
  // Only authenticated users can create flights
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

    // Create new flight
    const newFlight = await prisma.$queryRaw`
      INSERT INTO api.flights (name, tournament_year_id, created_at, updated_at)
      VALUES (${data.name}, ${data.tournamentYearId}::uuid, NOW(), NOW())
      RETURNING *
    `;

    return NextResponse.json((newFlight as any[])[0], { status: 201 });
  } catch (error) {
    console.error('Error creating flight:', error);
    return NextResponse.json(
      { error: 'Failed to create flight' },
      { status: 500 }
    );
  }
} 