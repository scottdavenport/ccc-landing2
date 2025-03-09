import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { type DatabaseError, type Team, type Flight, type RequestHandler } from '../../../lib/types';

export const dynamic = 'force-dynamic';

// GET /api/teams - Get all teams or teams for a specific flight
export const GET: RequestHandler = async (request: NextRequest) => {
  // Get flight ID from the query parameters
  const { searchParams } = new URL(request.url);
  const flightId = searchParams.get('flightId');

  try {
    let query;
    
    if (flightId) {
      // Fetch teams for the specific flight
      query = prisma.$queryRaw<Team[]>`
        SELECT 
          t.id,
          t.name,
          t.flight_id,
          f.name as flight_name,
          t.created_at,
          t.updated_at
        FROM team t
        JOIN flight f ON t.flight_id = f.id
        WHERE t.flight_id = ${flightId}
        ORDER BY t.name
      `;
    } else {
      // Fetch all teams
      query = prisma.$queryRaw<Team[]>`
        SELECT 
          t.id,
          t.name,
          t.flight_id,
          f.name as flight_name,
          t.created_at,
          t.updated_at
        FROM team t
        JOIN flight f ON t.flight_id = f.id
        ORDER BY t.name
      `;
    }

    const teams = await query;
    
    return NextResponse.json(teams, { status: 200 });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
  }
};

// POST /api/teams - Create a new team
export const POST: RequestHandler = async (request: NextRequest) => {
  // Check if user is authenticated
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get data from request body
    const data = await request.json();
    const { name, flightId } = data;

    // Check if required fields are provided
    if (!name) {
      return NextResponse.json({ error: "Missing required field: name" }, { status: 400 });
    }

    if (!flightId) {
      return NextResponse.json({ error: "Missing required field: flightId" }, { status: 400 });
    }

    // Check if flight exists
    const flight = await prisma.$queryRaw<Flight[]>`
      SELECT id FROM flight WHERE id = ${flightId}
    `;

    if (!flight.length) {
      return NextResponse.json({ error: "Flight not found" }, { status: 404 });
    }

    // Create new team
    const team = await prisma.$queryRaw<Team[]>`
      INSERT INTO team (name, flight_id, created_at, updated_at)
      VALUES (${name}, ${flightId}, NOW(), NOW())
      RETURNING id, name, flight_id, created_at, updated_at
    `;

    return NextResponse.json(team[0], { status: 201 });
  } catch (error) {
    const dbError = error as DatabaseError;
    console.error("Error creating team:", dbError.message);
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
  }
}; 