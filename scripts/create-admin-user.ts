import * as bcrypt from 'bcryptjs';
import { sql } from '../lib/neon/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function createAdminUser() {
  try {
    // Default admin credentials (should be changed in production)
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const name = 'Admin User';

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if the users table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'api' 
        AND table_name = 'users'
      );
    `;

    if (!tableExists[0].exists) {
      console.error('Users table does not exist. Please run the schema migration first.');
      process.exit(1);
    }

    // Create the admin user
    const result = await sql`
      SELECT api.create_admin_user(${email}, ${hashedPassword}, ${name}) as user_id;
    `;

    console.log(`Admin user created or updated with ID: ${result[0].user_id}`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password} (only shown for development, change in production)`);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the function
createAdminUser(); 