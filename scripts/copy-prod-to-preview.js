// Script to copy data from Production to Preview database
require('dotenv').config();
const { Pool } = require('pg');

// Define the production and preview database URLs
// These must be provided as environment variables
const PROD_DB_URL = process.env.PROD_DATABASE_URL;
const PREVIEW_DB_URL = process.env.PREVIEW_DATABASE_URL;

// Check if environment variables are set
if (!PROD_DB_URL) {
  console.error('❌ PROD_DATABASE_URL environment variable is not set');
  process.exit(1);
}

if (!PREVIEW_DB_URL) {
  console.error('❌ PREVIEW_DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Function to get all data from a table
async function getAllData(pool, schema, tableName) {
  try {
    const result = await pool.query(`SELECT * FROM ${schema}.${tableName}`);
    return result.rows;
  } catch (error) {
    console.error(`Error getting data from ${schema}.${tableName}:`, error);
    return [];
  }
}

// Function to clear a table
async function clearTable(pool, schema, tableName) {
  try {
    await pool.query(`DELETE FROM ${schema}.${tableName}`);
    console.log(`✅ Cleared data from ${schema}.${tableName}`);
    return true;
  } catch (error) {
    console.error(`Error clearing data from ${schema}.${tableName}:`, error);
    return false;
  }
}

// Function to get table columns
async function getTableColumns(pool, schema, tableName) {
  try {
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = $1 AND table_name = $2
    `, [schema, tableName]);
    
    return result.rows.map(row => row.column_name);
  } catch (error) {
    console.error(`Error getting columns for ${schema}.${tableName}:`, error);
    return [];
  }
}

// Function to insert data into a table
async function insertData(pool, schema, tableName, data, sourceColumns) {
  if (data.length === 0) {
    console.log(`ℹ️ No data to insert into ${schema}.${tableName}`);
    return;
  }

  try {
    // Get the actual columns in the target table
    const targetColumns = await getTableColumns(pool, schema, tableName);
    console.log(`ℹ️ Target table ${schema}.${tableName} has columns: ${targetColumns.join(', ')}`);
    
    // Filter source columns to only include those that exist in the target table
    const validColumns = sourceColumns.filter(col => targetColumns.includes(col));
    
    if (validColumns.length === 0) {
      console.error(`❌ No matching columns found for ${schema}.${tableName}`);
      return;
    }
    
    console.log(`ℹ️ Using columns for insert: ${validColumns.join(', ')}`);

    // For each row, create an insert statement with only the valid columns
    for (const row of data) {
      const columnNames = validColumns.join(', ');
      const placeholders = validColumns.map((_, index) => `$${index + 1}`).join(', ');
      const values = validColumns.map(col => row[col]);

      await pool.query(`
        INSERT INTO ${schema}.${tableName} (${columnNames})
        VALUES (${placeholders})
      `, values);
    }

    console.log(`✅ Inserted ${data.length} rows into ${schema}.${tableName}`);
  } catch (error) {
    console.error(`Error inserting data into ${schema}.${tableName}:`, error);
    throw error; // Re-throw to handle in the calling function
  }
}

// Main function to copy data from production to preview
async function copyProdToPreview() {
  console.log('🔄 Starting data copy from Production to Preview');
  
  // Create connection pools
  const prodPool = new Pool({
    connectionString: PROD_DB_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  const previewPool = new Pool({
    connectionString: PREVIEW_DB_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Test connections
    console.log('🔍 Testing database connections...');
    
    const prodTest = await prodPool.query('SELECT 1 as connected');
    if (prodTest.rows[0].connected === 1) {
      console.log('✅ Production database connection successful');
    }
    
    const previewTest = await previewPool.query('SELECT 1 as connected');
    if (previewTest.rows[0].connected === 1) {
      console.log('✅ Preview database connection successful');
    }

    // Define tables to copy and their expected columns (from source)
    const tablesToCopy = [
      {
        schema: 'api',
        name: 'sponsor_levels',
        columns: ['id', 'name', 'amount', 'created_at', 'updated_at']
      },
      {
        schema: 'api',
        name: 'sponsors',
        columns: ['id', 'name', 'level', 'year', 'cloudinary_public_id', 'image_url', 'website_url', 'created_at', 'updated_at']
      }
    ];

    // Copy each table
    for (const table of tablesToCopy) {
      console.log(`🔄 Copying ${table.schema}.${table.name}...`);
      
      // Get data from production
      const data = await getAllData(prodPool, table.schema, table.name);
      console.log(`ℹ️ Retrieved ${data.length} rows from production ${table.schema}.${table.name}`);
      
      // Clear the table in preview
      await clearTable(previewPool, table.schema, table.name);
      
      // Insert data into preview
      await insertData(previewPool, table.schema, table.name, data, table.columns);
    }

    // Verify the copy
    console.log('🔍 Verifying data copy...');
    
    for (const table of tablesToCopy) {
      const prodCount = await prodPool.query(`SELECT COUNT(*) FROM ${table.schema}.${table.name}`);
      const previewCount = await previewPool.query(`SELECT COUNT(*) FROM ${table.schema}.${table.name}`);
      
      console.log(`ℹ️ ${table.schema}.${table.name}: Production has ${prodCount.rows[0].count} rows, Preview has ${previewCount.rows[0].count} rows`);
      
      if (prodCount.rows[0].count === previewCount.rows[0].count) {
        console.log(`✅ Row counts match for ${table.schema}.${table.name}`);
      } else {
        console.warn(`⚠️ Row counts do not match for ${table.schema}.${table.name}`);
      }
    }

    console.log('✅ Data copy complete');

  } catch (error) {
    console.error('❌ Data copy failed:', error);
  } finally {
    await prodPool.end();
    await previewPool.end();
  }
}

// Run the function
copyProdToPreview().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
}); 