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
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json({ error: 'No public ID provided' }, { status: 400 });
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok') {
      return NextResponse.json({ error: 'Failed to delete image from Cloudinary' }, { status: 500 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return NextResponse.json(
      { error: 'Failed to delete image', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 