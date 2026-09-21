import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * Admin sessions.
 *
 * The cookie used to hold the admin password itself, so anyone who saw the
 * cookie had the password — for good. Now it holds a signed, expiring token.
 * The password never leaves the server after login.
 *
 * Tokens are signed with a key derived from ADMIN_PASSWORD (plus
 * SESSION_SECRET when set), so changing the password signs everyone out.
 */

export const SESSION_COOKIE = 'lsm_session';

/** The old cookie that stored the raw password. Cleared wherever we can. */
export const LEGACY_COOKIE = 'lsm_admin';

export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // one week, in seconds

function signingKey(): string | null {
  const password = process.env.ADMIN_PASSWORD;

  // No password configured means nobody gets in — never the reverse
  if (!password) return null;

  return `${process.env.SESSION_SECRET || ''}|${password}`;
}

function sign(payload: string, key: string) {
  return createHmac('sha256', key).update(payload).digest('base64url');
}

/** Compares two strings without leaking how much of them matched */
function safeEqual(a: string, b: string) {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(input: unknown): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || typeof input !== 'string' || !input) return false;
  return safeEqual(input, password);
}

export function createSessionToken(): string {
  const key = signingKey();
  if (!key) throw new Error('ADMIN_PASSWORD is not configured');

  const expires = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const payload = `${expires}.${randomBytes(12).toString('base64url')}`;

  return `${payload}.${sign(payload, key)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  const key = signingKey();
  if (!key || !token) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [expires, nonce, signature] = parts;
  if (!safeEqual(signature, sign(`${expires}.${nonce}`, key))) return false;

  return Number(expires) > Date.now() / 1000;
}

/** What the backend expects in x-admin-key. Server-side only. */
export function backendKey(): string {
  return process.env.ADMIN_API_KEY || process.env.ADMIN_PASSWORD || '';
}
