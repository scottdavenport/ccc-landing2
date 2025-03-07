import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/clerk-middleware for more information about configuring your middleware
const publicRoutes = createRouteMatcher([
  "/",
  "/api/db/connection",
  "/api/db/query",
  "/api/cloudinary/connection",
  "/api/cloudinary/status",
  "/api/cloudinary/(.*)",
  "/api/sponsors",
  "/sponsors",
  "/about",
  "/contact",
  "/api/webhooks(.*)",
  "/admin/login(.*)",
  "/admin-login",
  "/_next/(.*)", // Make Next.js static assets public
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/images/(.*)", // Make image assets public
]);

const ignoredRoutes = createRouteMatcher([
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (publicRoutes(req) || ignoredRoutes(req)) {
    return; // Allow access to public and ignored routes
  }
  
  // Protect all other routes
  await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
