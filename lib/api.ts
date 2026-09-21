import { apiUrl, isSignedIn } from './backend';
import { backendKey } from './session';
import { errorMessage } from './meta';

export type { Stats, AdminRequest, AdminContact } from './types';

/**
 * Calls the Lasan Mart backend with the admin key attached.
 * Runs on the server only — the key never reaches the browser.
 *
 * T is what the caller expects back. It isn't checked at runtime, so
 * callers should still treat missing fields as possible.
 */
export async function adminFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  // The proxy already guards pages; this keeps the key safe if it's ever
  // bypassed or misconfigured
  if (!(await isSignedIn())) throw new Error('Not signed in');

  const base = apiUrl();
  let res: Response;

  try {
    res = await fetch(`${base}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': backendKey(),
        ...(options.headers || {}),
      },
      // Always fetch fresh — a dashboard showing stale leads is useless
      cache: 'no-store',
    });
  } catch (err) {
    // The address goes to the server logs, where it helps; the screen
    // only needs to know the backend didn't answer
    console.error(
      `Could not reach the API at ${base}${path}:`,
      errorMessage(err)
    );
    throw new Error('Could not reach the backend. It may be restarting.');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }

  return res.json() as Promise<T>;
}
