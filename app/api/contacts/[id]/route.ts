import { badId, forward, segment } from '@/lib/backend';

type Params = { params: Promise<{ id: string }> };

/** What would be removed */
export async function GET(_request: Request, { params }: Params) {
  const id = segment((await params).id);
  if (!id) return badId();

  return forward(`/admin/contacts/${id}/summary`);
}

/** Remove everything for one person */
export async function DELETE(request: Request, { params }: Params) {
  const id = segment((await params).id);
  if (!id) return badId();

  const confirm = new URL(request.url).searchParams.get('confirm') || '';

  return forward(
    `/admin/contacts/${id}?confirm=${encodeURIComponent(confirm)}`,
    { method: 'DELETE' }
  );
}
