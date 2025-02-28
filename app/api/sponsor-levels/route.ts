import { NextResponse } from 'next/server';
import { sql } from '@/lib/neon/server-client';

export async function GET() {
  try {
    const data = await sql`SELECT * FROM api.sponsor_levels`;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching sponsor levels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sponsor levels', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, level, year, cloudinary_public_id, image_url } = await request.json();

    // Validate required fields
    if (!name || !level || !year) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO api.sponsors (
        name, 
        level, 
        year, 
        cloudinary_public_id, 
        image_url
      )
      VALUES (
        ${name},
        ${level},
        ${year},
        ${cloudinary_public_id || null},
        ${image_url || null}
      )
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error creating sponsor:', error);
    return NextResponse.json(
      { error: 'Failed to create sponsor', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, level, year, cloudinary_public_id, image_url } = await request.json();

    // Validate required fields
    if (!id || !name || !level || !year) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Build the SQL query dynamically based on whether cloudinary data is provided
    let result;
    if (cloudinary_public_id && image_url) {
      result = await sql`
        UPDATE api.sponsors
        SET 
          name = ${name},
          level = ${level},
          year = ${year},
          cloudinary_public_id = ${cloudinary_public_id},
          image_url = ${image_url}
        WHERE id = ${id}
        RETURNING *
      `;
    } else {
      result = await sql`
        UPDATE api.sponsors
        SET 
          name = ${name},
          level = ${level},
          year = ${year}
        WHERE id = ${id}
        RETURNING *
      `;
    }

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Sponsor not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating sponsor:', error);
    return NextResponse.json(
      { error: 'Failed to update sponsor', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 