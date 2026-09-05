'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const STATUSES = [
  { key: 'pending', label: 'Waiting', color: '#E8AE00' },
  { key: 'approved', label: 'Approved', color: '#12B3A0' },
  { key: 'paused', label: 'Paused', color: '#3A86FF' },
  { key: 'rejected', label: 'Rejected', color: '#8A8F98' },
];

export default function StatusFilter({
  current,
}: {
  current: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(current.q || '');

  const setParam = (key: string, value?: string) => {
    const params = new URLSearchParams();

    Object.entries(current).forEach(([k, v]) => {
      if (v && k !== key) params.set(k, v);
    });

    if (value) params.set(key, value);

    router.push(`/influencers?${params.toString()}`);
  };

  return (
    <div className="space-y-2.5">
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
            placeholder="Search name, phone or handle…"
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
      </div>

      <div className="flex gap-2 overflow-x-auto no-bar pb-0.5">
        <Chip
          active={!current.status}
          onClick={() => setParam('status', undefined)}
        >
          All
        </Chip>

        {STATUSES.map((s) => (
          <Chip
            key={s.key}
            active={current.status === s.key}
            color={s.color}
            onClick={() =>
              setParam('status', current.status === s.key ? undefined : s.key)
            }
          >
            {s.label}
          </Chip>
        ))}
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
