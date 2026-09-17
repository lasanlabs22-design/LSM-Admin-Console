'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function AccessRequest({ person }: { person: any }) {
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState<'grant' | 'refuse' | null>(null);
  const [error, setError] = useState('');

  const decide = async (grant: boolean) => {
    setBusy(true);
    setError('');

    try {
      const res = await fetch(`/api/vibes-access/${person.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grant }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Could not update');
        return;
      }

      setConfirming(null);
      router.refresh();
    } catch {
      setError('Could not reach the server');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="card p-4" style={{ borderColor: 'rgba(232,174,0,0.3)' }}>
        <div className="flex items-start gap-3">
          {person.photo_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={person.photo_url}
              alt={person.name}
              className="w-10 h-10 rounded-full object-cover shrink-0"
              style={{ background: 'var(--surface-hover)' }}
            />
          ) : (
            <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-[#FF8A3D] to-[#F2542D] flex items-center justify-center font-semibold text-white text-[13px]">
              {person.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="t-title text-[14.5px]">{person.name}</div>

                <div
                  className="flex flex-wrap gap-x-3 text-[12.5px] mt-0.5"
                  style={{ color: 'var(--text-faint)' }}
                >
                  {person.company_name && <span>{person.company_name}</span>}
                  {person.city && <span>{person.city}</span>}
                  <a
                    href={`tel:+91${person.phone}`}
                    className="t-num font-semibold"
                    style={{ color: 'var(--brand)' }}
                  >
                    {person.phone}
                  </a>
                </div>
              </div>

              <span className="t-meta shrink-0" style={{ fontSize: 11.5 }}>
                {timeAgo(person.vibes_requested_at)}
              </span>
            </div>
          </div>
        </div>

        {/* What they said they'd post — the thing to judge on */}
        {person.vibes_reason && (
          <div
            className="rounded-xl p-3.5 mt-3"
            style={{ background: 'var(--surface-hover)' }}
          >
            <span className="t-label" style={{ fontSize: 9.5 }}>
              What they want to post
            </span>
            <p
              className="text-[13.5px] leading-relaxed mt-1.5"
              style={{ color: 'var(--text-muted)' }}
            >
              {person.vibes_reason}
            </p>
          </div>
        )}

        {error && (
          <p className="text-[12px] mt-2" style={{ color: '#EF4444' }}>
            {error}
          </p>
        )}

        <div className="flex gap-2 mt-3.5">
          <button
            onClick={() => setConfirming('refuse')}
            disabled={busy}
            className="flex-1 py-2 rounded-lg text-[12.5px] font-semibold border transition disabled:opacity-40"
            style={{ borderColor: 'var(--line)', color: 'var(--text-muted)' }}
          >
            Not now
          </button>

          <button
            onClick={() => setConfirming('grant')}
            disabled={busy}
            className="flex-1 py-2 rounded-lg text-[12.5px] font-semibold text-white transition disabled:opacity-40"
            style={{ background: '#12B3A0' }}
          >
            Give access
          </button>
        </div>
      </div>

      {/* Asking twice, because this lets someone post to every user */}
      {confirming &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-5"
            style={{
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <div className="card w-full max-w-md p-6">
              <h3 className="t-title">
                {confirming === 'grant'
                  ? `Let ${person.name} post?`
                  : `Refuse ${person.name}?`}
              </h3>

              <p className="t-body mt-2.5">
                {confirming === 'grant'
                  ? 'Their videos will appear in the feed for everyone using Lasan Mart, straight away and without further checks. You can take this back later.'
                  : "They'll be told we're not opening posting for now. They can message the team about it."}
              </p>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => decide(confirming === 'grant')}
                  disabled={busy}
                  className="flex-1 py-3 rounded-xl font-semibold text-[14px] text-white transition disabled:opacity-30"
                  style={{
                    background: confirming === 'grant' ? '#12B3A0' : '#D93025',
                  }}
                >
                  {busy
                    ? 'Saving…'
                    : confirming === 'grant'
                      ? 'Yes, give access'
                      : 'Yes, refuse'}
                </button>

                <button
                  onClick={() => setConfirming(null)}
                  disabled={busy}
                  className="px-5 py-3 rounded-xl font-semibold text-[14px] border"
                  style={{
                    borderColor: 'var(--line)',
                    color: 'var(--text-faint)',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
