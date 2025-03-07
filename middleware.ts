import { NextRequest, NextResponse } from "next/server";

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
  "/admin",
  "/admin/sponsors",
  "/admin/login(.*)",
  "/admin-login",
  "/_next/(.*)",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/images/(.*)",
];

// Convert paths to RegExp for easier matching
const publicRegexes = publicPaths.map((path) => new RegExp(`^${path.replace(/\(.*\)/g, ".*")}$`));

// Simple middleware that allows public routes and denies others
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Special case for root path - always allow
  if (pathname === "/") {
    return NextResponse.next();
  }
  
  // Check if path matches any public route
  const isPublicRoute = publicRegexes.some((regex) => regex.test(pathname));
  
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Redirect to login for non-public routes (placeholder for proper auth)
  // In a real app you'd want to use Clerk's authentication here
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}

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
