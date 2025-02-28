import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const logoFile = formData.get('logo') as File;
    const oldPublicId = formData.get('oldPublicId') as string;

    if (!logoFile) {
      return NextResponse.json({ error: 'No logo file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await logoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Base64 encode the buffer
    const base64Data = buffer.toString('base64');
    const dataURI = `data:${logoFile.type};base64,${base64Data}`;

    // Delete old image if it exists
    if (oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
      } catch (error) {
        console.error('Error deleting old image from Cloudinary:', error);
        // Continue with upload even if delete fails
      }
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: 'sponsors',
      resource_type: 'image',
      format: 'webp',
      transformation: [
        { width: 500, height: 500, crop: 'limit' },
        { quality: 'auto:good' },
      ],
    });

    return NextResponse.json({
      image_url: uploadResult.secure_url,
      cloudinary_public_id: uploadResult.public_id,
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    return NextResponse.json(
      { error: 'Failed to upload logo', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Increase payload size limit for the route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
