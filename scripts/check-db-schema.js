// Script to check database schema and verify tables exist
require('dotenv').config();
const { Pool } = require('pg');

// Function to check if a table exists
async function checkTableExists(pool, schema, tableName) {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = $1 AND table_name = $2
      );
    `, [schema, tableName]);
    
    return result.rows[0].exists;
  } catch (error) {
    console.error(`Error checking if ${schema}.${tableName} exists:`, error);
    return false;
  }
}

// Function to get table columns
async function getTableColumns(pool, schema, tableName) {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = $1 AND table_name = $2
      ORDER BY ordinal_position;
    `, [schema, tableName]);
    
    return result.rows;
  } catch (error) {
    console.error(`Error getting columns for ${schema}.${tableName}:`, error);
    return [];
  }
}

// Main function to check database schema
async function checkDatabaseSchema() {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log(`🔍 Checking database connection and schema for: ${process.env.DATABASE_URL.split('@')[1].split('/')[0]}`);
  
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

    // Check if api schema exists
    const apiSchemaExists = await checkTableExists(pool, 'information_schema', 'schemata');
    if (apiSchemaExists) {
      console.log('✅ Information schema accessible');
    } else {
      console.error('❌ Cannot access information schema');
    }

    // Check if api schema exists
    const schemaResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.schemata 
        WHERE schema_name = 'api'
      );
    `);
    
    if (schemaResult.rows[0].exists) {
      console.log('✅ API schema exists');
    } else {
      console.error('❌ API schema does not exist');
    }

    // Check required tables
    const requiredTables = [
      { schema: 'api', name: 'sponsors' },
      { schema: 'api', name: 'sponsor_levels' }
    ];

    for (const table of requiredTables) {
      const exists = await checkTableExists(pool, table.schema, table.name);
      if (exists) {
        console.log(`✅ Table ${table.schema}.${table.name} exists`);
        
        // Get columns for the table
        const columns = await getTableColumns(pool, table.schema, table.name);
        console.log(`   Columns for ${table.schema}.${table.name}:`);
        columns.forEach(col => {
          console.log(`   - ${col.column_name} (${col.data_type})`);
        });
      } else {
        console.error(`❌ Table ${table.schema}.${table.name} does not exist`);
      }
    }

    // Check for data in the tables
    for (const table of requiredTables) {
      try {
        const countResult = await pool.query(`SELECT COUNT(*) FROM ${table.schema}.${table.name}`);
        const count = parseInt(countResult.rows[0].count);
        console.log(`ℹ️ Table ${table.schema}.${table.name} has ${count} rows`);
      } catch (error) {
        console.error(`❌ Error counting rows in ${table.schema}.${table.name}:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await pool.end();
  }
}

// Run the function
checkDatabaseSchema().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
}); 