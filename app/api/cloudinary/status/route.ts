import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function GET() {
  try {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Test connection by trying to get account details
    const result = await cloudinary.api.ping();
    if (result.status !== 'ok') {
      throw new Error('Cloudinary connection test failed');
    }

    return NextResponse.json({ status: 'connected' });
  } catch (error) {
    console.error('Cloudinary connection error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to connect to Cloudinary',
      },
      { status: 500 }
    );
  }
}
