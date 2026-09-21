import { badId, forward, segment } from '@/lib/backend';

/** Marks a partner's message contacted or resolved */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = segment((await params).id);
  if (!id) return badId();

  return forward(`/admin/influencer-requests/${id}`, { method: 'PATCH', withBody: request });
}
