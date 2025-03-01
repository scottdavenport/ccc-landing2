// Script to fix the Production database by running all necessary steps
require('dotenv').config();
const { execSync } = require('child_process');

console.log('🔧 Starting Production database fix process...');

// Get environment variables
const prodDbUrl = process.env.PROD_DATABASE_URL || process.env.DATABASE_URL;

if (!prodDbUrl) {
  console.error('❌ PROD_DATABASE_URL or DATABASE_URL environment variable is not set');
  process.exit(1);
}

try {
  // Create environment object for child processes
  const env = {
    ...process.env,
    DATABASE_URL: prodDbUrl
  };

  // Step 1: Check the current database state
  console.log('\n📊 Step 1: Checking current database state...');
  try {
    execSync('node scripts/check-db-schema.js', { 
      stdio: 'inherit',
      env
    });
    console.log('✅ Database check passed!');
  } catch (error) {
    console.warn('⚠️ Database check failed, continuing with initialization...');
  }

  // Step 2: Initialize the database schema
  console.log('\n🏗️ Step 2: Initializing database schema...');
  execSync('node scripts/init-prod-db.js', { 
    stdio: 'inherit',
    env
  });

  // Step 3: Final check
  console.log('\n✅ Step 3: Final database check...');
  execSync('node scripts/check-db-schema.js', { 
    stdio: 'inherit',
    env
  });

  console.log('\n🎉 Production database fix process completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Redeploy your Production environment in Vercel');
  console.log('2. Check if the sponsors are now loading correctly');
  console.log('3. If issues persist, check the Vercel logs for more details');

} catch (error) {
  console.error('\n❌ Production database fix process failed:', error.message);
  process.exit(1);
} 