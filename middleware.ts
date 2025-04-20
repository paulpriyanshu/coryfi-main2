// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { isWebViewUA } from './app/utils/isWebView';
import { getToken } from 'next-auth/jwt';

const publicPaths = ['/login', '/signup', '/webview-blocked', '/api', '/_next', '/favicon.ico'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';

  const isPublic = publicPaths.some((path) => pathname.startsWith(path));

  // 1. Block WebView on auth pages
  const isSensitivePage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  if (isSensitivePage && isWebViewUA(userAgent)) {
    const url = request.nextUrl.clone();
    url.pathname = '/webview-blocked';
    return NextResponse.redirect(url);
  }

  // 2. If route is not public, check auth
  if (!isPublic) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/signup';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Apply middleware to all routes
export const config = {
  matcher: ['/:path*'],
};