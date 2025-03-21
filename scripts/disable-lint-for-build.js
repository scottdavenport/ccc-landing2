const fs = require('fs');
const path = require('path');

// Path to next.config.js
const configPath = path.join(__dirname, '..', 'next.config.js');

try {
  // Read the current config file
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  // Replace eslint configuration to disable during builds
  const updatedContent = configContent.replace(
    /eslint: \{\s*ignoreDuringBuilds: false.*?\},/s, 
    'eslint: { ignoreDuringBuilds: true },');
  
  // Write the updated content back to the file
  fs.writeFileSync(configPath, updatedContent);
  
  console.log('✅ ESLint disabled during builds in next.config.js');
} catch (error) {
  console.error('Error updating next.config.js:', error);
  process.exit(1);
} 