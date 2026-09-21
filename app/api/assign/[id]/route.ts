import { badId, forward, segment } from '@/lib/backend';

type Params = { params: Promise<{ id: string }> };

/** Everything needed to place a request: vendors, and who has it */
export async function GET(_request: Request, { params }: Params) {
  const id = segment((await params).id);
  if (!id) return badId();

  return forward(`/admin/requests/${id}/assign`);
}

/** Offer this request to a vendor */
export async function POST(request: Request, { params }: Params) {
  const id = segment((await params).id);
  if (!id) return badId();

  return forward(`/admin/requests/${id}/assign`, {
    method: 'POST',
    withBody: request,
  });
}
