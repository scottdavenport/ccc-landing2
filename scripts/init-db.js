// Initialize the database with the schema
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function initializeDatabase() {
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
    // Read schema SQL files
    const schemaPath = path.join(__dirname, '..', 'lib', 'neon', 'schema.sql');
    const usersSchemaPath = path.join(__dirname, '..', 'lib', 'neon', 'users-schema.sql');
    
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    let usersSchemaSql = '';
    
    if (fs.existsSync(usersSchemaPath)) {
      usersSchemaSql = fs.readFileSync(usersSchemaPath, 'utf8');
    }
    
    // Connect to the database
    const client = await pool.connect();
    try {
      console.log('Connected to database. Applying schema...');
      
      // Apply schema
      await client.query(schemaSql);
      console.log('Main schema applied successfully.');
      
      // Apply users schema if it exists
      if (usersSchemaSql) {
        await client.query(usersSchemaSql);
        console.log('Users schema applied successfully.');
      }
      
      console.log('Database initialization completed successfully.');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the initialization
initializeDatabase(); 