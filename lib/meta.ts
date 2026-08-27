export const STATUS_META: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  new: { label: 'New', color: '#3A86FF', bg: 'rgba(58,134,255,0.12)' },
  contacted: { label: 'Contacted', color: '#E8AE00', bg: 'rgba(232,174,0,0.12)' },
  in_progress: { label: 'In Progress', color: '#12B3A0', bg: 'rgba(18,179,160,0.12)' },
  closed: { label: 'Closed', color: '#8A8F98', bg: 'rgba(138,143,152,0.12)' },
};

export const TYPE_META: Record<
  string,
  { label: string; color: string; emoji: string }
> = {
  service: { label: 'Service', color: '#FF6B35', emoji: '📣' },
  custom: { label: 'Custom', color: '#7B2FF7', emoji: '🛠️' },
  plan: { label: 'Plan', color: '#12B3A0', emoji: '💼' },
  influencer: { label: 'Influencer', color: '#C13584', emoji: '⭐' },
};

export const STATUSES = ['new', 'contacted', 'in_progress', 'closed'];

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