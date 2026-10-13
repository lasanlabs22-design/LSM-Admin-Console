import { forward } from '@/lib/backend';

/**
 * Sign one reel upload. Cloudinary only takes signed uploads now, and
 * the signing secret stays on the backend.
 */
export async function POST() {
  return forward('/admin/uploads/signature', { method: 'POST' });
}
