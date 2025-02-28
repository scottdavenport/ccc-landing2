const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { parse } = require('csv-parse/sync');
require('dotenv').config({ path: '.env.local' });

async function importCsvData() {
  // Check if DATABASE_URL is set
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('Connecting to database...');
  
  // Create a connection pool
  const pool = new Pool({
    connectionString: databaseUrl,
  });

  try {
    // Connect to the database
    const client = await pool.connect();
    try {
      console.log('Connected to database successfully.');
      
      // Import sponsor levels
      const sponsorLevelsPath = path.join(__dirname, '..', 'migrations', 'data', 'sponsor_levels.csv');
      if (fs.existsSync(sponsorLevelsPath)) {
        console.log('Importing sponsor levels from CSV...');
        const sponsorLevelsData = fs.readFileSync(sponsorLevelsPath, 'utf8');
        const sponsorLevels = parse(sponsorLevelsData, { columns: true, skip_empty_lines: true });
        
        for (const level of sponsorLevels) {
          // Check if the level already exists by ID
          const existingLevel = await client.query(
            'SELECT id FROM api.sponsor_levels WHERE id = $1',
            [level.id]
          );
          
          if (existingLevel.rows.length === 0) {
            // Insert the sponsor level with the specified ID
            await client.query(
              'INSERT INTO api.sponsor_levels (id, name, amount) VALUES ($1, $2, $3)',
              [level.id, level.name, parseFloat(level.amount) || null]
            );
            console.log(`Added sponsor level: ${level.name} (${level.id})`);
          } else {
            console.log(`Sponsor level already exists: ${level.name} (${level.id})`);
          }
        }
      } else {
        console.log('Sponsor levels CSV file not found.');
      }
      
      // Import sponsors
      const sponsorsPath = path.join(__dirname, '..', 'migrations', 'data', 'sponsors.csv');
      if (fs.existsSync(sponsorsPath)) {
        console.log('Importing sponsors from CSV...');
        const sponsorsData = fs.readFileSync(sponsorsPath, 'utf8');
        const sponsors = parse(sponsorsData, { columns: true, skip_empty_lines: true });
        
        for (const sponsor of sponsors) {
          // Check if the level exists
          const levelResult = await client.query(
            'SELECT id FROM api.sponsor_levels WHERE id = $1',
            [sponsor.level]
          );
          
          if (levelResult.rows.length === 0) {
            console.log(`Sponsor level ID not found for sponsor ${sponsor.name}: ${sponsor.level}`);
            continue;
          }
          
          // Check if the sponsor already exists by ID
          const existingSponsor = await client.query(
            'SELECT id FROM api.sponsors WHERE id = $1',
            [sponsor.id]
          );
          
          if (existingSponsor.rows.length === 0) {
            // Insert the sponsor with the specified ID
            await client.query(
              'INSERT INTO api.sponsors (id, name, level, year, cloudinary_public_id, image_url, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
              [
                sponsor.id,
                sponsor.name,
                sponsor.level,
                parseInt(sponsor.year),
                sponsor.cloudinary_public_id || null,
                sponsor.image_url || null,
                sponsor.created_at || new Date(),
                sponsor.updated_at || new Date()
              ]
            );
            console.log(`Added sponsor: ${sponsor.name} (${sponsor.year})`);
          } else {
            console.log(`Sponsor already exists: ${sponsor.name} (${sponsor.id})`);
          }
        }
      } else {
        console.log('Sponsors CSV file not found.');
      }
      
      console.log('CSV data import completed successfully.');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error importing CSV data:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the import
importCsvData(); 