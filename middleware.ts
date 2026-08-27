import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Runs before every page. If there's no valid cookie,
 * send them to the login screen.
 */
export function middleware(request: NextRequest) {
  const cookie = request.cookies.get('lsm_admin')?.value;
  const isLoggedIn = cookie === process.env.ADMIN_PASSWORD;
  const isLoginPage = request.nextUrl.pathname === '/login';

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Already signed in? No need to see the login page
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next.js internals and the login API itself
  matcher: ['/((?!api/login|_next/static|_next/image|favicon.ico).*)'],
};