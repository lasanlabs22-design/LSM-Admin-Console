'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { STATUSES, STATUS_META, TYPE_META } from '@/lib/meta';

export default function Filters({
  current,
}: {
  current: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(current.q || '');

  const setParam = (key: string, value?: string) => {
    const params = new URLSearchParams();

    // Keep the other filters, drop paging
    Object.entries(current).forEach(([k, v]) => {
      if (v && k !== 'page' && k !== key) params.set(k, v);
    });

    if (value) params.set(key, value);

    router.push(`/requests?${params.toString()}`);
  };

  const hasFilters = !!(
    current.status ||
    current.type ||
    current.assignedTo ||
    current.q
  );

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setParam('q', search.trim())}
          placeholder="Search name, phone, email…"
          className="flex-1 bg-white/[0.05] border border-white/12 rounded-xl px-4 py-2.5 text-sm placeholder-white/30 outline-none focus:border-[#FF6B35] transition"
        />
        <button
          onClick={() => setParam('q', search.trim())}
          className="px-4 rounded-xl bg-white/[0.08] text-sm font-semibold hover:bg-white/[0.12] transition"
        >
          Search
        </button>
      </div>

      {/* Status */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Chip
          active={!current.status}
          onClick={() => setParam('status', undefined)}
        >
          All
        </Chip>

        {STATUSES.map((s) => (
          <Chip
            key={s}
            active={current.status === s}
            color={STATUS_META[s].color}
            onClick={() => setParam('status', s)}
          >
            {STATUS_META[s].label}
          </Chip>
        ))}

        <Chip
          active={current.assignedTo === 'unassigned'}
          onClick={() =>
            setParam(
              'assignedTo',
              current.assignedTo === 'unassigned' ? undefined : 'unassigned'
            )
          }
        >
          Unassigned
        </Chip>
      </div>

      {/* Type */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {Object.entries(TYPE_META).map(([key, meta]) => (
          <Chip
            key={key}
            active={current.type === key}
            color={meta.color}
            onClick={() =>
              setParam('type', current.type === key ? undefined : key)
            }
          >
            {meta.emoji} {meta.label}
          </Chip>
        ))}

        {hasFilters && (
          <button
            onClick={() => router.push('/requests')}
            className="shrink-0 text-xs text-white/40 hover:text-white/70 px-3 transition"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}

function Chip({
  children,
  active,
  color,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  color?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
        active
          ? 'text-white'
          : 'text-white/50 border-white/12 hover:text-white/80'
      }`}
      style={
        active
          ? {
              background: color || '#FF6B35',
              borderColor: color || '#FF6B35',
            }
          : undefined
      }
    >
      {children}
    </button>
  );
}