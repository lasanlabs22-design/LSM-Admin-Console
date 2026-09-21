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
  closed: {
    label: 'Closed',
    color: 'var(--neutral)',
    bg: 'var(--neutral-soft)',
  },
};

export const TYPE_META: Record<
  string,
  { label: string; color: string; emoji: string }
> = {
  service: { label: 'Service', color: 'var(--brand)', emoji: '📣' },
  custom: { label: 'Custom', color: 'var(--accent)', emoji: '🛠️' },
  plan: { label: 'Plan', color: 'var(--good)', emoji: '💼' },
  influencer: {
    label: 'Influencer',
    color: 'var(--role-creator)',
    emoji: '⭐',
  },
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

/**
 * "3h ago", "2d ago" — easier to scan than a timestamp.
 * `short` drops the " ago" for tight spots like reel cards.
 */
export function timeAgo(iso: string, { short = false } = {}): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const ago = short ? '' : ' ago';

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m${ago}`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h${ago}`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d${ago}`;

  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** A readable message from anything a catch block can receive */
export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong';
}

/** How a job sent to a partner is doing, in words the team can act on */
export const WORK_STATUS: Record<
  string,
  { label: string; colour: string; note: string }
> = {
  offered: {
    label: 'Waiting on them',
    colour: 'var(--warn)',
    note: "Sent — they haven't answered yet",
  },
  accepted: {
    label: 'Accepted',
    colour: 'var(--good)',
    note: "They've taken it on but haven't started",
  },
  in_progress: {
    label: 'In progress',
    colour: 'var(--brand)',
    note: 'Work is underway',
  },
  completed: {
    label: 'Completed',
    colour: 'var(--good)',
    note: 'They say the work is done',
  },
  declined: {
    label: 'Declined',
    colour: 'var(--bad)',
    note: 'They passed — pick someone else',
  },
  withdrawn: {
    label: 'Withdrawn',
    colour: 'var(--neutral)',
    note: 'We pulled this back',
  },
};

/** Where a Lasan Hub application stands. `long` is for the detail view. */
export const PARTNER_STATUS: Record<
  string,
  { label: string; long: string; color: string; bg: string }
> = {
  pending: {
    label: 'Waiting',
    long: 'Waiting for review',
    color: 'var(--warn)',
    bg: 'var(--warn-soft)',
  },
  approved: {
    label: 'Approved',
    long: 'Approved',
    color: 'var(--good)',
    bg: 'var(--good-soft)',
  },
  paused: {
    label: 'Paused',
    long: 'Paused',
    color: 'var(--info)',
    bg: 'var(--info-soft)',
  },
  rejected: {
    label: 'Rejected',
    long: 'Rejected',
    color: 'var(--neutral)',
    bg: 'var(--neutral-soft)',
  },
};

export const ROLE_META: Record<string, { label: string; color: string }> = {
  influencer: { label: 'Creator', color: 'var(--role-creator)' },
  vendor: { label: 'Vendor', color: 'var(--role-vendor)' },
  freelancer: { label: 'Freelancer', color: 'var(--role-freelancer)' },
};

export function roleMeta(role: string | null | undefined) {
  return ROLE_META[role || 'influencer'] || ROLE_META.influencer;
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
