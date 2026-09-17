'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';

const STATUS: Record<string, { label: string; color: string }> = {
  offered: { label: 'Waiting on them', color: '#E8AE00' },
  accepted: { label: 'Accepted', color: '#12B3A0' },
  in_progress: { label: 'In progress', color: '#5F259F' },
  completed: { label: 'Completed', color: '#12B3A0' },
  declined: { label: 'Declined', color: '#EF4444' },
  withdrawn: { label: 'Withdrawn', color: '#8A8F98' },
};

export default function AssignPanel({
  requestId,
  onClose,
}: {
  requestId: string;
  onClose: () => void;
}) {
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [brief, setBrief] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/assign/${requestId}`);
      if (res.ok) setData(await res.json());
      else setError('Could not load vendors');
    } catch {
      setError('Could not reach the server');
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const assign = async () => {
    if (!pickedId || busy) return;

    setBusy(true);
    setError('');

    try {
      const res = await fetch(`/api/assign/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId: pickedId, brief: brief.trim() }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Could not assign');
        return;
      }

      setPickedId(null);
      setBrief('');
      await load();
      router.refresh();
    } catch {
      setError('Could not reach the server');
    } finally {
      setBusy(false);
    }
  };

  const withdraw = async (assignmentId: string) => {
    setBusy(true);

    try {
      await fetch(`/api/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'withdrawn' }),
      });
      await load();
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  /* The customer picked these people by name. Show them at the top,
     because assigning anyone else would be ignoring what was asked for. */
  const picked: string[] = data?.pickedNames || [];

  const chosen = (data?.vendors || []).filter((v: any) =>
    picked.some((n) => n.toLowerCase() === (v.name || '').toLowerCase())
  );

  const others = (data?.vendors || []).filter(
    (v: any) => !chosen.includes(v)
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="card w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="p-6 pb-4 sticky top-0 z-10"
          style={{ background: 'var(--surface)' }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="t-title">Assign this work</h2>
              {data?.request && (
                <p className="t-body mt-1">
                  {data.request.title || data.service || 'Request'}
                  {data.request.customer_city &&
                    ` · ${data.request.customer_city}`}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition hover:opacity-70"
              style={{ background: 'var(--surface-hover)' }}
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4Z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 space-y-6">
          {error && (
            <p className="text-[13px]" style={{ color: '#EF4444' }}>
              {error}
            </p>
          )}

          {loading && <div className="skeleton h-24" />}

          {/* Who already has it */}
          {data?.assignments?.length > 0 && (
            <div>
              <h3 className="t-label mb-3">Already sent to</h3>

              <div className="space-y-2">
                {data.assignments.map((a: any) => {
                  const s = STATUS[a.status] || STATUS.offered;

                  return (
                    <div
                      key={a.id}
                      className="rounded-xl p-3.5"
                      style={{ background: 'var(--surface-hover)' }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="t-title text-[14px]">
                            {a.company_name || a.name}
                          </div>
                          <a
                            href={`tel:+91${a.phone}`}
                            className="t-num text-[12.5px] font-semibold"
                            style={{ color: 'var(--brand)' }}
                          >
                            {a.phone}
                          </a>
                        </div>

                        <span
                          className="text-[11px] font-semibold shrink-0"
                          style={{ color: s.color }}
                        >
                          {s.label}
                        </span>
                      </div>

                      {a.decline_reason && (
                        <p
                          className="text-[12.5px] mt-2"
                          style={{ color: 'var(--text-faint)' }}
                        >
                          Declined: {a.decline_reason}
                        </p>
                      )}

                      {['offered', 'accepted'].includes(a.status) && (
                        <button
                          onClick={() => withdraw(a.id)}
                          disabled={busy}
                          className="text-[12px] font-semibold mt-2.5 transition hover:opacity-70"
                          style={{ color: '#EF4444' }}
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* The creators this customer actually asked for */}
          {chosen.length > 0 && (
            <div>
              <h3 className="t-label mb-1">Who they asked for</h3>
              <p className="t-meta mb-3" style={{ fontSize: 12 }}>
                Picked by the client in the app
              </p>

              <div className="space-y-2">
                {chosen.map((v: any) => (
                  <PartnerRow
                    key={v.id}
                    v={v}
                    isPicked={pickedId === v.id}
                    onPick={() => setPickedId(pickedId === v.id ? null : v.id)}
                    highlight
                  />
                ))}
              </div>
            </div>
          )}

          {/* Everyone else */}
          {others.length > 0 && (
            <div>
              <h3 className="t-label mb-3">
                {chosen.length > 0
                  ? 'Or someone else'
                  : data?.service
                    ? `Partners who do ${data.service}`
                    : 'Approved partners'}
              </h3>

              <div className="space-y-2">
                {others.map((v: any) => (
                  <PartnerRow
                    key={v.id}
                    v={v}
                    isPicked={pickedId === v.id}
                    onPick={() => setPickedId(pickedId === v.id ? null : v.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {data?.vendors && data.vendors.length === 0 && (
            <div className="card p-6 text-center">
              <p className="t-meta">
                No approved partners yet. They sign up through Lasan Hub.
              </p>
            </div>
          )}

          {/* The brief, and send */}
          {pickedId && (
            <div>
              <h3 className="t-label mb-3">What should they know?</h3>

              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                rows={3}
                placeholder="Site, dates, size, anything the request doesn't say"
                className="w-full rounded-xl px-4 py-3 text-[14px] border outline-none resize-none"
                style={{
                  background: 'var(--surface-hover)',
                  borderColor: 'var(--line)',
                  color: 'var(--text)',
                }}
              />

              <button
                onClick={assign}
                disabled={busy}
                className="w-full py-3 rounded-xl font-semibold text-[14px] text-white transition mt-3 disabled:opacity-40"
                style={{ background: 'var(--brand)' }}
              >
                {busy ? 'Sending…' : 'Send this work'}
              </button>

              <p className="t-meta mt-2.5 text-center">
                They see the job and the client&apos;s first name — nothing else
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function PartnerRow({
  v,
  isPicked,
  onPick,
  highlight,
}: {
  v: any;
  isPicked: boolean;
  onPick: () => void;
  highlight?: boolean;
}) {
  const tags = [...(v.services || []), ...(v.skills || [])];

  const roleColour =
    v.role === 'vendor' ? '#0EA97A' : v.role === 'freelancer' ? '#3A86FF' : '#C13584';

  return (
    <button
      onClick={onPick}
      className="w-full text-left rounded-xl p-3.5 border transition"
      style={{
        borderColor: isPicked
          ? 'var(--brand)'
          : highlight
            ? `${roleColour}55`
            : 'var(--line)',
        background: isPicked
          ? 'rgba(95,37,159,0.06)'
          : highlight
            ? `${roleColour}0A`
            : 'transparent',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="t-title text-[14.5px]">
              {v.company_name || v.name}
            </span>

            {v.role && (
              <span
                className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded"
                style={{ background: `${roleColour}1F`, color: roleColour }}
              >
                {v.role}
              </span>
            )}

            {v.offers_this && (
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded"
                style={{
                  background: 'rgba(18,179,160,0.14)',
                  color: '#12B3A0',
                }}
              >
                DOES THIS
              </span>
            )}
          </div>

          <div
            className="flex flex-wrap gap-x-3 text-[12px] mt-1"
            style={{ color: 'var(--text-faint)' }}
          >
            {v.city && <span>{v.city}</span>}
            <span>{v.active_jobs} active</span>
            {v.rated_jobs > 0 && (
              <span>
                {v.good_jobs}/{v.rated_jobs} went well
              </span>
            )}
          </div>
        </div>

        <a
          href={`tel:+91${v.phone}`}
          onClick={(e) => e.stopPropagation()}
          className="t-num text-[12.5px] font-semibold shrink-0"
          style={{ color: 'var(--brand)' }}
        >
          {v.phone}
        </a>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {tags.slice(0, 5).map((s: string) => (
            <span
              key={s}
              className="text-[11px] px-2 py-1 rounded-md"
              style={{
                background: 'var(--surface-hover)',
                color: 'var(--text-muted)',
              }}
            >
              {s}
            </span>
          ))}
          {tags.length > 5 && (
            <span
              className="text-[11px] px-1 py-1"
              style={{ color: 'var(--text-faint)' }}
            >
              +{tags.length - 5}
            </span>
          )}
        </div>
      )}

      {v.rate_card && isPicked && (
        <p
          className="text-[12.5px] mt-2.5 whitespace-pre-wrap"
          style={{ color: 'var(--text-muted)' }}
        >
          {v.rate_card}
        </p>
      )}
    </button>
  );
}
