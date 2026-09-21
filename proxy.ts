import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * A write must come from this site. Browsers always send Origin on
 * cross-site POST/PATCH/DELETE, so a mismatch means another page is trying
 * to act with the admin's cookie.
 */
function isCrossSiteWrite(request: NextRequest) {
  if (SAFE_METHODS.has(request.method)) return false;

  const origin = request.headers.get('origin');
  if (!origin) return false;

  return origin !== request.nextUrl.origin;
}

/**
 * Runs before every page and API call. No valid session means the login
 * screen for pages, and a 401 for the API.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith('/api/');

  if (isApi && isCrossSiteWrite(request)) {
    return NextResponse.json({ error: 'Cross-site request blocked' }, { status: 403 });
  }

  const isLoggedIn = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  const isLoginPage = pathname === '/login';
  const isLoginApi = pathname === '/api/login';

  if (isLoginApi) return NextResponse.next();

  if (!isLoggedIn && !isLoginPage) {
    if (isApi) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Already signed in? No need to see the login page
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)'],
};
