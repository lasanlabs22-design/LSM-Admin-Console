import { forward } from '@/lib/backend';

/** Add a hoarding */
export async function POST(request: Request) {
  return forward('/admin/hoardings', { method: 'POST', withBody: request });
}
