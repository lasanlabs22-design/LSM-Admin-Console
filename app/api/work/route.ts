import { forward } from '@/lib/backend';

export async function GET(request: Request) {
  const status = new URL(request.url).searchParams.get('status') || '';
  const query = status ? `?status=${encodeURIComponent(status)}` : '';

  return forward(`/admin/work${query}`);
}
