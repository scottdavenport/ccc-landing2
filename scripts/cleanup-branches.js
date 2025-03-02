#!/usr/bin/env node

const { execSync } = require('child_process');
const fetch = require('node-fetch');

// Replace these with your actual values
const NEON_API_KEY = process.env.NEON_API_KEY || 'YOUR_NEON_API_KEY';
const NEON_PROJECT_ID = process.env.NEON_PROJECT_ID || 'YOUR_NEON_PROJECT_ID';
const NEON_API_URL = 'https://console.neon.tech/api/v2';

// Function to list all branches
async function listNeonBranches() {
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
    console.error('Error listing branches:', error.message);
    return null;
  }
}

// Function to delete a branch
async function deleteNeonBranch(branchId) {
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
    console.error('Error deleting branch:', error.message);
    return false;
  }
}

// Function to get closed PRs
async function getClosedPRs() {
  try {
    const output = execSync('gh pr list --state closed --limit 100 --json number').toString();
    const prs = JSON.parse(output);
    return prs.map(pr => pr.number);
  } catch (error) {
    console.error('Error getting closed PRs:', error.message);
    return [];
  }
}

// Main function
async function main() {
  // Get all branches
  const branches = await listNeonBranches();
  if (!branches) {
    console.error('Failed to list branches');
    process.exit(1);
  }

  // Get all closed PRs
  const closedPRs = await getClosedPRs();
  console.log('Closed PRs:', closedPRs);

  // Find preview branches for closed PRs
  const branchesToDelete = branches.filter(branch => {
    const match = branch.name.match(/^preview-pr-(\d+)$/);
    if (match) {
      const prNumber = parseInt(match[1], 10);
      return closedPRs.includes(prNumber);
    }
    return false;
  });

  console.log(`Found ${branchesToDelete.length} branches to delete`);

  // Delete each branch
  for (const branch of branchesToDelete) {
    console.log(`Deleting branch ${branch.name}...`);
    await deleteNeonBranch(branch.id);
  }

  console.log('Cleanup completed!');
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 