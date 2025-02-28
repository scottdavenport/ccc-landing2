const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testDatabaseConnection() {
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
      
      // Check if the api schema exists
      const schemaResult = await client.query(`
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name = 'api'
      `);
      
      if (schemaResult.rows.length > 0) {
        console.log('The "api" schema exists.');
      } else {
        console.log('The "api" schema does NOT exist!');
      }
      
      // Check if the sponsors table exists
      const tableResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'api' AND table_name = 'sponsors'
      `);
      
      if (tableResult.rows.length > 0) {
        console.log('The "api.sponsors" table exists.');
        
        // Check the structure of the sponsors table
        const columnsResult = await client.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_schema = 'api' AND table_name = 'sponsors'
        `);
        
        console.log('Columns in the "api.sponsors" table:');
        columnsResult.rows.forEach(row => {
          console.log(`  - ${row.column_name} (${row.data_type})`);
        });
        
        // Count rows in the sponsors table
        const countResult = await client.query(`
          SELECT COUNT(*) FROM api.sponsors
        `);
        
        console.log(`Number of rows in the "api.sponsors" table: ${countResult.rows[0].count}`);
      } else {
        console.log('The "api.sponsors" table does NOT exist!');
      }
      
      // Check if the sponsor_levels table exists
      const levelsTableResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'api' AND table_name = 'sponsor_levels'
      `);
      
      if (levelsTableResult.rows.length > 0) {
        console.log('The "api.sponsor_levels" table exists.');
        
        // Count rows in the sponsor_levels table
        const countResult = await client.query(`
          SELECT COUNT(*) FROM api.sponsor_levels
        `);
        
        console.log(`Number of rows in the "api.sponsor_levels" table: ${countResult.rows[0].count}`);
      } else {
        console.log('The "api.sponsor_levels" table does NOT exist!');
      }
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error testing database connection:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the test
testDatabaseConnection(); 