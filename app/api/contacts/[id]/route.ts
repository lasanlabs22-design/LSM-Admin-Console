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

/** What would be removed */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const key = await adminKey();

  if (key !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const res = await fetch(`${API_URL}/admin/contacts/${id}/summary`, {
    headers: { 'x-admin-key': key },
    cache: 'no-store',
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

/** Remove everything for one person */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const key = await adminKey();

  if (key !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const confirm = new URL(request.url).searchParams.get('confirm') || '';

  const res = await fetch(
    `${API_URL}/admin/contacts/${id}?confirm=${encodeURIComponent(confirm)}`,
    {
      method: 'DELETE',
      headers: { 'x-admin-key': key },
    }
  );

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
