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
  webpack: (config, { isServer }) => {
    // Use the improved server client in production
    if (process.env.NODE_ENV === 'production') {
      // Add the ws polyfill for WebSocket support
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          ws: false,
        };
      }
    }
    return config;
  },
};

// Log environment info during build
console.log('Next.js Build Environment:', {
  VERCEL_ENV: process.env.VERCEL_ENV,
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF,
  HAS_DATABASE_URL: !!process.env.DATABASE_URL,
  HAS_CLERK_SECRET_KEY: !!process.env.CLERK_SECRET_KEY,
  HAS_CLERK_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
});

// Add environment check
if (!process.env.DATABASE_URL) {
  console.warn('⚠️ Required DATABASE_URL environment variable is missing!');
}

if (!process.env.CLERK_SECRET_KEY) {
  console.warn('⚠️ Required CLERK_SECRET_KEY environment variable is missing!');
}

if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  console.warn('⚠️ Required NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable is missing!');
}

module.exports = nextConfig;
