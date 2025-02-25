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

    // Get upload preset details
    const presetName = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const result = await cloudinary.api.upload_preset(presetName);

    return NextResponse.json({
      status: 'success',
      preset: {
        name: result.name,
        folder: result.folder,
        unsigned: !result.signing_required,
      },
    });
  } catch (error) {
    console.error('Error verifying upload preset:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to verify upload preset',
        details: 'Make sure the upload preset exists and is configured as unsigned',
      },
      { status: 500 }
    );
  }
}
