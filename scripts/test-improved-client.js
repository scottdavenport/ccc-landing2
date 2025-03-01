// Test the improved server client
require('dotenv').config({ path: '.env.local' });

// We need to register the TypeScript compiler
require('esbuild-register');

// Now we can require the TypeScript module
const { sql, checkConnection } = require('../lib/neon/improved-server-client');

async function runTest() {
  try {
    console.log('Testing improved Neon server client...');
    console.log(`DATABASE_URL is ${process.env.DATABASE_URL ? 'set' : 'NOT set'}`);
    
    // Test connection
    const isConnected = await checkConnection();
    console.log(`Database connection: ${isConnected ? 'SUCCESS' : 'FAILED'}`);
    
    if (isConnected) {
      // Test a simple query
      const result = await sql`SELECT current_database() as db_name`;
      console.log(`Connected to database: ${result[0].db_name}`);
      
      // Test a more complex query
      const schemaResult = await sql`
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name = 'api'
      `;
      
      if (schemaResult.length > 0) {
        console.log('The "api" schema exists.');
        
        // Check tables
        const tablesResult = await sql`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'api'
        `;
        
        console.log('Tables in the "api" schema:');
        tablesResult.forEach(row => {
          console.log(`- ${row.table_name}`);
        });
      } else {
        console.log('The "api" schema does NOT exist!');
      }
    }
    
    console.log('Test completed.');
  } catch (error) {
    console.error('Error testing improved client:', error);
  }
}

runTest(); 