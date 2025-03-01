// Script to initialize the database schema for the Production environment
require('dotenv').config();
const { Pool } = require('pg');

// SQL statements to create schema and tables
const createSchemaSQL = `
CREATE SCHEMA IF NOT EXISTS api;
`;

const createSponsorLevelsTableSQL = `
CREATE TABLE IF NOT EXISTS api.sponsor_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

const createSponsorsTableSQL = `
CREATE TABLE IF NOT EXISTS api.sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  level UUID REFERENCES api.sponsor_levels(id),
  year INTEGER NOT NULL,
  cloudinary_public_id TEXT,
  image_url TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

// Function to check if a column exists in a table
async function columnExists(pool, schema, tableName, columnName) {
  try {
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = $1 AND table_name = $2 AND column_name = $3
    `, [schema, tableName, columnName]);
    
    return result.rows.length > 0;
  } catch (error) {
    console.error(`Error checking if column ${columnName} exists in ${schema}.${tableName}:`, error);
    return false;
  }
}

// Function to add a column to a table if it doesn't exist
async function addColumnIfNotExists(pool, schema, tableName, columnName, dataType) {
  try {
    const exists = await columnExists(pool, schema, tableName, columnName);
    
    if (!exists) {
      console.log(`ℹ️ Adding missing column ${columnName} to ${schema}.${tableName}...`);
      await pool.query(`
        ALTER TABLE ${schema}.${tableName}
        ADD COLUMN ${columnName} ${dataType}
      `);
      console.log(`✅ Added column ${columnName} to ${schema}.${tableName}`);
    } else {
      console.log(`ℹ️ Column ${columnName} already exists in ${schema}.${tableName}`);
    }
  } catch (error) {
    console.error(`Error adding column ${columnName} to ${schema}.${tableName}:`, error);
  }
}

// Function to check if a table has data
async function tableHasData(pool, schema, tableName) {
  try {
    const result = await pool.query(`SELECT COUNT(*) FROM ${schema}.${tableName}`);
    return parseInt(result.rows[0].count) > 0;
  } catch (error) {
    console.error(`Error checking if ${schema}.${tableName} has data:`, error);
    return false;
  }
}

// Main function to initialize the database
async function initializeDatabase() {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log(`🔧 Initializing database for: ${process.env.DATABASE_URL.split('@')[1].split('/')[0]}`);
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for some Neon connections
    }
  });

  try {
    // Test connection
    const connectionTest = await pool.query('SELECT 1 as connected');
    if (connectionTest.rows[0].connected === 1) {
      console.log('✅ Database connection successful');
    }

    // Create schema
    await pool.query(createSchemaSQL);
    console.log('✅ API schema created or already exists');

    // Create tables
    await pool.query(createSponsorLevelsTableSQL);
    console.log('✅ Sponsor levels table created or already exists');

    await pool.query(createSponsorsTableSQL);
    console.log('✅ Sponsors table created or already exists');

    // Ensure the website_url column exists in the sponsors table
    await addColumnIfNotExists(pool, 'api', 'sponsors', 'website_url', 'TEXT');

    // Final check
    console.log('🔍 Verifying database setup...');
    
    const levelsCount = await pool.query('SELECT COUNT(*) FROM api.sponsor_levels');
    console.log(`ℹ️ Sponsor levels count: ${levelsCount.rows[0].count}`);
    
    const sponsorsCount = await pool.query('SELECT COUNT(*) FROM api.sponsors');
    console.log(`ℹ️ Sponsors count: ${sponsorsCount.rows[0].count}`);

    console.log('✅ Database initialization complete');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    await pool.end();
  }
}

// Run the function
initializeDatabase().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
}); 