const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function createAdminUser() {
  // Check if DATABASE_URL is set
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  // Get admin credentials from environment variables
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminEmail || !adminPassword) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be set');
    process.exit(1);
  }

  console.log(`Creating admin user with email: ${adminEmail}`);
  
  // Create a connection pool
  const pool = new Pool({
    connectionString: databaseUrl,
  });

  try {
    // Connect to the database
    const client = await pool.connect();
    try {
      console.log('Connected to database successfully.');
      
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
      
      // Verify the user was created/updated
      const verifyUser = await client.query('SELECT id, email, name FROM api.users WHERE email = $1', [adminEmail]);
      
      if (verifyUser.rows.length > 0) {
        console.log('Admin user details:');
        console.log(`- ID: ${verifyUser.rows[0].id}`);
        console.log(`- Email: ${verifyUser.rows[0].email}`);
        console.log(`- Name: ${verifyUser.rows[0].name}`);
      } else {
        console.error('Failed to verify admin user creation.');
      }
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the function
createAdminUser(); 