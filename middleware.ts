import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const publicPaths = [
  "/",
  "/api/db/connection",
  "/api/db/query",
  "/api/cloudinary/connection",
  "/api/cloudinary/status",
  "/api/cloudinary/(.*)",
  "/api/sponsors",
  "/api/sponsor-levels",
  "/sponsors",
  "/about",
  "/contact",
  "/api/webhooks(.*)",
  "/admin/login(.*)",
  "/_next/(.*)",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/images/(.*)",
];

// Create a matcher for admin routes that should be protected
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

// Create a matcher for public routes
const isPublicRoute = createRouteMatcher(publicPaths);

// Use the new clerkMiddleware approach
export default clerkMiddleware(async (auth, req) => {
  // If it's an admin route and not a login route, protect it
  if (isAdminRoute(req) && !isPublicRoute(req)) {
    await auth.protect();
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)|.*\\.(?:css|js)).*)',
    // Always run for API routes
    '/api/:path*',
    // Run for admin routes
    '/admin/:path*',
  ],
};
