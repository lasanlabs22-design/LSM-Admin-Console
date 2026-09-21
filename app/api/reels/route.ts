import { forward } from '@/lib/backend';

/** Create a reel */
export async function POST(request: Request) {
  return forward('/admin/reels', { method: 'POST', withBody: request });
}
