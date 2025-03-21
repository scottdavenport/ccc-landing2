import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { type DatabaseError, type TournamentYear, type RequestHandler } from '../../../lib/types';

export const dynamic = 'force-dynamic';

// GET /api/tournament-years - Get all tournament years
export const GET: RequestHandler = async (_request: NextRequest) => {
  try {
    // Fetch all tournament years
    const result = await prisma.$queryRaw<TournamentYear[]>`
      SELECT 
        id,
        year,
        created_at,
        updated_at
      FROM api.tournament_years
      ORDER BY year DESC
    `;

    // Ensure year is returned as a number (not a string)
    const typedResult = result.map(year => ({
      ...year,
      year: Number(year.year)
    }));

    return NextResponse.json(typedResult, { status: 200 });
  } catch (error) {
    console.error("Error fetching tournament years:", error);
    // Return more detailed error information
    return NextResponse.json({ 
      error: "Failed to fetch tournament years",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
};

// POST /api/tournament-years - Create a new tournament year
export const POST: RequestHandler = async (request: NextRequest) => {
  // Check if user is authenticated
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get year from request body
    const data = await request.json();
    const { year } = data;

    // Check if year is provided and is a number
    if (year === undefined || year === null) {
      return NextResponse.json({ error: "Missing required field: year" }, { status: 400 });
    }
    
    if (typeof year !== 'number' && isNaN(Number(year))) {
      return NextResponse.json({ error: "Year must be a valid number" }, { status: 400 });
    }

    const yearNumber = Number(year);

    // Check if year already exists
    const existingYear = await prisma.$queryRaw<TournamentYear[]>`
      SELECT id FROM api.tournament_years WHERE year = ${yearNumber}
    `;

    if (existingYear.length > 0) {
      return NextResponse.json({ error: "Tournament year already exists" }, { status: 409 });
    }

    // Create new tournament year
    const result = await prisma.$queryRaw<TournamentYear[]>`
      INSERT INTO api.tournament_years (year, created_at, updated_at)
      VALUES (${yearNumber}, NOW(), NOW())
      RETURNING id, year, created_at, updated_at
    `;

    // Ensure year is returned as a number
    const newTournamentYear = {
      ...result[0],
      year: Number(result[0].year)
    };

    // Return the created tournament year
    return NextResponse.json(newTournamentYear, { status: 201 });
  } catch (error) {
    const dbError = error as DatabaseError;
    console.error("Error creating tournament year:", dbError.message);
    return NextResponse.json({ 
      error: "Failed to create tournament year",
      message: dbError.message,
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    }, { status: 500 });
  }
}; 