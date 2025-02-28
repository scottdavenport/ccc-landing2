/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

// Log environment info during build
console.log('Next.js Build Environment:', {
  VERCEL_ENV: process.env.VERCEL_ENV,
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF,
  HAS_DATABASE_URL: !!process.env.DATABASE_URL,
  HAS_NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
  HAS_NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
});

// Add environment check
if (!process.env.DATABASE_URL) {
  console.warn('⚠️ Required DATABASE_URL environment variable is missing!');
}

if (!process.env.NEXTAUTH_SECRET) {
  console.warn('⚠️ Required NEXTAUTH_SECRET environment variable is missing!');
}

module.exports = nextConfig;
