import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000';

/**
 * Marks a partner's message contacted or resolved.
 *
 * The browser can't call Railway directly — that would put the admin
 * password in JavaScript anyone could read. This runs on the server,
 * adds the key, and forwards.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const store = await cookies();
  const key = store.get('lsm_admin')?.value || '';

  if (key !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const body = await request.json();

  const res = await fetch(`${API_URL}/admin/influencer-requests/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
