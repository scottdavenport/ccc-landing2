#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');

// Database URLs for different environments
const DB_URLS = {
  main: 'postgresql://***REMOVED***@ep-mute-tooth-a4mrn29b-pooler.us-east-1.aws.neon.tech/ccc-landing?sslmode=require',
  development: 'postgresql://***REMOVED***@ep-hidden-paper-a4a7tmcd-pooler.us-east-1.aws.neon.tech/ccc-landing?sslmode=require'
};

// Get current branch name
function getCurrentBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  } catch (error) {
    console.error('Error getting current branch:', error.message);
    return null;
  }
}

// Determine which database to use based on branch
function getDatabaseUrl(branch) {
  if (branch === 'main') {
    return DB_URLS.main;
  } else if (branch === 'development') {
    return DB_URLS.development;
  } else {
    // For feature branches, default to development database
    console.log(`Branch '${branch}' is not main or development, using development database.`);
    return DB_URLS.development;
  }
}

// Test database connection
async function testConnection(databaseUrl) {
  const pool = new Pool({ connectionString: databaseUrl });
  
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to the database');
    
    const result = await client.query('SELECT current_database() as db_name');
    console.log(`Connected to database: ${result.rows[0].db_name}`);
    
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error.message);
    await pool.end();
    return false;
  }
}

// Initialize database with schema and data
async function initializeDatabase(databaseUrl) {
  console.log('Initializing database with schema and data...');
  
  try {
    // Set DATABASE_URL environment variable for the child process
    const env = { ...process.env, DATABASE_URL: databaseUrl };
    
    // Run the deploy-setup.js script
    execSync('node scripts/deploy-setup.js', { 
      env,
      stdio: 'inherit' 
    });
    
    console.log('✅ Database initialization completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}

// Update environment files with the correct DATABASE_URL
function updateEnvFiles(databaseUrl) {
  const envFiles = ['.env.local', '.env.development.local'];
  
  envFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace or add DATABASE_URL
      if (content.includes('DATABASE_URL=')) {
        content = content.replace(/***REMOVED***(\r?\n|$)/g, `DATABASE_URL="${databaseUrl}"$1`);
      } else {
        content += `\nDATABASE_URL="${databaseUrl}"\n`;
      }
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated ${file} with the correct DATABASE_URL`);
    } else {
      console.log(`⚠️ ${file} does not exist, skipping`);
    }
  });
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  // Get current branch
  const currentBranch = getCurrentBranch();
  if (!currentBranch) {
    console.error('Could not determine current Git branch');
    process.exit(1);
  }
  
  console.log(`Current branch: ${currentBranch}`);
  
  // Get database URL for the current branch
  const databaseUrl = args[1] || getDatabaseUrl(currentBranch);
  console.log(`Using database URL for ${currentBranch} branch`);
  
  // Execute command
  switch (command) {
    case 'test':
      // Test database connection
      const connected = await testConnection(databaseUrl);
      if (!connected) process.exit(1);
      break;
      
    case 'init':
      // Initialize database
      const initialized = await initializeDatabase(databaseUrl);
      if (!initialized) process.exit(1);
      break;
      
    case 'update-env':
      // Update environment files
      updateEnvFiles(databaseUrl);
      break;
      
    case 'switch':
      // Switch to a different branch's database
      const branchToSwitch = args[1];
      if (!branchToSwitch) {
        console.error('Please specify a branch to switch to');
        process.exit(1);
      }
      
      const switchUrl = getDatabaseUrl(branchToSwitch);
      console.log(`Switching to ${branchToSwitch} branch database`);
      updateEnvFiles(switchUrl);
      break;
      
    default:
      console.log(`
Neon Database Manager

Usage:
  node scripts/neon-db-manager.js <command> [options]

Commands:
  test         Test connection to the database for the current branch
  init         Initialize the database with schema and data
  update-env   Update environment files with the correct DATABASE_URL
  switch       Switch to a different branch's database (e.g., main or development)

Examples:
  node scripts/neon-db-manager.js test
  node scripts/neon-db-manager.js init
  node scripts/neon-db-manager.js update-env
  node scripts/neon-db-manager.js switch main
`);
      break;
  }
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 