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
    <div className="space-y-2.5">
      {/* Search */}
      <div className="flex gap-2">
        <div
          className="flex-1 flex items-center gap-2.5 rounded-xl px-3.5 h-11 border"
          style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4 shrink-0"
            style={{ color: 'var(--text-faint)' }}
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setParam('q', search.trim())}
            placeholder="Search name, phone, email…"
            className="flex-1 bg-transparent text-[14px] outline-none"
            style={{ color: 'var(--text)' }}
          />

          {search && (
            <button
              onClick={() => {
                setSearch('');
                setParam('q', undefined);
              }}
              style={{ color: 'var(--text-faint)' }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm5 13.6L15.6 17 12 13.4 8.4 17 7 15.6 10.6 12 7 8.4 8.4 7 12 10.6 15.6 7 17 8.4 13.4 12 17 15.6Z" />
              </svg>
            </button>
          )}
        </div>

        <button
          onClick={() => setParam('q', search.trim())}
          className="px-4 rounded-xl text-[13px] font-semibold border transition"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--line)',
            color: 'var(--text)',
          }}
        >
          Search
        </button>
      </div>

      {/* Status */}
      <div className="flex gap-2 overflow-x-auto no-bar pb-0.5">
        <Chip active={!current.status} onClick={() => setParam('status', undefined)}>
          All
        </Chip>

        {STATUSES.map((s) => (
          <Chip
            key={s}
            active={current.status === s}
            color={STATUS_META[s].color}
            onClick={() =>
              setParam('status', current.status === s ? undefined : s)
            }
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
      <div className="flex gap-2 overflow-x-auto no-bar pb-0.5 items-center">
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
            className="shrink-0 text-[12px] px-3 transition hover:opacity-70"
            style={{ color: 'var(--text-faint)' }}
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
      className="shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition"
      style={
        active
          ? {
              background: color || 'var(--brand)',
              borderColor: color || 'var(--brand)',
              color: '#fff',
            }
          : {
              background: 'var(--surface)',
              borderColor: 'var(--line)',
              color: 'var(--text-faint)',
            }
      }
    >
      {children}
    </button>
  );
}