import { badId, forward, segment } from '@/lib/backend';

/** Withdraw an offer, or record what a vendor said by phone */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = segment((await params).id);
  if (!id) return badId();

  return forward(`/admin/assignments/${id}`, { method: 'PATCH', withBody: request });
}
