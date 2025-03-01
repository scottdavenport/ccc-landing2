require('dotenv').config({ path: '.env.local' });
const { v2: cloudinary } = require('cloudinary');
const { Pool } = require('pg');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Check if DATABASE_URL is set
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Create a connection pool
const pool = new Pool({
  connectionString: databaseUrl,
});

async function getSponsorRecords() {
  try {
    console.log('Getting sponsor records from the database...');
    
    const client = await pool.connect();
    try {
      // Query to get all sponsors with their Cloudinary IDs and image URLs
      const result = await client.query(`
        SELECT id, name, cloudinary_public_id, image_url
        FROM api.sponsors
        WHERE cloudinary_public_id IS NOT NULL
        ORDER BY name
      `);
      
      console.log(`Found ${result.rowCount} sponsor records with Cloudinary IDs.`);
      return result.rows;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error getting sponsor records:', error);
    return [];
  }
}

async function getCloudinaryAssets() {
  try {
    console.log('Getting assets from Cloudinary...');
    
    // Get assets in the sponsors folder
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'sponsors/',
      max_results: 500
    });
    
    console.log(`Found ${result.resources.length} assets in the sponsors folder.`);
    return result.resources;
  } catch (error) {
    console.error('Error getting Cloudinary assets:', error);
    return [];
  }
}

async function verifySponsorsInFolder() {
  try {
    // Get sponsor records from the database
    const sponsors = await getSponsorRecords();
    
    if (sponsors.length === 0) {
      console.log('No sponsor records found with Cloudinary IDs.');
      return;
    }
    
    // Get assets from Cloudinary
    const assets = await getCloudinaryAssets();
    
    if (assets.length === 0) {
      console.log('No assets found in the sponsors folder.');
      return;
    }
    
    // Create a map of Cloudinary public IDs for quick lookup
    const assetMap = new Map();
    assets.forEach(asset => {
      assetMap.set(asset.public_id, asset);
    });
    
    // Check each sponsor
    const results = {
      correct: [],
      incorrect: [],
      missing: []
    };
    
    for (const sponsor of sponsors) {
      const publicId = sponsor.cloudinary_public_id;
      
      // Check if the public ID starts with 'sponsors/'
      if (!publicId.startsWith('sponsors/')) {
        results.incorrect.push({
          ...sponsor,
          issue: 'Public ID does not start with sponsors/'
        });
        continue;
      }
      
      // Check if the asset exists in Cloudinary
      if (assetMap.has(publicId)) {
        results.correct.push(sponsor);
      } else {
        results.missing.push({
          ...sponsor,
          issue: 'Asset not found in Cloudinary'
        });
      }
    }
    
    // Print results
    console.log('\nVerification Results:');
    console.log(`✅ ${results.correct.length} sponsors have correctly formatted public IDs and exist in Cloudinary`);
    
    if (results.incorrect.length > 0) {
      console.log(`\n❌ ${results.incorrect.length} sponsors have incorrectly formatted public IDs:`);
      results.incorrect.forEach(sponsor => {
        console.log(`  - ${sponsor.name}: ${sponsor.cloudinary_public_id} (${sponsor.issue})`);
      });
    }
    
    if (results.missing.length > 0) {
      console.log(`\n❌ ${results.missing.length} sponsors have correctly formatted public IDs but are missing from Cloudinary:`);
      results.missing.forEach(sponsor => {
        console.log(`  - ${sponsor.name}: ${sponsor.cloudinary_public_id} (${sponsor.issue})`);
      });
    }
    
    // Check for assets in Cloudinary that are not in the database
    const dbPublicIds = new Set(sponsors.map(s => s.cloudinary_public_id));
    const orphanedAssets = assets.filter(asset => !dbPublicIds.has(asset.public_id));
    
    if (orphanedAssets.length > 0) {
      console.log(`\n⚠️ ${orphanedAssets.length} assets in the sponsors folder are not linked to any sponsor in the database:`);
      orphanedAssets.forEach(asset => {
        console.log(`  - ${asset.public_id} (created at ${new Date(asset.created_at).toLocaleString()})`);
      });
    }
    
    return {
      sponsors,
      assets,
      results
    };
  } catch (error) {
    console.error('Error verifying sponsor images:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
verifySponsorsInFolder()
  .then(() => {
    console.log('\nVerification completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error running script:', error);
    process.exit(1);
  }); 