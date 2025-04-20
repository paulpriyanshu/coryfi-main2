// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { isWebViewUA } from './app/utils/isWebView';

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const pathname = request.nextUrl.pathname;
  const isSensitivePage = pathname.startsWith('/login') || pathname.startsWith('/signup');

  if (isSensitivePage && isWebViewUA(userAgent)) {
    const url = request.nextUrl.clone();
    url.pathname = '/webview-blocked';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/signup'],
};