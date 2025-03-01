const fs = require('fs');
const path = require('path');

// Scripts to keep (essential for maintenance or deployment)
const scriptsToKeep = [
  'README.md',
  'cleanup-scripts.js',
  'neon-db-manager.js',
  'test-db-connection.js',
  'init-db.js',
  'init-all-dbs.js',
  'init-prod-db.js',
  'init-preview-db.js',
  'import-data.js',
  'import-csv-data.js',
  'create-admin-user.js',
  'deploy-setup.js',
  'check-db-schema.js',
  'reupload-sponsor-images.js', // Keep this as it's the final working script for sponsor images
];

// Create archive directory if it doesn't exist
const archiveDir = path.join(__dirname, 'archive');
if (!fs.existsSync(archiveDir)) {
  fs.mkdirSync(archiveDir);
  console.log('Created archive directory');
}

// Get all files in the scripts directory
const scriptsDir = __dirname;
const files = fs.readdirSync(scriptsDir);

// Move files not in the keep list to the archive directory
let movedCount = 0;
for (const file of files) {
  // Skip directories and files to keep
  if (fs.statSync(path.join(scriptsDir, file)).isDirectory() || scriptsToKeep.includes(file)) {
    continue;
  }
  
  // Move file to archive directory
  const sourcePath = path.join(scriptsDir, file);
  const destPath = path.join(archiveDir, file);
  
  try {
    fs.renameSync(sourcePath, destPath);
    console.log(`Moved ${file} to archive directory`);
    movedCount++;
  } catch (error) {
    console.error(`Error moving ${file}: ${error.message}`);
  }
}

console.log(`\nSummary:`);
console.log(`Moved ${movedCount} scripts to the archive directory`);
console.log(`Kept ${scriptsToKeep.length} essential scripts`);
console.log(`\nTo delete the archive directory, run: rm -rf ${archiveDir}`);
console.log(`To restore files from the archive, run: mv ${archiveDir}/* ${scriptsDir}/`); 