import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    // Ping Cloudinary to check connection
    const result = await cloudinary.api.ping();
    
    return NextResponse.json({ 
      status: result.status === 'ok' ? 'connected' : 'error',
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    });
  } catch (error) {
    console.error('Cloudinary connection check error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      },
      { status: 500 }
    );
  }
}
