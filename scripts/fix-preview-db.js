// Script to fix the Preview database by running all necessary steps
require('dotenv').config();
const { execSync } = require('child_process');

console.log('🔧 Starting Preview database fix process...');

// Get environment variables
const previewDbUrl = process.env.PREVIEW_DATABASE_URL;
const prodDbUrl = process.env.PROD_DATABASE_URL;

if (!previewDbUrl) {
  console.error('❌ PREVIEW_DATABASE_URL environment variable is not set');
  process.exit(1);
}

if (!prodDbUrl) {
  console.error('❌ PROD_DATABASE_URL environment variable is not set');
  process.exit(1);
}

try {
  // Create environment object for child processes
  const env = {
    ...process.env,
    DATABASE_URL: previewDbUrl
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
  execSync('node scripts/init-preview-db.js', { 
    stdio: 'inherit',
    env
  });

  // Step 3: Copy data from Production to Preview
  console.log('\n📋 Step 3: Copying data from Production to Preview...');
  execSync('node scripts/copy-prod-to-preview.js', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: previewDbUrl,
      PREVIEW_DATABASE_URL: previewDbUrl,
      PROD_DATABASE_URL: prodDbUrl
    }
  });

  // Step 4: Final check
  console.log('\n✅ Step 4: Final database check...');
  execSync('node scripts/check-db-schema.js', { 
    stdio: 'inherit',
    env
  });

  console.log('\n🎉 Preview database fix process completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Redeploy your Preview environment in Vercel');
  console.log('2. Check if the sponsors are now loading correctly');
  console.log('3. If issues persist, check the Vercel logs for more details');

} catch (error) {
  console.error('\n❌ Preview database fix process failed:', error.message);
  process.exit(1);
} 