import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession();

  // If the user is not signed in and the current path starts with /admin
  // redirect to /admin/login
  if (!session && req.nextUrl.pathname.startsWith('/admin') && !req.nextUrl.pathname.startsWith('/admin/login')) {
    const redirectUrl = new URL('/admin/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If the user is signed in and trying to access /admin/login
  // redirect to /admin
  if (session && req.nextUrl.pathname === '/admin/login') {
    const redirectUrl = new URL('/admin', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*']
};
