const fetch = require('node-fetch');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.development.local' });

// Neon API configuration
const NEON_API_KEY = process.env.NEON_API_KEY;
const NEON_API_URL = 'https://console.neon.tech/api/v2';
const PROJECT_ID = process.env.NEON_PROJECT_ID;

/**
 * Get the connection string for a Neon branch
 * @param {string} branchName - The name of the branch
 * @returns {Promise<string>} - The connection string
 */
async function getNeonBranchConnectionString(branchName) {
  if (!NEON_API_KEY) {
    throw new Error('NEON_API_KEY environment variable is not set');
  }

  if (!PROJECT_ID) {
    throw new Error('NEON_PROJECT_ID environment variable is not set');
  }

  try {
    // First, list all branches to find the branch ID
    const response = await fetch(`${NEON_API_URL}/projects/${PROJECT_ID}/branches`, {
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
    const branch = data.branches.find(b => b.name === branchName);
    
    if (!branch) {
      throw new Error(`Branch '${branchName}' not found`);
    }

    // Get the branch details to get the connection string
    const branchResponse = await fetch(`${NEON_API_URL}/projects/${PROJECT_ID}/branches/${branch.id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${NEON_API_KEY}`
      }
    });

    if (!branchResponse.ok) {
      const errorData = await branchResponse.json();
      throw new Error(`Failed to get branch details: ${JSON.stringify(errorData)}`);
    }

    const branchData = await branchResponse.json();
    return branchData.branch.endpoints[0].connection_uri;
  } catch (error) {
    console.error('Error getting connection string:', error.message);
    throw error;
  }
}

module.exports = {
  getNeonBranchConnectionString
}; 