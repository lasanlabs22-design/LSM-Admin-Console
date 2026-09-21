import { badId, forward, segment } from '@/lib/backend';

/** Update status, assignee or internal note */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = segment((await params).id);
  if (!id) return badId();

  return forward(`/admin/requests/${id}`, { method: 'PATCH', withBody: request });
}
