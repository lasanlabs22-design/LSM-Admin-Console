import { badId, forward, segment } from '@/lib/backend';

type Params = { params: Promise<{ id: string }> };

/** The reel is fine: clear its reports and put it back in the feed */
export async function POST(_request: Request, { params }: Params) {
  const id = segment((await params).id);
  if (!id) return badId();

  return forward(`/admin/reels/${id}/reports/dismiss`, { method: 'POST' });
}
