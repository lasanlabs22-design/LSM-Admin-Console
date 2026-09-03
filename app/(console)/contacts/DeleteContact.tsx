'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';

type Summary = {
  contact: {
    name: string;
    phone: string;
    email: string | null;
  };
  counts: {
    requests: number;
    notifications: number;
    reels: number;
  };
};

export default function DeleteContact({
  contactId,
  name,
  phone,
}: {
  contactId: string;
  name: string;
  phone: string;
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const openDialog = async () => {
    setOpen(true);
    setTyped('');
    setError('');
    setSummary(null);

    try {
      const res = await fetch(`/api/contacts/${contactId}`);

      if (res.ok) {
        setSummary(await res.json());
      }
    } catch {
      setError('Could not load what would be deleted.');
    }
  };

  const confirmDelete = async () => {
    if (typed.replace(/\D/g, '') !== phone) return;

    setBusy(true);
    setError('');

    try {
      const res = await fetch(
        `/api/contacts/${contactId}?confirm=${encodeURIComponent(typed)}`,
        {
          method: 'DELETE',
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Could not delete.');
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      setError('Could not reach the server.');
    } finally {
      setBusy(false);
    }
  };

  const matches = typed.replace(/\D/g, '') === phone;

  return (
    <>
      <button
        onClick={openDialog}
        className="text-[12px] font-semibold transition hover:opacity-70"
        style={{ color: '#EF4444' }}
      >
        Delete all data
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-5"
            style={{
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <div className="card w-full max-w-md p-6">
              <h3 className="t-title" style={{ color: '#EF4444' }}>
                Delete everything for {name}?
              </h3>

              <p className="t-body mt-2">
                This cannot be undone. It removes their contact record, request
                history, notifications and any videos they posted — including
                the video files themselves.
              </p>

              {summary ? (
                <div
                  className="rounded-xl p-4 mt-4 space-y-1.5"
                  style={{
                    background: 'var(--surface-hover)',
                  }}
                >
                  {[
                    ['Requests', summary.counts.requests],
                    ['Notifications', summary.counts.notifications],
                    ['Videos', summary.counts.reels],
                  ].map(([label, n]) => (
                    <div
                      key={label as string}
                      className="flex justify-between text-[13px]"
                    >
                      <span
                        style={{
                          color: 'var(--text-faint)',
                        }}
                      >
                        {label}
                      </span>

                      <span className="t-num font-semibold">{n as number}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="skeleton h-20 mt-4" />
              )}

              <label className="block t-label mt-5 mb-2">
                Type {phone} to confirm
              </label>

              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={phone}
                autoFocus
                className="w-full rounded-xl px-4 h-11 text-[14px] border outline-none"
                style={{
                  background: 'var(--surface-hover)',
                  borderColor: matches ? '#EF4444' : 'var(--line)',
                  color: 'var(--text)',
                }}
              />

              {error && (
                <p
                  className="text-[13px] mt-3"
                  style={{
                    color: '#EF4444',
                  }}
                >
                  {error}
                </p>
              )}

              <div className="flex gap-2 mt-6">
                <button
                  onClick={confirmDelete}
                  disabled={!matches || busy}
                  className="flex-1 py-3 rounded-xl font-semibold text-[14px] text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: '#D93025',
                  }}
                >
                  {busy ? 'Deleting…' : 'Delete permanently'}
                </button>

                <button
                  onClick={() => setOpen(false)}
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
