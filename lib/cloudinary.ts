import { v2 as cloudinary } from 'cloudinary';

// Define required environment variables type
type RequiredEnvVars = {
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: string;
};

// Check for required environment variables
const requiredEnvVars = {
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
} as RequiredEnvVars;

// Validate environment variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: requiredEnvVars.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: requiredEnvVars.CLOUDINARY_API_KEY,
  api_secret: requiredEnvVars.CLOUDINARY_API_SECRET,
  secure: true,
});

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  error?: {
    message: string;
  };
}

export interface UploadResult {
  url: string;
  publicId: string;
}

export const uploadImage = async (file: File): Promise<UploadResult> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', requiredEnvVars.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${requiredEnvVars.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as CloudinaryResponse;

    if (data.error) {
      throw new Error(data.error.message);
    }

    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error instanceof Error ? error : new Error('Failed to upload image to Cloudinary');
  }
};

export const verifyConfiguration = async (): Promise<boolean> => {
  try {
    // Test the configuration by attempting to get account details
    const result = await cloudinary.api.ping();
    return result.status === 'ok';
  } catch (error) {
    console.error('Error verifying Cloudinary configuration:', error);
    return false;
  }
};

export default cloudinary;
