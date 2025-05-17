import { NextRequest, NextResponse } from 'next/server';
import { isWebViewUA } from './app/utils/isWebView';
import { getToken } from 'next-auth/jwt';

const publicPaths = ['/login', '/signup', '/webview-blocked', '/api', '/_next', '/favicon.ico','/explore/business','/p'];

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  console.log("search",search)
  console.log("pathname",pathname)
  const method = request.method;
  const userAgent = request.headers.get('user-agent') || '';

  // Skip for safe static routes
  const isPublic = publicPaths.some((path) => pathname.startsWith(path));
  const isSensitivePage = pathname.startsWith('/login') || pathname.startsWith('/signup');

  // 🛑 Block WebView for login/signup
  if (isSensitivePage && isWebViewUA(userAgent)) {
    const url = request.nextUrl.clone();
    url.pathname = '/webview-blocked';
    return NextResponse.redirect(url);
  }

  // ✅ Don't intercept public routes or POST to signup/login
  if (isPublic || (method === 'POST' && isSensitivePage)) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const callbackUrl = pathname + search;
    const url = request.nextUrl.clone();
    url.pathname = '/signup';
    // Use a simpler approach to add the callbackUrl parameter
    url.searchParams.set('callbackUrl', callbackUrl);

    console.log('Redirecting to signup with callback:', url.toString());
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};