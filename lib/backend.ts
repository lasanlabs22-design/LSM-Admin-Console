import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, backendKey, verifySessionToken } from './session';

/**
 * Where the backend lives.
 *
 * API_URL has no NEXT_PUBLIC_ prefix, which means it's read at runtime
 * rather than baked in when the site is built — so changing it in Vercel
 * takes effect on the next request, with no redeploy.
 *
 * Only local development falls back to localhost. In production a missing
 * setting is an error, so a misconfigured deploy says so instead of
 * quietly calling a server that isn't there.
 */
export function apiUrl(): string {
  const url = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (url) return url.replace(/\/+$/, '');

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'API_URL is not set. Add it in the Vercel project settings and redeploy.'
    );
  }

  return 'http://localhost:3000';
}

export async function isSignedIn() {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/**
 * Makes an id safe to drop into a backend path.
 *
 * Route params arrive already decoded, so an id like "..%2Fstats" would
 * otherwise become "../stats" and reach a different backend endpoint.
 */
export function segment(id: string): string | null {
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) return null;
  return encodeURIComponent(id);
}

type ForwardOptions = {
  method?: string;
  /** Read the incoming JSON body and pass it on */
  withBody?: Request;
};

/**
 * The browser can't call the backend directly — that would put the admin
 * key in JavaScript anyone could read. Route handlers call this instead:
 * it checks the session, adds the key, and forwards.
 */
export async function forward(path: string, options: ForwardOptions = {}) {
  if (!(await isSignedIn())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  let body: string | undefined;

  if (options.withBody) {
    try {
      body = JSON.stringify(await options.withBody.json());
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
  }

  let res: Response;
  let base = '';

  try {
    base = apiUrl();
    res = await fetch(`${base}${path}`, {
      method: options.method || 'GET',
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        'x-admin-key': backendKey(),
      },
      body,
      cache: 'no-store',
    });
  } catch (err) {
    console.error(
      `Could not reach the API at ${base || '(API_URL not set)'}${path}:`,
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: 'Could not reach the backend' },
      { status: 502 }
    );
  }

  // A proxy error page or an empty 204 shouldn't crash the handler
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export function badId() {
  return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
}
