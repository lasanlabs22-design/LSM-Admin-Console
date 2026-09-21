'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TYPE_LABEL: Record<string, string> = {
  payment: 'Payment',
  profile: 'Profile',
  availability: 'Availability',
  complaint: 'Complaint',
  general: 'General',
};

const ROLE_COLOR: Record<string, string> = {
  influencer: 'var(--role-creator)',
  vendor: 'var(--role-vendor)',
  freelancer: 'var(--info)',
};

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export type HubRequestItem = {
  id: string;
  type: string;
  subject: string | null;
  message: string;
  status: string;
  internal_note: string | null;
  created_at: string;
  influencer_id: string;
  name: string;
  phone: string;
  instagram_id: string | null;
  photo_url: string | null;
  role?: string;
};

export default function HubRequest({
  request: r,
  done,
}: {
  request: HubRequestItem;
  done?: boolean;
}) {
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const accent = ROLE_COLOR[r.role || 'influencer'] || 'var(--role-creator)';

  const patch = async (status: string) => {
    setBusy(true);
    setError('');

    try {
      const res = await fetch(`/api/hub-requests/${r.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Could not update');
        return;
      }

      router.refresh();
    } catch {
      setError('Could not reach the server');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="card p-4"
      style={{ borderColor: done ? 'var(--line)' : 'var(--warn-line)' }}
    >
      <div className="flex items-start gap-3">
        {r.photo_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={r.photo_url}
            alt={r.name}
            className="w-10 h-10 rounded-full object-cover shrink-0"
            style={{ background: 'var(--surface-hover)' }}
          />
        ) : (
          <div
            className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-semibold text-white text-[13px]"
            style={{ background: accent }}
          >
            {r.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="t-title text-[14.5px]">{r.name}</span>
                <span
                  className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded"
                  style={{
                    background: 'var(--surface-hover)',
                    color: 'var(--text-faint)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {TYPE_LABEL[r.type] || r.type}
                </span>
              </div>

              <a
                href={`tel:+91${r.phone}`}
                className="t-num text-[12.5px] font-semibold"
                style={{ color: 'var(--brand)' }}
              >
                {r.phone}
              </a>
            </div>

            <span className="t-meta shrink-0" style={{ fontSize: 11.5 }}>
              {timeAgo(r.created_at)}
            </span>
          </div>
        </div>
      </div>

      <p
        className="text-[13.5px] leading-relaxed mt-3"
        style={{ color: 'var(--text-muted)' }}
      >
        {r.message}
      </p>

      {error && (
        <p className="text-[12px] mt-2" style={{ color: 'var(--bad)' }}>
          {error}
        </p>
      )}

      {!done ? (
        <div className="flex gap-2 mt-3.5">
          <a
            href={`tel:+91${r.phone}`}
            className="flex-1 py-2 rounded-lg text-[12.5px] font-semibold border transition text-center"
            style={{ borderColor: 'var(--line)', color: 'var(--text-muted)' }}
          >
            Call them
          </a>

          <button
            onClick={() => patch('closed')}
            disabled={busy}
            className="flex-1 py-2 rounded-lg text-[12.5px] font-semibold text-white transition disabled:opacity-40"
            style={{ background: 'var(--good)' }}
          >
            {busy ? '…' : 'Mark resolved'}
          </button>
        </div>
      ) : (
        <button
          onClick={() => patch('new')}
          disabled={busy}
          className="w-full py-2 rounded-lg text-[12.5px] font-semibold border transition mt-3.5 disabled:opacity-40"
          style={{ borderColor: 'var(--line)', color: 'var(--text-faint)' }}
        >
          {busy ? '…' : 'Reopen'}
        </button>
      )}
    </div>
  );
}
