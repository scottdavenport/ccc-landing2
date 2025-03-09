import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { type DatabaseError, type Flight, type TournamentYear, type RequestHandler } from '../../../lib/types';

export const dynamic = 'force-dynamic';

// GET /api/flights - Get all flights or flights for a specific tournament year
export const GET: RequestHandler = async (request: NextRequest) => {
  // Get tournament year ID from the query parameters
  const { searchParams } = new URL(request.url);
  const tournamentYearId = searchParams.get('tournamentYearId');

  try {
    let query;
    
    if (tournamentYearId) {
      // Fetch flights for the specific tournament year
      query = prisma.$queryRaw<Flight[]>`
        SELECT 
          f.id,
          f.name,
          f.tournament_year_id,
          ty.year as tournament_year_name,
          f.created_at,
          f.updated_at
        FROM flight f
        JOIN tournament_year ty ON f.tournament_year_id = ty.id
        WHERE f.tournament_year_id = ${tournamentYearId}
        ORDER BY f.name
      `;
    } else {
      // Fetch all flights
      query = prisma.$queryRaw<Flight[]>`
        SELECT 
          f.id,
          f.name,
          f.tournament_year_id,
          ty.year as tournament_year_name,
          f.created_at,
          f.updated_at
        FROM flight f
        JOIN tournament_year ty ON f.tournament_year_id = ty.id
        ORDER BY ty.year DESC, f.name
      `;
    }

    const flights = await query;
    
    return NextResponse.json(flights, { status: 200 });
  } catch (error) {
    console.error("Error fetching flights:", error);
    return NextResponse.json({ error: "Failed to fetch flights" }, { status: 500 });
  }
};

// POST /api/flights - Create a new flight
export const POST: RequestHandler = async (request: NextRequest) => {
  // Check if user is authenticated
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get data from request body
    const data = await request.json();
    const { name, tournamentYearId } = data;

    // Check if required fields are provided
    if (!name) {
      return NextResponse.json({ error: "Missing required field: name" }, { status: 400 });
    }

    if (!tournamentYearId) {
      return NextResponse.json({ error: "Missing required field: tournamentYearId" }, { status: 400 });
    }

    // Check if tournament year exists
    const tournamentYear = await prisma.$queryRaw<TournamentYear[]>`
      SELECT id FROM tournament_year WHERE id = ${tournamentYearId}
    `;

    if (!tournamentYear.length) {
      return NextResponse.json({ error: "Tournament year not found" }, { status: 404 });
    }

    // Create new flight
    const flight = await prisma.$queryRaw<Flight[]>`
      INSERT INTO flight (name, tournament_year_id, created_at, updated_at)
      VALUES (${name}, ${tournamentYearId}, NOW(), NOW())
      RETURNING id, name, tournament_year_id, created_at, updated_at
    `;

    return NextResponse.json(flight[0], { status: 201 });
  } catch (error) {
    const dbError = error as DatabaseError;
    console.error("Error creating flight:", dbError.message);
    return NextResponse.json({ error: "Failed to create flight" }, { status: 500 });
  }
}; 