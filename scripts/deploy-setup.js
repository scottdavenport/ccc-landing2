const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { parse } = require('csv-parse/sync');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function deploySetup() {
  // Check if DATABASE_URL is set
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('Starting deployment setup...');
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
      
      // Step 1: Initialize the database schema
      console.log('Step 1: Initializing database schema...');
      
      // Read schema SQL files
      const schemaPath = path.join(__dirname, '..', 'lib', 'neon', 'schema.sql');
      const usersSchemaPath = path.join(__dirname, '..', 'lib', 'neon', 'users-schema.sql');
      
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      let usersSchemaSql = '';
      
      if (fs.existsSync(usersSchemaPath)) {
        usersSchemaSql = fs.readFileSync(usersSchemaPath, 'utf8');
      }
      
      // Apply schema
      await client.query(schemaSql);
      console.log('Main schema applied successfully.');
      
      // Apply users schema if it exists
      if (usersSchemaSql) {
        await client.query(usersSchemaSql);
        console.log('Users schema applied successfully.');
      }
      
      // Step 2: Import data from CSV files
      console.log('Step 2: Importing data from CSV files...');
      
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
      
      // Step 3: Create admin user if environment variables are set
      console.log('Step 3: Creating admin user...');
      
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;
      
      if (adminEmail && adminPassword) {
        console.log(`Creating admin user with email: ${adminEmail}`);
        
        // Check if the users table exists
        const tableCheck = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'api' 
            AND table_name = 'users'
          );
        `);
        
        // If the users table doesn't exist, create it
        if (!tableCheck.rows[0].exists) {
          console.log('Users table does not exist. Creating it...');
          
          // Create the users table
          await client.query(`
            CREATE TABLE IF NOT EXISTS api.users (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              email TEXT NOT NULL UNIQUE,
              password TEXT NOT NULL,
              name TEXT,
              created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
              updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
          `);
          
          console.log('Users table created successfully.');
        }
        
        // Check if the admin user already exists
        const userCheck = await client.query('SELECT * FROM api.users WHERE email = $1', [adminEmail]);
        
        if (userCheck.rows.length > 0) {
          console.log(`Admin user with email ${adminEmail} already exists. Updating password...`);
          
          // Hash the password
          const hashedPassword = await bcrypt.hash(adminPassword, 10);
          
          // Update the existing user
          await client.query(
            'UPDATE api.users SET password = $1, updated_at = NOW() WHERE email = $2',
            [hashedPassword, adminEmail]
          );
          
          console.log('Admin user password updated successfully.');
        } else {
          console.log(`Creating new admin user with email ${adminEmail}...`);
          
          // Hash the password
          const hashedPassword = await bcrypt.hash(adminPassword, 10);
          
          // Insert the new admin user
          await client.query(
            'INSERT INTO api.users (email, password, name) VALUES ($1, $2, $3)',
            [adminEmail, hashedPassword, 'Admin User']
          );
          
          console.log('Admin user created successfully.');
        }
      } else {
        console.log('ADMIN_EMAIL and/or ADMIN_PASSWORD environment variables not set. Skipping admin user creation.');
      }
      
      console.log('Deployment setup completed successfully.');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error during deployment setup:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the deployment setup
deploySetup(); 