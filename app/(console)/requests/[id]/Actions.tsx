'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminRequest } from '@/lib/api';
import { STATUSES, STATUS_META } from '@/lib/meta';

export default function Actions({
  request,
  assignees,
}: {
  request: AdminRequest;
  assignees: string[];
}) {
  const router = useRouter();

  const [status, setStatus] = useState(request.status);
  const [assignedTo, setAssignedTo] = useState(request.assigned_to || '');
  const [note, setNote] = useState(request.internal_note || '');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  const dirty =
    assignedTo !== (request.assigned_to || '') ||
    note !== (request.internal_note || '');

  const save = async (overrides?: Record<string, string>) => {
    setBusy(true);
    setSaved(false);
    setFailed(null);

    try {
      const res = await fetch(`/api/requests/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: overrides?.status ?? status,
          assignedTo: overrides?.assignedTo ?? assignedTo,
          internalNote: overrides?.internalNote ?? note,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setFailed(body.error || 'Could not save');
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
      router.refresh();
    } catch {
      setFailed('Could not reach the server');
    } finally {
      setBusy(false);
    }
  };

  /** Status saves on tap — it's the most common action */
  const changeStatus = (next: string) => {
    if (next === status) return;
    setStatus(next);
    save({ status: next });
  };

  return (
    <div className="card p-5 space-y-6">
      {/* Status */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="t-label">Status</span>
          {busy && (
            <span className="t-meta" style={{ fontSize: 11 }}>
              Saving…
            </span>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((s) => {
            const meta = STATUS_META[s];
            const active = status === s;

            return (
              <button
                key={s}
                onClick={() => changeStatus(s)}
                disabled={busy}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-semibold border transition disabled:opacity-50"
                style={
                  active
                    ? {
                        background: meta.color,
                        borderColor: meta.color,
                        color: '#fff',
                      }
                    : {
                        background: 'var(--surface)',
                        borderColor: 'var(--line)',
                        color: 'var(--text-faint)',
                      }
                }
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: active ? '#fff' : meta.color }}
                />
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Assignee */}
      <div>
        <label className="block t-label mb-3">Assigned to</label>

        <input
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          list="assignee-names"
          placeholder="Type a name — leave blank to unassign"
          className="w-full rounded-xl px-4 h-11 text-[14px] border outline-none transition focus:border-[var(--brand)]"
          style={{
            background: 'var(--surface-hover)',
            borderColor: 'var(--line)',
            color: 'var(--text)',
          }}
        />

        {/* Names already in use, so spellings stay consistent */}
        <datalist id="assignee-names">
          {assignees.map((a) => (
            <option key={a} value={a} />
          ))}
        </datalist>

        {assignees.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-2.5">
            {assignees.map((a) => (
              <button
                key={a}
                onClick={() => setAssignedTo(a)}
                className="text-[12px] px-2.5 py-1 rounded-lg transition border"
                style={
                  assignedTo === a
                    ? {
                        background: 'var(--brand-soft)',
                        borderColor: 'transparent',
                        color: 'var(--brand)',
                      }
                    : {
                        background: 'var(--surface-hover)',
                        borderColor: 'transparent',
                        color: 'var(--text-faint)',
                      }
                }
              >
                {a}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Internal note */}
      <div>
        <label className="block t-label mb-3">Internal note</label>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="What happened on the call, what to do next…"
          className="w-full rounded-xl px-4 py-3 text-[14px] border outline-none transition resize-none focus:border-[var(--brand)]"
          style={{
            background: 'var(--surface-hover)',
            borderColor: 'var(--line)',
            color: 'var(--text)',
          }}
        />
        <p className="t-meta mt-1.5" style={{ fontSize: 11.5 }}>
          Only your team sees this — never shown in the app
        </p>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => save()}
          disabled={busy || !dirty}
          className="text-white font-semibold text-[14px] px-5 py-2.5 rounded-xl transition disabled:opacity-25 disabled:cursor-not-allowed hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #FF8A3D, #F2542D)',
          }}
        >
          {busy ? 'Saving…' : 'Save changes'}
        </button>

        {saved && (
          <span
            className="flex items-center gap-1.5 text-[13px] font-semibold"
            style={{ color: '#12B3A0' }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z" />
            </svg>
            Saved
          </span>
        )}

        {failed && (
          <span className="text-[13px]" style={{ color: '#EF4444' }}>
            {failed}
          </span>
        )}

        {request.assigned_at && (
          <span className="t-meta ml-auto" style={{ fontSize: 11.5 }}>
            Assigned {new Date(request.assigned_at).toLocaleDateString('en-IN')}
          </span>
        )}
      </div>
    </div>
  );
}