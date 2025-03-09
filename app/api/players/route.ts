import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

// GET /api/players - Get all players or players for a specific team
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    let players;
    if (teamId) {
      players = await prisma.$queryRaw`
        SELECT p.*, t.name as team_name
        FROM api.players p
        LEFT JOIN api.teams t ON p.team_id = t.id
        WHERE p.team_id = ${teamId}::uuid
        ORDER BY p.name ASC
      `;
    } else {
      players = await prisma.$queryRaw`
        SELECT p.*, t.name as team_name
        FROM api.players p
        LEFT JOIN api.teams t ON p.team_id = t.id
        ORDER BY p.name ASC
      `;
    }

    return NextResponse.json(players);
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}

// POST /api/players - Create a new player
export async function POST(request: NextRequest) {
  const authResult = await auth();
  
  // Only authenticated users can create players
  if (!authResult.userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    
    // Validate input
    if (!data.name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      );
    }

    // Check if team exists if teamId is provided
    if (data.teamId) {
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
    }

    // Create new player
    const newPlayer = await prisma.$queryRaw`
      INSERT INTO api.players (name, team_id, created_at, updated_at)
      VALUES (
        ${data.name}, 
        ${data.teamId ? `${data.teamId}::uuid` : null}, 
        NOW(), 
        NOW()
      )
      RETURNING *
    `;

    return NextResponse.json((newPlayer as any[])[0], { status: 201 });
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json(
      { error: 'Failed to create player' },
      { status: 500 }
    );
  }
} 