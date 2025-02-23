/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
};

// Log environment info during build
console.log('Next.js Build Environment:', {
  VERCEL_ENV: process.env.VERCEL_ENV,
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF,
  HAS_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  HAS_SUPABASE_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  HAS_SUPABASE_BRANCH: !!process.env.NEXT_PUBLIC_SUPABASE_BRANCH,
});

// Add environment check
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Required Supabase environment variables are missing!');
}

module.exports = nextConfig;
