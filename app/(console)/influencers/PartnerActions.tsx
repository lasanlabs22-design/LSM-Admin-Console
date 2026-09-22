'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminInfluencer } from './page';
import Dialog from '@/components/Dialog';

/**
 * Approve, pause or reject a Lasan Hub application.
 * Shared by the card view and the detail pop-up, so both can act.
 */
export default function PartnerActions({
  partner: p,
}: {
  partner: AdminInfluencer;
}) {
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const patch = async (body: Record<string, unknown>) => {
    setBusy(true);
    setError('');

    try {
      const res = await fetch(`/api/influencers/${p.id}`, {
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
      {error && (
        <p className="text-[12px] mt-2" style={{ color: 'var(--bad)' }}>
          {error}
        </p>
      )}

      <div className="flex gap-2 mt-4">
        {p.status !== 'approved' && (
          <button
            onClick={() => patch({ status: 'approved' })}
            disabled={busy}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition disabled:opacity-40"
            style={{ background: 'var(--good)' }}
          >
            {busy ? '…' : 'Approve'}
          </button>
        )}

        {p.status === 'approved' && (
          <button
            onClick={() => patch({ status: 'paused' })}
            disabled={busy}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold border transition disabled:opacity-40"
            style={{ borderColor: 'var(--line)', color: 'var(--text-muted)' }}
          >
            Pause
          </button>
        )}

        {p.status !== 'rejected' && (
          <button
            onClick={() => {
              setNote(p.review_note || '');
              setRejecting(true);
            }}
            disabled={busy}
            className="px-4 py-2.5 rounded-xl text-[13px] font-semibold border transition disabled:opacity-40"
            style={{ borderColor: 'var(--bad-line)', color: 'var(--bad)' }}
          >
            Reject
          </button>
        )}
      </div>

      {/* Reject dialog — needs a reason, so they can fix it and reapply */}
      {rejecting && (
        <Dialog
          label={`Reject ${p.name}`}
          onClose={() => !busy && setRejecting(false)}
        >
          <h3 className="t-title">Reject {p.name}?</h3>
          <p className="t-body mt-2">
            Add a short reason. They can fix it and reapply.
          </p>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            autoFocus
            placeholder={
              p.role === 'vendor'
                ? "e.g. GST number doesn't match the company name"
                : "e.g. Instagram handle doesn't match the name given"
            }
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
              style={{ background: 'var(--bad)' }}
            >
              {busy ? 'Saving…' : 'Reject'}
            </button>

            <button
              onClick={() => setRejecting(false)}
              disabled={busy}
              className="px-5 py-3 rounded-xl font-semibold text-[14px] border"
              style={{ borderColor: 'var(--line)', color: 'var(--text-faint)' }}
            >
              Cancel
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
