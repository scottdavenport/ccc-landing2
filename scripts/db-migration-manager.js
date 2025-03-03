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
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${NEON_API_KEY}`
      },
      body: JSON.stringify({
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

    // Wait for the branch to be ready
    // Increased from 15 seconds to 30 seconds
    console.log('Waiting for branch to be ready...');
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Get connection details
    const connectionDetails = await getConnectionDetails(data.branch.id);
    return connectionDetails;
  } catch (error) {
    console.error('Error creating branch:', error.message);
    return null;
  }
}

// Get connection details for a branch
async function getConnectionDetails(branchId) {
  console.log(`Getting connection details for branch ID: ${branchId}`);
  
  try {
    // Implement retry logic for endpoints
    let retries = 0;
    const maxRetries = 6; // Increased from 3 to 6
    const retryDelay = 20000; // Increased from 10 to 20 seconds
    
    while (retries < maxRetries) {
      console.log(`Attempt ${retries + 1}/${maxRetries} to get endpoints...`);
      
      const endpointsResponse = await fetch(`${NEON_API_URL}/projects/${NEON_PROJECT_ID}/branches/${branchId}/endpoints`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${NEON_API_KEY}`
        }
      });
      
      if (!endpointsResponse.ok) {
        console.error(`Failed to get branch endpoints (Attempt ${retries + 1}): ${endpointsResponse.statusText}`);
        retries++;
        if (retries < maxRetries) {
          console.log(`Retrying in ${retryDelay/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        throw new Error(`Failed to get branch endpoints after ${maxRetries} attempts`);
      }
      
      const endpointsData = await endpointsResponse.json();
      console.log('Branch endpoints response:', JSON.stringify(endpointsData, null, 2));
      
      if (!endpointsData.endpoints || endpointsData.endpoints.length === 0) {
        console.log(`No endpoints found (Attempt ${retries + 1}), checking if we need to create one...`);
        
        // Try to create an endpoint if none exists
        try {
          console.log('Creating new endpoint for the branch...');
          const createEndpointResponse = await fetch(`${NEON_API_URL}/projects/${NEON_PROJECT_ID}/endpoints`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${NEON_API_KEY}`
            },
            body: JSON.stringify({
              endpoint: {
                branch_id: branchId,
                type: 'read_write'
              }
            })
          });

          if (!createEndpointResponse.ok) {
            const errorData = await createEndpointResponse.json();
            console.error('Failed to create endpoint:', JSON.stringify(errorData, null, 2));
            retries++;
            if (retries < maxRetries) {
              console.log(`Waiting ${retryDelay/1000} seconds before retrying...`);
              await new Promise(resolve => setTimeout(resolve, retryDelay));
              continue;
            }
            throw new Error(`Failed to create endpoint after ${maxRetries} attempts`);
          }

          const createEndpointData = await createEndpointResponse.json();
          console.log('Successfully created new endpoint:', JSON.stringify(createEndpointData, null, 2));
          
          // Use the newly created endpoint
          endpointsData = {
            endpoints: [createEndpointData.endpoint]
          };
          break;
        } catch (createError) {
          console.error('Error creating endpoint:', createError.message);
          retries++;
          if (retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          }
          throw createError;
        }
      }
      
      return {
        id: branchId,
        endpoints: endpointsData.endpoints
      };
    }
    
    throw new Error(`Failed to get endpoints after ${maxRetries} attempts`);
  } catch (error) {
    console.error('Error getting connection details:', error.message);
    throw error;
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
    
    // Get current branch
    const currentBranch = getCurrentBranch();
    
    // For production (main branch), use db push to avoid migration issues with existing schema
    if (currentBranch === 'main') {
      console.log('Using prisma db push for production environment with --accept-data-loss flag...');
      execSync('npx prisma db push --accept-data-loss', { 
        env,
        stdio: 'inherit' 
      });
    } else if (migrationName) {
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

// Retry API call with exponential backoff
async function retryApiCall(apiCallFn, maxRetries = 3, delay = 10000) {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      console.log(`Attempt ${retries + 1}/${maxRetries}...`);
      return await apiCallFn();
    } catch (error) {
      console.log(`Attempt ${retries + 1} failed: ${error.message}`);
      
      if (retries === maxRetries - 1) {
        throw error;
      }
      
      console.log(`Waiting ${delay / 1000} seconds before retrying...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      retries++;
    }
  }
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
        
        // Get the connection details from the Neon API
        try {
          // Get the endpoints for the branch with retry logic
          let retries = 0;
          const maxRetries = 6;
          const retryDelay = 20000; // 20 seconds
          
          let endpointsData;
          while (retries < maxRetries) {
            console.log(`Attempt ${retries + 1}/${maxRetries} to get endpoints...`);
            
            const endpointsResponse = await fetch(`${NEON_API_URL}/projects/${NEON_PROJECT_ID}/branches/${existingBranch.id}/endpoints`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${NEON_API_KEY}`
              }
            });
            
            if (!endpointsResponse.ok) {
              console.error(`Failed to get branch endpoints (Attempt ${retries + 1}): ${endpointsResponse.statusText}`);
              retries++;
              if (retries < maxRetries) {
                console.log(`Retrying in ${retryDelay/1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                continue;
              }
              throw new Error(`Failed to get branch endpoints after ${maxRetries} attempts`);
            }
            
            endpointsData = await endpointsResponse.json();
            console.log('Branch endpoints response:', JSON.stringify(endpointsData, null, 2));
            
            if (!endpointsData.endpoints || endpointsData.endpoints.length === 0) {
              console.log(`No endpoints found (Attempt ${retries + 1}), checking if we need to create one...`);
              
              // Try to create an endpoint if none exists
              try {
                console.log('Creating new endpoint for the branch...');
                const createEndpointResponse = await fetch(`${NEON_API_URL}/projects/${NEON_PROJECT_ID}/endpoints`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${NEON_API_KEY}`
                  },
                  body: JSON.stringify({
                    endpoint: {
                      branch_id: existingBranch.id,
                      type: 'read_write'
                    }
                  })
                });

                if (!createEndpointResponse.ok) {
                  const errorData = await createEndpointResponse.json();
                  console.error('Failed to create endpoint:', JSON.stringify(errorData, null, 2));
                  retries++;
                  if (retries < maxRetries) {
                    console.log(`Waiting ${retryDelay/1000} seconds before retrying...`);
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    continue;
                  }
                  throw new Error(`Failed to create endpoint after ${maxRetries} attempts`);
                }

                const createEndpointData = await createEndpointResponse.json();
                console.log('Successfully created new endpoint:', JSON.stringify(createEndpointData, null, 2));
                
                // Use the newly created endpoint
                endpointsData = {
                  endpoints: [createEndpointData.endpoint]
                };
                break;
              } catch (createError) {
                console.error('Error creating endpoint:', createError.message);
                retries++;
                if (retries < maxRetries) {
                  await new Promise(resolve => setTimeout(resolve, retryDelay));
                  continue;
                }
                throw createError;
              }
            }
            
            break; // Success! Exit the retry loop
          }
          
          if (!endpointsData || !endpointsData.endpoints || endpointsData.endpoints.length === 0) {
            throw new Error(`Failed to get endpoints after ${maxRetries} attempts`);
          }
          
          // Get the first endpoint ID and host
          const endpointId = endpointsData.endpoints[0].id;
          const host = endpointsData.endpoints[0].host;
          
          // Get the databases for the branch with retry logic
          const databasesData = await retryApiCall(async () => {
            console.log('Getting databases for the branch...');
            const databasesResponse = await fetch(`${NEON_API_URL}/projects/${NEON_PROJECT_ID}/branches/${existingBranch.id}/databases`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${NEON_API_KEY}`
              }
            });
            
            if (!databasesResponse.ok) {
              throw new Error(`Failed to get branch databases: ${databasesResponse.statusText}`);
            }
            
            const data = await databasesResponse.json();
            if (!data.databases || data.databases.length === 0) {
              throw new Error('No databases found for this branch');
            }
            
            return data;
          }, maxRetries, retryDelay);
          
          // Get the first database name
          const databaseName = databasesData.databases[0].name;
          
          // Get the roles for the branch with retry logic
          const rolesData = await retryApiCall(async () => {
            console.log('Getting roles for the branch...');
            const rolesResponse = await fetch(`${NEON_API_URL}/projects/${NEON_PROJECT_ID}/branches/${existingBranch.id}/roles`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${NEON_API_KEY}`
              }
            });
            
            if (!rolesResponse.ok) {
              throw new Error(`Failed to get branch roles: ${rolesResponse.statusText}`);
            }
            
            const data = await rolesResponse.json();
            if (!data.roles || data.roles.length === 0) {
              throw new Error('No roles found for this branch');
            }
            
            return data;
          }, maxRetries, retryDelay);
          
          // Get the first role name
          const roleName = rolesData.roles[0].name;
          
          // Get the role password with retry logic
          const passwordData = await retryApiCall(async () => {
            console.log('Getting role password...');
            const passwordResponse = await fetch(`${NEON_API_URL}/projects/${NEON_PROJECT_ID}/branches/${existingBranch.id}/roles/${roleName}/reveal_password`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${NEON_API_KEY}`
              }
            });
            
            if (!passwordResponse.ok) {
              throw new Error(`Failed to get role password: ${passwordResponse.statusText}`);
            }
            
            return await passwordResponse.json();
          }, maxRetries, retryDelay);
          
          const password = passwordData.password;
          
          // Construct the connection string
          const connectionString = `postgresql://${roleName}:${password}@${host}/${databaseName}`;
          
          console.log('Connection details retrieved successfully');
          
          // Log the connection string with the password masked for security
          const maskedConnectionString = connectionString.replace(/:[^:@]+@/, ':********@');
          console.log('Connection string constructed:', maskedConnectionString);
          
          // Update the .env files with the new connection string
          updateEnvFiles(connectionString);
          return;
        } catch (error) {
          console.error('❌ Failed to get connection details:', error.message);
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
      // Increase wait time from 5 seconds to 15 seconds to ensure database is ready
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      if (!branchData.endpoints || branchData.endpoints.length === 0) {
        console.error('❌ No endpoints found for the newly created branch');
        process.exit(1);
      }
      
      // Get the connection details from the Neon API with retry logic
      try {
        // Get the endpoint ID from the branch data
        const endpointId = branchData.endpoints[0].id;
        
        // Get the databases for the branch with retry logic
        const getDatabases = async () => {
          console.log('Getting databases for the branch...');
          const databasesResponse = await fetch(`${NEON_API_URL}/projects/${NEON_PROJECT_ID}/branches/${branchData.id}/databases`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${NEON_API_KEY}`
            }
          });
          
          if (!databasesResponse.ok) {
            throw new Error(`Failed to get branch databases: ${databasesResponse.statusText}`);
          }
          
          const databasesData = await databasesResponse.json();
          
          if (!databasesData.databases || databasesData.databases.length === 0) {
            throw new Error('No databases found for this branch');
          }
          
          return databasesData;
        };
        
        const databasesData = await retryApiCall(getDatabases);
        
        // Get the first database name
        const databaseName = databasesData.databases[0].name;
        
        // Get the roles for the branch with retry logic
        const getRoles = async () => {
          console.log('Getting roles for the branch...');
          const rolesResponse = await fetch(`${NEON_API_URL}/projects/${NEON_PROJECT_ID}/branches/${branchData.id}/roles`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${NEON_API_KEY}`
            }
          });
          
          if (!rolesResponse.ok) {
            throw new Error(`Failed to get branch roles: ${rolesResponse.statusText}`);
          }
          
          const rolesData = await rolesResponse.json();
          
          if (!rolesData.roles || rolesData.roles.length === 0) {
            throw new Error('No roles found for this branch');
          }
          
          return rolesData;
        };
        
        const rolesData = await retryApiCall(getRoles);
        
        // Get the first role name
        const roleName = rolesData.roles[0].name;
        
        // Get the role password with retry logic
        const getPassword = async () => {
          console.log('Getting role password...');
          const passwordResponse = await fetch(`${NEON_API_URL}/projects/${NEON_PROJECT_ID}/branches/${branchData.id}/roles/${roleName}/reveal_password`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${NEON_API_KEY}`
            }
          });
          
          if (!passwordResponse.ok) {
            throw new Error(`Failed to get role password: ${passwordResponse.statusText}`);
          }
          
          return await passwordResponse.json();
        };
        
        const passwordData = await retryApiCall(getPassword);
        const password = passwordData.password;
        
        // Get the endpoint host
        const host = branchData.endpoints[0].host;
        
        // Construct the connection string
        const connectionString = `postgresql://${roleName}:${password}@${host}/${databaseName}`;
        
        console.log('Connection details retrieved successfully');
        
        // Log the connection string with the password masked for security
        const maskedConnectionString = connectionString.replace(/:[^:@]+@/, ':********@');
        console.log('Connection string constructed:', maskedConnectionString);
        
        // Update the .env files with the new connection string
        updateEnvFiles(connectionString);
      } catch (error) {
        console.error('❌ Failed to get connection details:', error.message);
        process.exit(1);
      }
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
        console.log('Available branches:');
        branchesToDelete.forEach(b => console.log(`- ${b.name}`));
        // Don't exit with error if branch doesn't exist - it might have been already deleted
        console.log('Branch may have been already deleted or never existed. Continuing...');
        process.exit(0);
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