import { NextResponse } from 'next/server';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('logo') as File;
    const oldPublicId = formData.get('oldPublicId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // If there's an old image, delete it first
    if (oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
      } catch (deleteError) {
        console.error('Error deleting old image:', deleteError);
        // Continue with upload even if delete fails
      }
    }

    // Convert File to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Cloudinary
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'sponsors',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
            transformation: [
              { width: 800, height: 800, crop: 'limit' },
              { quality: 'auto:good' },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else if (result) resolve(result);
            else reject(new Error('No result from Cloudinary upload'));
          }
        )
        .end(buffer);
    });

    // Return the Cloudinary URL
    return NextResponse.json({
      image_url: result.secure_url,
      cloudinary_public_id: result.public_id,
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
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
