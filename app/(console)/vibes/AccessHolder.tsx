'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AccessHolder({ person }: { person: any }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const revoke = async () => {
    setBusy(true);

    try {
      await fetch(`/api/vibes-access/${person.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grant: false }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="flex items-center gap-3 px-4 py-3"
      style={{ borderBottom: '1px solid var(--line)' }}
    >
      {person.photo_url ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={person.photo_url}
          alt={person.name}
          className="w-9 h-9 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-[var(--brand)] to-[var(--brand)] flex items-center justify-center font-semibold text-white text-[12px]">
          {person.name.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-semibold truncate">
          {person.company_name || person.name}
        </div>
        <div className="t-meta" style={{ fontSize: 11.5 }}>
          {person.reels_posted} reel{person.reels_posted === 1 ? '' : 's'}{' '}
          posted
        </div>
      </div>

      <a
        href={`tel:+91${person.phone}`}
        className="t-num text-[12.5px] font-semibold shrink-0"
        style={{ color: 'var(--brand)' }}
      >
        {person.phone}
      </a>

      <button
        onClick={revoke}
        disabled={busy}
        className="text-[12px] font-semibold shrink-0 transition hover:opacity-70 disabled:opacity-40"
        style={{ color: 'var(--bad)' }}
      >
        {busy ? '…' : 'Revoke'}
      </button>
    </div>
  );
}
