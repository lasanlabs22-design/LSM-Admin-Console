export const STATUS_META: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  new: { label: 'New', color: 'var(--info)', bg: 'var(--info-soft)' },
  contacted: {
    label: 'Contacted',
    color: 'var(--warn)',
    bg: 'var(--warn-soft)',
  },
  in_progress: {
    label: 'In Progress',
    color: 'var(--good)',
    bg: 'var(--good-soft)',
  },
  closed: { label: 'Closed', color: 'var(--neutral)', bg: 'var(--neutral-soft)' },
};

export const TYPE_META: Record<
  string,
  { label: string; color: string; emoji: string }
> = {
  service: { label: 'Service', color: 'var(--brand)', emoji: '📣' },
  custom: { label: 'Custom', color: 'var(--accent)', emoji: '🛠️' },
  plan: { label: 'Plan', color: 'var(--good)', emoji: '💼' },
  influencer: { label: 'Influencer', color: 'var(--role-creator)', emoji: '⭐' },
};

export const STATUSES = ['new', 'contacted', 'in_progress', 'closed'];

/**
 * Partners type their own portfolio links at sign-up, so they can't be
 * trusted as-is. Only plain web links get through; anything else
 * (javascript:, data:, …) is dropped.
 */
export function safeExternalUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;

  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;

  try {
    const url = new URL(withScheme);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.href
      : null;
  } catch {
    return null;
  }
}

/**
 * A see-through version of any colour — hex or var(--token).
 * Appending hex alpha ("#7c4dff33") silently breaks on CSS variables.
 */
export function tint(color: string, percent: number): string {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

/** Handles arrive with or without the @, and must stay on instagram.com */
export function instagramUrl(handle: string): string {
  return `https://instagram.com/${encodeURIComponent(handle.replace(/^@/, ''))}`;
}

/**
 * Which page numbers to show: the ends, and a couple either side of the
 * current page. 40 pages as 40 buttons won't fit on a phone.
 */
export function pageWindow(current: number, total: number): (number | null)[] {
  const pages: (number | null)[] = [];

  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - current) <= 1) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== null) {
      pages.push(null); // a gap, drawn as "…"
    }
  }

  return pages;
}

/** "3 hours ago", "2 days ago" — easier to scan than a timestamp */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
