import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000';

export async function GET(request: Request) {
  const store = await cookies();
  const key = store.get('lsm_admin')?.value || '';

  if (key !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const status = new URL(request.url).searchParams.get('status') || '';

  const res = await fetch(
    `${API_URL}/admin/work${status ? `?status=${status}` : ''}`,
    { headers: { 'x-admin-key': key }, cache: 'no-store' }
  );

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
