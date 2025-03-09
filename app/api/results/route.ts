import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

// GET /api/results - Get all results or results for a specific team
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const flightId = searchParams.get('flightId');
    const tournamentYearId = searchParams.get('tournamentYearId');

    let results;
    if (teamId) {
      // Get results for a specific team
      results = await prisma.$queryRaw`
        SELECT r.*, t.name as team_name, f.name as flight_name, ty.year
        FROM api.results r
        JOIN api.teams t ON r.team_id = t.id
        JOIN api.flights f ON t.flight_id = f.id
        JOIN api.tournament_years ty ON f.tournament_year_id = ty.id
        WHERE r.team_id = ${teamId}::uuid
        ORDER BY r.position ASC
      `;
    } else if (flightId) {
      // Get results for a specific flight
      results = await prisma.$queryRaw`
        SELECT r.*, t.name as team_name, f.name as flight_name, ty.year
        FROM api.results r
        JOIN api.teams t ON r.team_id = t.id
        JOIN api.flights f ON t.flight_id = f.id
        JOIN api.tournament_years ty ON f.tournament_year_id = ty.id
        WHERE f.id = ${flightId}::uuid
        ORDER BY r.position ASC
      `;
    } else if (tournamentYearId) {
      // Get results for a specific tournament year
      results = await prisma.$queryRaw`
        SELECT r.*, t.name as team_name, f.name as flight_name, ty.year
        FROM api.results r
        JOIN api.teams t ON r.team_id = t.id
        JOIN api.flights f ON t.flight_id = f.id
        JOIN api.tournament_years ty ON f.tournament_year_id = ty.id
        WHERE ty.id = ${tournamentYearId}::uuid
        ORDER BY f.name ASC, r.position ASC
      `;
    } else {
      // Get all results
      results = await prisma.$queryRaw`
        SELECT r.*, t.name as team_name, f.name as flight_name, ty.year
        FROM api.results r
        JOIN api.teams t ON r.team_id = t.id
        JOIN api.flights f ON t.flight_id = f.id
        JOIN api.tournament_years ty ON f.tournament_year_id = ty.id
        ORDER BY ty.year DESC, f.name ASC, r.position ASC
      `;
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}

// POST /api/results - Create a new result
export async function POST(request: NextRequest) {
  const authResult = await auth();
  
  // Only authenticated users can create results
  if (!authResult.userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    
    // Validate input
    if (!data.teamId || !data.position || !data.score) {
      return NextResponse.json(
        { error: 'Missing required fields: teamId, position, and score' },
        { status: 400 }
      );
    }

    // Check if team exists
    const teams = await prisma.$queryRaw`
      SELECT * FROM api.teams
      WHERE id = ${data.teamId}::uuid
    `;

    if (!teams || (teams as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if result already exists for this team
    const existingResults = await prisma.$queryRaw`
      SELECT * FROM api.results
      WHERE team_id = ${data.teamId}::uuid
    `;

    if (existingResults && (existingResults as any[]).length > 0) {
      return NextResponse.json(
        { error: 'Result already exists for this team' },
        { status: 409 }
      );
    }

    // Create new result
    const newResult = await prisma.$queryRaw`
      INSERT INTO api.results (team_id, position, score, purse, created_at, updated_at)
      VALUES (
        ${data.teamId}::uuid, 
        ${data.position}, 
        ${data.score}::decimal, 
        ${data.purse ? `${data.purse}::decimal` : null}, 
        NOW(), 
        NOW()
      )
      RETURNING *
    `;

    return NextResponse.json((newResult as any[])[0], { status: 201 });
  } catch (error) {
    console.error('Error creating result:', error);
    return NextResponse.json(
      { error: 'Failed to create result' },
      { status: 500 }
    );
  }
} 