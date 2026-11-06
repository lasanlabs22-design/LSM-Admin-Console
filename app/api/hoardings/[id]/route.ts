import { badId, forward, segment } from '@/lib/backend';

type Params = { params: Promise<{ id: string }> };

/** Edit any field, mark it booked, or hide it */
export async function PATCH(request: Request, { params }: Params) {
  const id = segment((await params).id);
  if (!id) return badId();

  return forward(`/admin/hoardings/${id}`, {
    method: 'PATCH',
    withBody: request,
  });
}

/** Remove the listing */
export async function DELETE(_request: Request, { params }: Params) {
  const id = segment((await params).id);
  if (!id) return badId();

  return forward(`/admin/hoardings/${id}`, { method: 'DELETE' });
}
