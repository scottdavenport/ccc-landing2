#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { neon } = require('@neondatabase/serverless');
const { Pool } = require('pg');

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Function to execute SQL queries
async function executeQuery(query, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result;
  } finally {
    client.release();
  }
}

// Function to create tables
async function createTables() {
  console.log('Creating tables...');
  
  // Read schema files
  const schemaPath = path.join(__dirname, '../lib/neon/schema.sql');
  const usersSchemaPath = path.join(__dirname, '../lib/neon/users-schema.sql');
  
  try {
    // Execute schema SQL
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await executeQuery(schemaSql);
      console.log('Schema created successfully');
    } else {
      console.warn(`Schema file not found: ${schemaPath}`);
    }
    
    // Execute users schema SQL
    if (fs.existsSync(usersSchemaPath)) {
      const usersSchemaSql = fs.readFileSync(usersSchemaPath, 'utf8');
      await executeQuery(usersSchemaSql);
      console.log('Users schema created successfully');
    } else {
      console.warn(`Users schema file not found: ${usersSchemaPath}`);
    }
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

// Function to import data from CSV
async function importCsvData(tableName, filePath, columnMap, includeTimestamps = false) {
  console.log(`Importing data into ${tableName} from ${filePath}...`);
  
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.warn(`CSV file not found: ${filePath}`);
      return;
    }
    
    // Read and parse CSV file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });
    
    if (records.length === 0) {
      console.log(`No records found in ${filePath}`);
      return;
    }
    
    console.log(`Found ${records.length} records to import`);
    
    // Import each record
    for (const record of records) {
      // Map CSV columns to database columns
      const mappedRecord = {};
      for (const [dbColumn, csvColumn] of Object.entries(columnMap)) {
        mappedRecord[dbColumn] = record[csvColumn];
      }
      
      // Add timestamps if requested
      if (includeTimestamps && record.created_at) {
        mappedRecord.created_at = record.created_at;
      }
      
      if (includeTimestamps && record.updated_at) {
        mappedRecord.updated_at = record.updated_at;
      }
      
      // Generate columns and placeholders for SQL query
      const columns = Object.keys(mappedRecord);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      const values = Object.values(mappedRecord);
      
      // Skip if no values
      if (values.length === 0) continue;
      
      // Build and execute INSERT query
      const query = `
        INSERT INTO api.${tableName} (${columns.join(', ')})
        VALUES (${placeholders})
        ON CONFLICT (id) DO NOTHING
      `;
      
      await executeQuery(query, values);
    }
    
    console.log(`Successfully imported data into ${tableName}`);
  } catch (error) {
    console.error(`Error importing data into ${tableName}:`, error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    // Create tables
    await createTables();
    
    // Import sponsor levels
    await importCsvData('sponsor_levels', 
      path.join(__dirname, '../migrations/data/sponsor_levels.csv'),
      {
        id: 'id',
        name: 'name',
        amount: 'amount'
      },
      true // Include timestamps
    );
    
    // Import sponsors
    await importCsvData('sponsors', 
      path.join(__dirname, '../migrations/data/sponsors.csv'),
      {
        id: 'id',
        name: 'name',
        level: 'level',
        year: 'year',
        cloudinary_public_id: 'cloudinary_public_id',
        image_url: 'image_url'
      },
      true // Include timestamps
    );
    
    // Import users if available
    await importCsvData('users', 
      path.join(__dirname, '../migrations/data/users.csv'),
      {
        id: 'id',
        email: 'email',
        password: 'password',
        name: 'name'
      },
      true // Include timestamps
    );
    
    console.log('Data import completed successfully');
  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the script
main(); 