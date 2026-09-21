import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  LEGACY_COOKIE,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  checkPassword,
  createSessionToken,
} from '@/lib/session';

/**
 * Slows down password guessing: a handful of tries per IP, then a lockout.
 *
 * This lives in memory, so on serverless it's per instance — a speed bump,
 * not a wall. A long random ADMIN_PASSWORD is still the real defence.
 */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const failures = new Map<string, { count: number; first: number }>();

function clientIp(request: Request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function isLockedOut(ip: string) {
  const entry = failures.get(ip);
  if (!entry) return false;

  if (Date.now() - entry.first > WINDOW_MS) {
    failures.delete(ip);
    return false;
  }

  return entry.count >= MAX_FAILURES;
}

function recordFailure(ip: string) {
  const entry = failures.get(ip);

  if (!entry || Date.now() - entry.first > WINDOW_MS) {
    failures.set(ip, { count: 1, first: Date.now() });
  } else {
    entry.count++;
  }

  // Keep the map from growing without bound
  if (failures.size > 5000) failures.clear();
}

/**
 * Checks the password on the SERVER. On success the browser gets a signed
 * session token — never the password itself.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);

  if (isLockedOut(ip)) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again in a few minutes.' },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => ({}));

  if (!checkPassword(body?.password)) {
    recordFailure(ip);
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  failures.delete(ip);

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true, // JavaScript can't read it — protects against XSS
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // the proxy also rejects cross-site writes by Origin
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  cookieStore.delete(LEGACY_COOKIE);

  return NextResponse.json({ success: true });
}

/** Logging out just clears the cookie */
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(LEGACY_COOKIE);
  return NextResponse.json({ success: true });
}
