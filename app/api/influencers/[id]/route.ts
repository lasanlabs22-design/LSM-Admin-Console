import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000';

async function adminKey() {
  const store = await cookies();
  return store.get('lsm_admin')?.value || '';
}

/** Approve, reject, pause, or correct a rate */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const key = await adminKey();

  if (key !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const body = await request.json();

  const res = await fetch(`${API_URL}/admin/influencers/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

/** Remove an application entirely */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const key = await adminKey();

  if (key !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const res = await fetch(`${API_URL}/admin/influencers/${id}`, {
    method: 'DELETE',
    headers: { 'x-admin-key': key },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
