const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');

// Function to extract DATABASE_URL from an env file
function getDatabaseUrlFromEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const envContent = fs.readFileSync(filePath, 'utf8');
  const match = envContent.match(/DATABASE_URL="([^"]+)"/);
  return match ? match[1] : null;
}

// Function to initialize a database
function initializeDatabase(databaseUrl, envName) {
  if (!databaseUrl) {
    console.log(`No DATABASE_URL found for ${envName} environment. Skipping...`);
    return;
  }
  
  console.log(`Initializing ${envName} database...`);
  try {
    execSync(`DATABASE_URL="${databaseUrl}" node scripts/deploy-setup.js`, { stdio: 'inherit' });
    console.log(`${envName} database initialized successfully.`);
  } catch (error) {
    console.error(`Error initializing ${envName} database:`, error.message);
  }
}

// Main function
async function initAllDatabases() {
  console.log('Starting database initialization for all environments...');
  
  // Get DATABASE_URLs from different env files
  const localDbUrl = getDatabaseUrlFromEnvFile(path.join(__dirname, '..', '.env.local'));
  const devDbUrl = getDatabaseUrlFromEnvFile(path.join(__dirname, '..', '.env.development.local'));
  const prodDbUrl = getDatabaseUrlFromEnvFile(path.join(__dirname, '..', '.env.production.local'));
  const testDbUrl = getDatabaseUrlFromEnvFile(path.join(__dirname, '..', '.env.test.local'));
  
  // Initialize each database
  if (localDbUrl) {
    initializeDatabase(localDbUrl, 'Local');
  }
  
  if (devDbUrl) {
    initializeDatabase(devDbUrl, 'Development');
  }
  
  if (prodDbUrl) {
    initializeDatabase(prodDbUrl, 'Production');
  }
  
  if (testDbUrl) {
    initializeDatabase(testDbUrl, 'Test');
  }
  
  console.log('Database initialization completed for all environments.');
}

// Run the initialization
initAllDatabases(); 