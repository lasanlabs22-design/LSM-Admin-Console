import type { AdminInfluencer } from './page';

/* How the Lasan Hub list can be ordered. Used by the page (to sort) and
   the filter bar (to offer the choices). */

export const SORTS = {
  review: 'Needs review first',
  newest: 'Newest first',
  oldest: 'Oldest first',
  name: 'Name A–Z',
} as const;

export type SortKey = keyof typeof SORTS;

const newest = (a: AdminInfluencer, b: AdminInfluencer) =>
  b.created_at.localeCompare(a.created_at);

/**
 * The backend sends every partner at once, so ordering and paging happen
 * here. "Needs review first" keeps waiting applications on top, however
 * many approved partners pile up below them.
 */
export function sortPartners(list: AdminInfluencer[], sort: SortKey) {
  const out = [...list];

  if (sort === 'newest') return out.sort(newest);
  if (sort === 'oldest') return out.sort((a, b) => -newest(a, b));
  if (sort === 'name') {
    return out.sort((a, b) =>
      a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
    );
  }

  return out.sort(
    (a, b) =>
      Number(b.status === 'pending') - Number(a.status === 'pending') ||
      newest(a, b)
  );
}
