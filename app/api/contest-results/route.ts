import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

// GET /api/contest-results - Get all contest results or results for a specific contest
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contestId = searchParams.get('contestId');
    const playerId = searchParams.get('playerId');
    const tournamentYearId = searchParams.get('tournamentYearId');

    let contestResults;
    if (contestId) {
      // Get results for a specific contest
      contestResults = await prisma.$queryRaw`
        SELECT cr.*, p.name as player_name, c.name as contest_name, ty.year
        FROM api.contest_results cr
        JOIN api.players p ON cr.player_id = p.id
        JOIN api.contests c ON cr.contest_id = c.id
        JOIN api.tournament_years ty ON c.tournament_year_id = ty.id
        WHERE cr.contest_id = ${contestId}::uuid
        ORDER BY cr.result ASC
      `;
    } else if (playerId) {
      // Get results for a specific player
      contestResults = await prisma.$queryRaw`
        SELECT cr.*, p.name as player_name, c.name as contest_name, ty.year
        FROM api.contest_results cr
        JOIN api.players p ON cr.player_id = p.id
        JOIN api.contests c ON cr.contest_id = c.id
        JOIN api.tournament_years ty ON c.tournament_year_id = ty.id
        WHERE cr.player_id = ${playerId}::uuid
        ORDER BY ty.year DESC, c.name ASC
      `;
    } else if (tournamentYearId) {
      // Get results for a specific tournament year
      contestResults = await prisma.$queryRaw`
        SELECT cr.*, p.name as player_name, c.name as contest_name, ty.year
        FROM api.contest_results cr
        JOIN api.players p ON cr.player_id = p.id
        JOIN api.contests c ON cr.contest_id = c.id
        JOIN api.tournament_years ty ON c.tournament_year_id = ty.id
        WHERE ty.id = ${tournamentYearId}::uuid
        ORDER BY c.name ASC, cr.result ASC
      `;
    } else {
      // Get all contest results
      contestResults = await prisma.$queryRaw`
        SELECT cr.*, p.name as player_name, c.name as contest_name, ty.year
        FROM api.contest_results cr
        JOIN api.players p ON cr.player_id = p.id
        JOIN api.contests c ON cr.contest_id = c.id
        JOIN api.tournament_years ty ON c.tournament_year_id = ty.id
        ORDER BY ty.year DESC, c.name ASC, cr.result ASC
      `;
    }

    return NextResponse.json(contestResults);
  } catch (error) {
    console.error('Error fetching contest results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contest results' },
      { status: 500 }
    );
  }
}

// POST /api/contest-results - Create a new contest result
export async function POST(request: NextRequest) {
  const authResult = await auth();
  
  // Only authenticated users can create contest results
  if (!authResult.userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    
    // Validate input
    if (!data.contestId || !data.playerId || !data.result) {
      return NextResponse.json(
        { error: 'Missing required fields: contestId, playerId, and result' },
        { status: 400 }
      );
    }

    // Check if contest exists
    const contests = await prisma.$queryRaw`
      SELECT * FROM api.contests
      WHERE id = ${data.contestId}::uuid
    `;

    if (!contests || (contests as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Contest not found' },
        { status: 404 }
      );
    }

    // Check if player exists or create a new one
    let playerId = data.playerId;
    if (data.playerId === 'new' && data.playerName) {
      // Create a new player
      const newPlayer = await prisma.$queryRaw`
        INSERT INTO api.players (name, created_at, updated_at)
        VALUES (${data.playerName}, NOW(), NOW())
        RETURNING *
      `;
      
      playerId = (newPlayer as any[])[0].id;
    } else {
      // Check if player exists
      const players = await prisma.$queryRaw`
        SELECT * FROM api.players
        WHERE id = ${data.playerId}::uuid
      `;

      if (!players || (players as any[]).length === 0) {
        return NextResponse.json(
          { error: 'Player not found' },
          { status: 404 }
        );
      }
    }

    // Check if contest result already exists for this player and contest
    const existingResults = await prisma.$queryRaw`
      SELECT * FROM api.contest_results
      WHERE contest_id = ${data.contestId}::uuid AND player_id = ${playerId}::uuid
    `;

    if (existingResults && (existingResults as any[]).length > 0) {
      return NextResponse.json(
        { error: 'Contest result already exists for this player and contest' },
        { status: 409 }
      );
    }

    // Create new contest result
    const newContestResult = await prisma.$queryRaw`
      INSERT INTO api.contest_results (contest_id, player_id, result, created_at, updated_at)
      VALUES (${data.contestId}::uuid, ${playerId}::uuid, ${data.result}, NOW(), NOW())
      RETURNING *
    `;

    return NextResponse.json((newContestResult as any[])[0], { status: 201 });
  } catch (error) {
    console.error('Error creating contest result:', error);
    return NextResponse.json(
      { error: 'Failed to create contest result' },
      { status: 500 }
    );
  }
} 