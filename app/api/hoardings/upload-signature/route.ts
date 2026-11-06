import { forward } from '@/lib/backend';

/**
 * Sign one hoarding photo upload. Cloudinary only takes signed uploads,
 * and the signing secret stays on the backend.
 */
export async function POST() {
  return forward('/admin/hoardings/upload-signature', { method: 'POST' });
}
