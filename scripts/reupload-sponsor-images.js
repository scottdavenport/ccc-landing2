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
        WHERE image_url IS NOT NULL
        ORDER BY name
      `);
      
      console.log(`Found ${result.rowCount} sponsor records with image URLs.`);
      return result.rows;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error getting sponsor records:', error);
    return [];
  }
}

async function reuploadImage(sponsor) {
  try {
    console.log(`Re-uploading image for ${sponsor.name}...`);
    
    // Extract the public ID from the cloudinary_public_id field
    // It should be in the format "sponsors/publicId"
    const publicIdParts = sponsor.cloudinary_public_id.split('/');
    const baseName = publicIdParts.length > 1 ? publicIdParts[1] : sponsor.cloudinary_public_id;
    
    // Upload the image to Cloudinary using the image_url
    const result = await cloudinary.uploader.upload(sponsor.image_url, {
      public_id: baseName,
      folder: 'sponsors',
      overwrite: true
    });
    
    console.log(`Successfully uploaded image for ${sponsor.name}.`);
    console.log(`New URL: ${result.secure_url}`);
    console.log(`Public ID: ${result.public_id}`);
    
    return {
      id: sponsor.id,
      name: sponsor.name,
      oldImageUrl: sponsor.image_url,
      newImageUrl: result.secure_url,
      publicId: result.public_id,
      success: true
    };
  } catch (error) {
    console.error(`Error re-uploading image for ${sponsor.name}:`, error);
    return {
      id: sponsor.id,
      name: sponsor.name,
      success: false,
      error: error.message
    };
  }
}

async function updateSponsorRecord(sponsor, newImageUrl) {
  try {
    console.log(`Updating database record for ${sponsor.name}...`);
    
    const client = await pool.connect();
    try {
      const result = await client.query(`
        UPDATE api.sponsors
        SET image_url = $1
        WHERE id = $2
        RETURNING id, name, cloudinary_public_id, image_url
      `, [newImageUrl, sponsor.id]);
      
      if (result.rowCount > 0) {
        console.log(`Successfully updated database record for ${sponsor.name}.`);
        return {
          success: true,
          record: result.rows[0]
        };
      } else {
        console.log(`No record found for sponsor ID ${sponsor.id}.`);
        return {
          success: false,
          error: 'No matching record found'
        };
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error updating database record for ${sponsor.name}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function reuploadSponsorImages() {
  try {
    // Get sponsor records from the database
    const sponsors = await getSponsorRecords();
    
    if (sponsors.length === 0) {
      console.log('No sponsor records found with image URLs.');
      return [];
    }
    
    // Process each sponsor
    const results = [];
    for (const sponsor of sponsors) {
      // Re-upload the image
      const uploadResult = await reuploadImage(sponsor);
      
      if (uploadResult.success) {
        // Update the database record with the new image URL
        const updateResult = await updateSponsorRecord(sponsor, uploadResult.newImageUrl);
        
        results.push({
          ...uploadResult,
          dbUpdateSuccess: updateResult.success
        });
      } else {
        results.push(uploadResult);
      }
    }
    
    // Print summary
    console.log('\nSummary:');
    const successful = results.filter(r => r.success).length;
    console.log(`Successfully processed ${successful} out of ${sponsors.length} sponsor images.`);
    
    if (successful < sponsors.length) {
      console.log('\nFailed operations:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`- ${r.name}: ${r.error || 'Unknown error'}`);
      });
    }
    
    return results;
  } catch (error) {
    console.error('Error re-uploading sponsor images:', error);
    return [];
  } finally {
    await pool.end();
  }
}

// Run the script
reuploadSponsorImages()
  .then(() => {
    console.log('\nOperation completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error running script:', error);
    process.exit(1);
  }); 