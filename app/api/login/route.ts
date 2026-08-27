import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Checks the password on the SERVER, so the real password never
 * reaches the browser. On success we set a cookie that every
 * later request carries automatically.
 */
export async function POST(request: Request) {
  const { password } = await request.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  const cookieStore = await cookies();

  cookieStore.set('lsm_admin', password, {
    httpOnly: true,          // JavaScript can't read it — protects against XSS
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // one week
    path: '/',
  });

  return NextResponse.json({ success: true });
}

/** Logging out just clears the cookie */
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('lsm_admin');
  return NextResponse.json({ success: true });
}