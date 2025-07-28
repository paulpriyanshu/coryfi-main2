import { NextRequest, NextResponse } from 'next/server';
import { isWebViewUA } from './app/utils/isWebView';
import { getToken } from 'next-auth/jwt';

const publicPaths = [
  '/login',
  '/signup',
  '/webview-blocked',
  '/api',
  '/_next',
  '/favicon.ico',
  '/explore/business',
  '/p'
];

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const method = request.method;
  const userAgent = request.headers.get('user-agent') || '';

  // ⬇️ Create base response
  const response = NextResponse.next();

  // ➕ Set pathname cookie so Server Components can access it
  response.cookies.set("pathname", pathname);

  // ✅ Allow static/public paths and POSTs to auth pages
  const isPublic = publicPaths.some((path) => pathname.startsWith(path));
  const isSensitivePage = pathname.startsWith('/login') || pathname.startsWith('/signup');

  // 🛑 Block WebView access to login/signup
  if (isSensitivePage && isWebViewUA(userAgent)) {
    const url = request.nextUrl.clone();
    url.pathname = '/webview-blocked';
    return NextResponse.redirect(url);
  }

  if (isPublic || (method === 'POST' && isSensitivePage)) {
    return response; // 👈 return the response with cookie set
  }

  // 🔒 Auth check
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const callbackUrl = pathname + search;
    const url = request.nextUrl.clone();
    url.pathname = '/signup';
    url.searchParams.set('callbackUrl', callbackUrl);

    // console.log('Redirecting to signup with callback:', url.toString());
    return NextResponse.redirect(url);
  }

  return response; // 👈 return the response with cookie set
}

export const config = {
  matcher: ['/:path*'],
};