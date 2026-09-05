'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import type { AdminInfluencer } from './page';

const STATUS_META: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  pending: {
    label: 'Waiting',
    color: '#E8AE00',
    bg: 'rgba(232,174,0,0.12)',
  },
  approved: {
    label: 'Approved',
    color: '#12B3A0',
    bg: 'rgba(18,179,160,0.12)',
  },
  paused: { label: 'Paused', color: '#3A86FF', bg: 'rgba(58,134,255,0.12)' },
  rejected: {
    label: 'Rejected',
    color: '#8A8F98',
    bg: 'rgba(138,143,152,0.12)',
  },
};

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
}

export default function InfluencerCard({
  influencer: inf,
  index,
}: {
  influencer: AdminInfluencer;
  index: number;
}) {
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const status = STATUS_META[inf.status] || STATUS_META.pending;
  const isPending = inf.status === 'pending';

  const patch = async (body: Record<string, any>) => {
    setBusy(true);
    setError('');

    try {
      const res = await fetch(`/api/influencers/${inf.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Could not update');
        return;
      }

      setRejecting(false);
      router.refresh();
    } catch {
      setError('Could not reach the server');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div
        className="card p-4 rise relative"
        style={{
          animationDelay: `${0.04 * Math.min(index, 8)}s`,
          borderColor: isPending ? 'rgba(232,174,0,0.35)' : 'var(--line)',
        }}
      >
        <div className="flex items-start gap-3">
          {inf.photo_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={inf.photo_url}
              alt={inf.name}
              className="w-12 h-12 rounded-full object-cover shrink-0"
              style={{ background: 'var(--surface-hover)' }}
            />
          ) : (
            <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-[#7B3FC4] to-[#5F259F] flex items-center justify-center font-semibold text-white text-[15px]">
              {inf.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="t-title truncate">{inf.name}</div>
                {inf.instagram_id && (
                  <a
                    href={`https://instagram.com/${inf.instagram_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[12.5px] font-medium"
                    style={{ color: '#C13584' }}
                  >
                    @{inf.instagram_id} ↗
                  </a>
                )}
              </div>

              <span
                className="shrink-0 text-[10px] font-semibold uppercase px-2 py-1 rounded-md"
                style={{
                  color: status.color,
                  background: status.bg,
                  letterSpacing: '0.06em',
                }}
              >
                {status.label}
              </span>
            </div>

            <div
              className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[12px]"
              style={{ color: 'var(--text-faint)' }}
            >
             <a 
                href={`tel:+91${inf.phone}`}
                className="t-num font-semibold"
                style={{ color: 'var(--brand)' }}
              >
                {inf.phone}
              </a>
              {inf.category && <span>{inf.category}</span>}
              {inf.city && <span>{inf.city}</span>}
              {inf.followers && <span>{inf.followers} followers</span>}
            </div>
          </div>
        </div>

        {inf.bio && (
          <p
            className="text-[13px] mt-3 line-clamp-2"
            style={{ color: 'var(--text-muted)' }}
          >
            {inf.bio}
          </p>
        )}

        {/* Rate and applied-at */}
        <div
          className="flex items-center justify-between mt-3 pt-3 border-t"
          style={{ borderColor: 'var(--line)' }}
        >
          <div>
            <div className="t-label" style={{ fontSize: 9.5 }}>
              Rate per post
            </div>
            <div className="t-num text-[16px] font-semibold mt-0.5">
              {inf.rate_per_post
                ? '₹' + inf.rate_per_post.toLocaleString('en-IN')
                : '—'}
            </div>
          </div>

          <span className="t-meta" style={{ fontSize: 11.5 }}>
            Applied {timeAgo(inf.created_at)}
          </span>
        </div>

        {inf.review_note && (
          <div
            className="rounded-lg px-3 py-2 mt-3 text-[12px]"
            style={{ background: 'var(--surface-hover)' }}
          >
            <span className="t-label" style={{ fontSize: 9 }}>
              Note
            </span>
            <p className="mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {inf.review_note}
            </p>
          </div>
        )}

        {error && (
          <p className="text-[12px] mt-2" style={{ color: '#EF4444' }}>
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          {inf.status !== 'approved' && (
            <button
              onClick={() => patch({ status: 'approved' })}
              disabled={busy}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition disabled:opacity-40"
              style={{ background: '#12B3A0' }}
            >
              {busy ? '…' : 'Approve'}
            </button>
          )}

          {inf.status === 'approved' && (
            <button
              onClick={() => patch({ status: 'paused' })}
              disabled={busy}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold border transition disabled:opacity-40"
              style={{
                borderColor: 'var(--line)',
                color: 'var(--text-muted)',
              }}
            >
              Pause
            </button>
          )}

          {inf.status !== 'rejected' && (
            <button
              onClick={() => {
                setNote(inf.review_note || '');
                setRejecting(true);
              }}
              disabled={busy}
              className="px-4 py-2.5 rounded-xl text-[13px] font-semibold border transition disabled:opacity-40"
              style={{ borderColor: 'rgba(217,48,37,0.35)', color: '#EF4444' }}
            >
              Reject
            </button>
          )}
        </div>
      </div>

      {/* Reject dialog — needs a reason, so the creator can be told why */}
      {rejecting &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-5"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          >
            <div className="card w-full max-w-md p-6">
              <h3 className="t-title">Reject {inf.name}?</h3>
              <p className="t-body mt-2">
                Add a short reason. They can fix it and reapply.
              </p>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                autoFocus
                placeholder="e.g. Instagram handle doesn't match the name given"
                className="w-full rounded-xl px-4 py-3 mt-4 text-[14px] border outline-none resize-none"
                style={{
                  background: 'var(--surface-hover)',
                  borderColor: 'var(--line)',
                  color: 'var(--text)',
                }}
              />

              <div className="flex gap-2 mt-5">
                <button
                  onClick={() =>
                    patch({ status: 'rejected', reviewNote: note.trim() })
                  }
                  disabled={busy || note.trim().length < 3}
                  className="flex-1 py-3 rounded-xl font-semibold text-[14px] text-white transition disabled:opacity-30"
                  style={{ background: '#D93025' }}
                >
                  {busy ? 'Saving…' : 'Reject'}
                </button>

                <button
                  onClick={() => setRejecting(false)}
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