import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { type DatabaseError, type TournamentYear, type RequestHandler } from '../../../lib/types';
import { Prisma } from '@prisma/client';

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
      FROM tournament_year
      ORDER BY year DESC
    `;

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching tournament years:", error);
    return NextResponse.json({ error: "Failed to fetch tournament years" }, { status: 500 });
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

    // Check if year is provided
    if (!year) {
      return NextResponse.json({ error: "Missing required field: year" }, { status: 400 });
    }

    // Check if year already exists
    const existingYear = await prisma.$queryRaw<TournamentYear[]>`
      SELECT id FROM tournament_year WHERE year = ${year}
    `;

    if (existingYear.length > 0) {
      return NextResponse.json({ error: "Tournament year already exists" }, { status: 409 });
    }

    // Create new tournament year
    const result = await prisma.$queryRaw<TournamentYear[]>`
      INSERT INTO tournament_year (year, created_at, updated_at)
      VALUES (${year}, NOW(), NOW())
      RETURNING id, year, created_at, updated_at
    `;

    // Return the created tournament year
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    const dbError = error as DatabaseError;
    console.error("Error creating tournament year:", dbError.message);
    return NextResponse.json({ error: "Failed to create tournament year" }, { status: 500 });
  }
}; 