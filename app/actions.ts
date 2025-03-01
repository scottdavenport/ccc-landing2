"use server";

import { sql, query } from "@/lib/neon/improved-server-client";

// Sponsors actions
export async function fetchSponsors() {
  const sponsors = await sql`
    SELECT 
      s.*,
      sl.name as level_name,
      sl.amount
    FROM api.sponsors s
    JOIN api.sponsor_levels sl ON s.level = sl.name
    ORDER BY s.year DESC
  `;
  return sponsors;
}

export async function createSponsor(name: string, level: string, year: number, imageUrl?: string, cloudinaryPublicId?: string) {
  const result = await sql`
    INSERT INTO api.sponsors (name, level, year, image_url, cloudinary_public_id)
    VALUES (${name}, ${level}, ${year}, ${imageUrl || null}, ${cloudinaryPublicId || null})
    RETURNING *
  `;
  return result[0];
}

export async function updateSponsorLogo(id: string, imageUrl: string, cloudinaryPublicId: string) {
  const result = await sql`
    UPDATE api.sponsors
    SET image_url = ${imageUrl}, cloudinary_public_id = ${cloudinaryPublicId}
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0];
}

export async function updateSponsor(id: string, data: { name?: string; level?: string; year?: number; imageUrl?: string; cloudinaryPublicId?: string }) {
  const { name, level, year, imageUrl, cloudinaryPublicId } = data;
  
  // Build the query dynamically
  let setClause = '';
  const params: unknown[] = [];
  
  if (name) {
    setClause += 'name = $' + (params.length + 1) + ', ';
    params.push(name);
  }
  
  if (level) {
    setClause += 'level = $' + (params.length + 1) + ', ';
    params.push(level);
  }
  
  if (year) {
    setClause += 'year = $' + (params.length + 1) + ', ';
    params.push(year);
  }
  
  if (imageUrl) {
    setClause += 'image_url = $' + (params.length + 1) + ', ';
    params.push(imageUrl);
  }
  
  if (cloudinaryPublicId) {
    setClause += 'cloudinary_public_id = $' + (params.length + 1) + ', ';
    params.push(cloudinaryPublicId);
  }
  
  // Remove trailing comma and space
  setClause = setClause.slice(0, -2);
  
  // Add the ID parameter
  params.push(id);
  
  // Execute the query using the query function instead of sql template literal
  const result = await query(`
    UPDATE api.sponsors
    SET ${setClause}
    WHERE id = $${params.length}
    RETURNING *
  `, params);
  
  return result[0];
}

export async function deleteSponsor(id: string) {
  const result = await sql`
    DELETE FROM api.sponsors
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0];
}

export async function deleteSponsors(ids: string[]) {
  // Create placeholders and parameters for the query
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
  
  // Execute the query using the query function
  const result = await query(`
    DELETE FROM api.sponsors
    WHERE id IN (${placeholders})
    RETURNING id
  `, ids);
  
  return result.map((r: Record<string, unknown>) => r.id as string);
}

// Sponsor levels actions
export async function fetchSponsorLevels() {
  const levels = await sql`
    SELECT * FROM api.sponsor_levels
    ORDER BY amount DESC
  `;
  return levels;
}

export async function createSponsorLevel(name: string, amount: number) {
  const result = await sql`
    INSERT INTO api.sponsor_levels (name, amount)
    VALUES (${name}, ${amount})
    RETURNING *
  `;
  return result[0];
}

export async function updateSponsorLevel(id: string, name: string, amount: number) {
  const result = await sql`
    UPDATE api.sponsor_levels
    SET name = ${name}, amount = ${amount}
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0];
}

export async function deleteSponsorLevel(id: string) {
  const result = await sql`
    DELETE FROM api.sponsor_levels
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0];
}

// Authentication actions
export async function checkDatabaseConnection() {
  try {
    const result = await sql`SELECT 1 as connected`;
    return result[0].connected === 1;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
} 