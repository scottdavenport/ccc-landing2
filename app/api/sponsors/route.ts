import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { sql } from '@/lib/neon/improved-server-client';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// This function handles both JSON and form data requests for creating sponsors
export async function POST(request: Request) {
  try {
    // Check content type to determine how to handle the request
    const contentType = request.headers.get('content-type') || '';
    
    let name: string;
    let level: string;
    let year: number;
    let cloudinary_public_id: string | null = null;
    let image_url: string | null = null;
    
    // Handle JSON request (from AddSponsorForm)
    if (contentType.includes('application/json')) {
      const { name: jsonName, level: jsonLevel, year: jsonYear, cloudinary_public_id: jsonPublicId, image_url: jsonImageUrl } = await request.json();
      
      name = jsonName;
      level = jsonLevel;
      year = jsonYear;
      cloudinary_public_id = jsonPublicId || null;
      image_url = jsonImageUrl || null;
      
      if (!name || !level || !year) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }
    } 
    // Handle form data request (from file upload)
    else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      name = formData.get('name') as string;
      level = formData.get('level') as string;
      year = parseInt(formData.get('year') as string, 10);
      const logo = formData.get('logo') as File;

      if (!name || !level || isNaN(year) || !logo) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      // Convert the file to a buffer
      const buffer = await logo.arrayBuffer();

      // Upload to Cloudinary
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'sponsors',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        // Convert buffer to Uint8Array and write to stream
        const uint8Array = new Uint8Array(buffer);
        uploadStream.end(uint8Array);
      });

      interface CloudinaryUploadResult {
        secure_url: string;
        public_id: string;
      }

      const uploadResult = (await uploadPromise) as CloudinaryUploadResult;
      cloudinary_public_id = uploadResult.public_id;
      image_url = uploadResult.secure_url;
    } else {
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 });
    }

    // Save to Neon database
    const result = await sql`
      INSERT INTO api.sponsors (name, level, year, cloudinary_public_id, image_url)
      VALUES (${name}, ${level}, ${year}, ${cloudinary_public_id}, ${image_url})
      RETURNING *
    `;

    if (!result || result.length === 0) {
      throw new Error('Failed to insert sponsor into database');
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error creating sponsor:', error);
    return NextResponse.json({ error: 'Failed to create sponsor', message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    
    let query;
    if (year) {
      query = sql`
        SELECT s.*, sl.name as level_name, sl.amount as level_amount
        FROM api.sponsors s
        JOIN api.sponsor_levels sl ON s.level = sl.id
        WHERE s.year = ${parseInt(year)}
        ORDER BY sl.amount DESC, s.name ASC
      `;
    } else {
      query = sql`
        SELECT s.*, sl.name as level_name, sl.amount as level_amount
        FROM api.sponsors s
        JOIN api.sponsor_levels sl ON s.level = sl.id
        ORDER BY s.year DESC, sl.amount DESC, s.name ASC
      `;
    }
    
    const data = await query;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sponsors', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing sponsor ID' }, { status: 400 });
    }
    
    // First, get the sponsor to check if it has a Cloudinary image
    const sponsor = await sql`SELECT * FROM api.sponsors WHERE id = ${id}`;
    
    if (!sponsor || sponsor.length === 0) {
      return NextResponse.json({ error: 'Sponsor not found' }, { status: 404 });
    }
    
    // Delete the sponsor from the database
    const result = await sql`DELETE FROM api.sponsors WHERE id = ${id} RETURNING *`;
    
    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Failed to delete sponsor' }, { status: 500 });
    }
    
    // Return the deleted sponsor data
    return NextResponse.json({ 
      message: 'Sponsor deleted successfully',
      sponsor: result[0],
      // Include cloudinary_public_id so the client can delete the image if needed
      cloudinary_public_id: sponsor[0].cloudinary_public_id
    });
  } catch (error) {
    console.error('Error deleting sponsor:', error);
    return NextResponse.json(
      { error: 'Failed to delete sponsor', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, image_url, cloudinary_public_id } = await request.json();

    // Validate required fields
    if (!id || !image_url || !cloudinary_public_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await sql`
      UPDATE api.sponsors
      SET 
        image_url = ${image_url},
        cloudinary_public_id = ${cloudinary_public_id},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Sponsor not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating sponsor logo:', error);
    return NextResponse.json(
      { error: 'Failed to update sponsor logo', message: error instanceof Error ? error.message : 'Unknown error' },
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
