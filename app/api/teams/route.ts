import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

// GET /api/teams - Get all teams or teams for a specific flight
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const flightId = searchParams.get('flightId');

    let teams;
    if (flightId) {
      teams = await prisma.$queryRaw`
        SELECT t.*, f.name as flight_name, ty.year
        FROM api.teams t
        JOIN api.flights f ON t.flight_id = f.id
        JOIN api.tournament_years ty ON f.tournament_year_id = ty.id
        WHERE t.flight_id = ${flightId}::uuid
        ORDER BY t.name ASC
      `;
    } else {
      teams = await prisma.$queryRaw`
        SELECT t.*, f.name as flight_name, ty.year
        FROM api.teams t
        JOIN api.flights f ON t.flight_id = f.id
        JOIN api.tournament_years ty ON f.tournament_year_id = ty.id
        ORDER BY ty.year DESC, f.name ASC, t.name ASC
      `;
    }

    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

// POST /api/teams - Create a new team
export async function POST(request: NextRequest) {
  const authResult = await auth();
  
  // Only authenticated users can create teams
  if (!authResult.userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    
    // Validate input
    if (!data.name || !data.flightId) {
      return NextResponse.json(
        { error: 'Missing required fields: name and flightId' },
        { status: 400 }
      );
    }

    // Check if flight exists
    const flights = await prisma.$queryRaw`
      SELECT * FROM api.flights
      WHERE id = ${data.flightId}::uuid
    `;

    if (!flights || (flights as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Flight not found' },
        { status: 404 }
      );
    }

    // Create new team
    const newTeam = await prisma.$queryRaw`
      INSERT INTO api.teams (name, flight_id, created_at, updated_at)
      VALUES (${data.name}, ${data.flightId}::uuid, NOW(), NOW())
      RETURNING *
    `;

    return NextResponse.json((newTeam as any[])[0], { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
} 