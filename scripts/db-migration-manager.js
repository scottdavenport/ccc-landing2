#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.development.local' });

// Neon API configuration
const NEON_API_KEY = process.env.NEON_API_KEY;
const NEON_API_URL = 'https://console.neon.tech/api/v2';
const NEON_PROJECT_ID = process.env.NEON_PROJECT_ID;

// Database URLs should come from environment variables
const DB_URLS = {
  main: process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL,
  development: process.env.DEVELOPMENT_DATABASE_URL || process.env.DATABASE_URL
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

// Create a new branch in Neon
async function createNeonBranch(branchName, parentId) {
  if (!NEON_API_KEY) {
    console.error('NEON_API_KEY environment variable is not set');
    process.exit(1);
  }

  if (!NEON_PROJECT_ID) {
    console.error('NEON_PROJECT_ID environment variable is not set');
    process.exit(1);
  }

  console.log(`Creating Neon branch '${branchName}' from parent '${parentId}'...`);

  try {
    const response = await fetch(`${NEON_API_URL}/projects/${NEON_PROJECT_ID}/branches`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${NEON_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endpoints: [
          {
            type: 'read_write'
          }
        ],
        branch: {
          name: branchName,
          parent_id: parentId
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create branch: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('✅ Branch created successfully');
    return data;
  } catch (error) {
    console.error('❌ Failed to create branch:', error.message);
    return null;
  }
}

// List branches in Neon project
async function listNeonBranches() {
  if (!NEON_API_KEY) {
    console.error('NEON_API_KEY environment variable is not set');
    process.exit(1);
  }

  if (!NEON_PROJECT_ID) {
    console.error('NEON_PROJECT_ID environment variable is not set');
    process.exit(1);
  }

  console.log('Listing Neon branches...');

  try {
    const response = await fetch(`${NEON_API_URL}/projects/${NEON_PROJECT_ID}/branches`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${NEON_API_KEY}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to list branches: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('✅ Branches retrieved successfully');
    return data.branches;
  } catch (error) {
    console.error('❌ Failed to list branches:', error.message);
    return null;
  }
}

// Delete a branch in Neon
async function deleteNeonBranch(branchId) {
  if (!NEON_API_KEY) {
    console.error('NEON_API_KEY environment variable is not set');
    process.exit(1);
  }

  if (!NEON_PROJECT_ID) {
    console.error('NEON_PROJECT_ID environment variable is not set');
    process.exit(1);
  }

  console.log(`Deleting Neon branch '${branchId}'...`);

  try {
    const response = await fetch(`${NEON_API_URL}/projects/${NEON_PROJECT_ID}/branches/${branchId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${NEON_API_KEY}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to delete branch: ${JSON.stringify(errorData)}`);
    }

    console.log('✅ Branch deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to delete branch:', error.message);
    return false;
  }
}

// Run Prisma migrations
async function runPrismaMigrations(databaseUrl, migrationName) {
  console.log('Running Prisma migrations...');
  
  try {
    // Ensure the database URL doesn't have quotes around it
    const cleanDatabaseUrl = databaseUrl.replace(/^"|"$/g, '');
    
    // Set DATABASE_URL environment variable for the child process
    const env = { ...process.env, DATABASE_URL: cleanDatabaseUrl };
    
    if (migrationName) {
      // Create a new migration
      execSync(`npx prisma migrate dev --name ${migrationName}`, { 
        env,
        stdio: 'inherit' 
      });
    } else {
      // Apply existing migrations
      execSync('npx prisma migrate deploy', { 
        env,
        stdio: 'inherit' 
      });
    }
    
    console.log('✅ Prisma migrations completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Prisma migrations failed:', error);
    return false;
  }
}

// Update environment files with the correct DATABASE_URL
function updateEnvFiles(databaseUrl) {
  // Remove any quotes from the database URL
  const cleanDatabaseUrl = databaseUrl.replace(/^"|"$/g, '');
  
  const envFiles = ['.env.local', '.env.development.local'];
  
  envFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace or add DATABASE_URL
      if (content.includes('DATABASE_URL=')) {
        content = content.replace(/DATABASE_URL=.*(\r?\n|$)/g, `DATABASE_URL=${cleanDatabaseUrl}$1`);
      } else {
        content += `\nDATABASE_URL=${cleanDatabaseUrl}\n`;
      }
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated ${file} with the correct DATABASE_URL`);
    } else if (file === '.env.local') {
      // Create .env.local file if it doesn't exist
      let content = `DATABASE_URL=${cleanDatabaseUrl}\n`;
      
      // Add Neon API key and project ID if they exist in environment variables
      if (process.env.NEON_API_KEY) {
        content += `NEON_API_KEY=${process.env.NEON_API_KEY}\n`;
      }
      
      if (process.env.NEON_PROJECT_ID) {
        content += `NEON_PROJECT_ID=${process.env.NEON_PROJECT_ID}\n`;
      }
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Created ${file} with the correct DATABASE_URL`);
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
  
  // Execute command
  switch (command) {
    case 'create-branch':
      // Create a new Neon branch for the current Git branch
      const parentBranch = args[1] || 'main';
      const branchName = args[2] || `feature-${currentBranch}`;
      
      // Get parent branch ID
      const branches = await listNeonBranches();
      if (!branches) process.exit(1);
      
      // Check if branch already exists
      const existingBranch = branches.find(b => b.name === branchName);
      if (existingBranch) {
        console.log(`Branch '${branchName}' already exists, using existing branch`);
        
        // Get the connection string for the existing branch
        try {
          const response = await fetch(`${NEON_API_URL}/projects/${NEON_PROJECT_ID}/branches/${existingBranch.id}/endpoints`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${NEON_API_KEY}`
            }
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to get branch endpoints: ${JSON.stringify(errorData)}`);
          }
          
          const data = await response.json();
          
          console.log('Branch endpoints response:', JSON.stringify(data, null, 2));
          
          if (!data.endpoints || data.endpoints.length === 0) {
            throw new Error('No endpoints found for the branch');
          }
          
          // Construct the connection string from the host property
          const endpoint = data.endpoints[0];
          const host = endpoint.host;
          
          // Construct the connection string directly using the host
          // Format: postgresql://user:password@host/database
          const connectionString = `postgresql://neondb_owner:${NEON_API_KEY}@${host}/neondb?sslmode=require`;
          
          // Log the connection string with the password masked for security
          const maskedConnectionString = connectionString.replace(NEON_API_KEY, '********');
          console.log('Connection string constructed:', maskedConnectionString);
          
          // Update the .env files with the new connection string
          await updateEnvFiles(connectionString);
          return;
        } catch (error) {
          console.error('❌ Failed to get branch endpoints:', error.message);
          process.exit(1);
        }
      }
      
      const parentBranchObj = branches.find(b => b.name === parentBranch);
      if (!parentBranchObj) {
        console.error(`Parent branch '${parentBranch}' not found`);
        process.exit(1);
      }
      
      const branchData = await createNeonBranch(branchName, parentBranchObj.id);
      if (!branchData) process.exit(1);
      
      // Wait for the branch to be ready
      console.log('Waiting for branch to be ready...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      if (!branchData.endpoints || branchData.endpoints.length === 0) {
        console.error('❌ No endpoints found for the newly created branch');
        process.exit(1);
      }
      
      // Construct the connection string from the host property
      const endpoint = branchData.endpoints[0];
      
      // Construct the connection string directly using the host
      // Format: postgresql://user:password@host/database
      const connectionString = `postgresql://neondb_owner:${NEON_API_KEY}@${endpoint.host}/neondb?sslmode=require`;
      
      // Log the connection string with the password masked for security
      const maskedConnectionString = connectionString.replace(NEON_API_KEY, '********');
      console.log('Connection string constructed:', maskedConnectionString);
      
      // Update the .env files with the new connection string
      await updateEnvFiles(connectionString);
      break;
      
    case 'migrate':
      // Run migrations on the current branch
      const migrationName = args[1];
      const databaseUrl = process.env.DATABASE_URL;
      
      if (!databaseUrl) {
        console.error('DATABASE_URL environment variable is not set');
        process.exit(1);
      }
      
      const migrationsSuccessful = await runPrismaMigrations(databaseUrl, migrationName);
      if (!migrationsSuccessful) process.exit(1);
      break;
      
    case 'list-branches':
      // List all branches in the Neon project
      const branchesList = await listNeonBranches();
      if (!branchesList) process.exit(1);
      
      console.log('Neon branches:');
      branchesList.forEach(branch => {
        console.log(`- ${branch.name} (${branch.id})`);
      });
      break;
      
    case 'delete-branch':
      // Delete a Neon branch
      const branchToDelete = args[1];
      if (!branchToDelete) {
        console.error('Please specify a branch to delete');
        process.exit(1);
      }
      
      const branchesToDelete = await listNeonBranches();
      if (!branchesToDelete) process.exit(1);
      
      const branchObj = branchesToDelete.find(b => b.name === branchToDelete);
      if (!branchObj) {
        console.error(`Branch '${branchToDelete}' not found`);
        process.exit(1);
      }
      
      const deleted = await deleteNeonBranch(branchObj.id);
      if (!deleted) process.exit(1);
      break;
      
    default:
      console.log(`
Database Migration Manager

Usage:
  node scripts/db-migration-manager.js <command> [options]

Commands:
  create-branch [parent] [name]  Create a new Neon branch for the current Git branch
  migrate [name]                 Run Prisma migrations on the current branch
  list-branches                  List all branches in the Neon project
  delete-branch <name>           Delete a Neon branch

Examples:
  node scripts/db-migration-manager.js create-branch main feature-user-auth
  node scripts/db-migration-manager.js migrate add-user-roles
  node scripts/db-migration-manager.js list-branches
  node scripts/db-migration-manager.js delete-branch feature-user-auth
`);
      break;
  }
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 