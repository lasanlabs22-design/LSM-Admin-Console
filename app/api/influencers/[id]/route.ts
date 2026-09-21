import { badId, forward, segment } from '@/lib/backend';

type Params = { params: Promise<{ id: string }> };

/** Approve, reject, pause, or correct a rate */
export async function PATCH(request: Request, { params }: Params) {
  const id = segment((await params).id);
  if (!id) return badId();

  return forward(`/admin/influencers/${id}`, {
    method: 'PATCH',
    withBody: request,
  });
}

/** Remove an application entirely */
export async function DELETE(_request: Request, { params }: Params) {
  const id = segment((await params).id);
  if (!id) return badId();

  return forward(`/admin/influencers/${id}`, { method: 'DELETE' });
}
