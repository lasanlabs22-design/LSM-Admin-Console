import { badId, forward, segment } from '@/lib/backend';

type Params = { params: Promise<{ id: string }> };

/** Edit caption, status or pinning */
export async function PATCH(request: Request, { params }: Params) {
  const id = segment((await params).id);
  if (!id) return badId();

  return forward(`/admin/reels/${id}`, { method: 'PATCH', withBody: request });
}

/** Remove the reel and its Cloudinary file */
export async function DELETE(_request: Request, { params }: Params) {
  const id = segment((await params).id);
  if (!id) return badId();

  return forward(`/admin/reels/${id}`, { method: 'DELETE' });
}
