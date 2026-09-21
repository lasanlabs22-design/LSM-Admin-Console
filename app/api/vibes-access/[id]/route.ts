import { badId, forward, segment } from '@/lib/backend';

/** Grant or refuse posting access */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = segment((await params).id);
  if (!id) return badId();

  return forward(`/admin/vibes-access/${id}`, { method: 'PATCH', withBody: request });
}
