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

  const dirty =
    status !== request.status ||
    assignedTo !== (request.assigned_to || '') ||
    note !== (request.internal_note || '');

  const save = async (overrides?: Partial<Record<string, string>>) => {
    setBusy(true);
    setSaved(false);

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
        alert(body.error || 'Could not save');
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } catch {
      alert('Could not reach the server');
    } finally {
      setBusy(false);
    }
  };

  /** Status changes save straight away — it's the most common action */
  const changeStatus = (next: string) => {
    setStatus(next);
    save({ status: next });
  };

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 space-y-5">
      {/* Status */}
      <div>
        <label className="block text-white/40 text-[11px] font-bold uppercase tracking-[0.15em] mb-3">
          Status
        </label>

        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((s) => {
            const meta = STATUS_META[s];
            const active = status === s;

            return (
              <button
                key={s}
                onClick={() => changeStatus(s)}
                disabled={busy}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition disabled:opacity-50 ${
                  active ? 'text-white' : 'text-white/50 border-white/12 hover:text-white/80'
                }`}
                style={
                  active
                    ? { background: meta.color, borderColor: meta.color }
                    : undefined
                }
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Assignee */}
      <div>
        <label className="block text-white/40 text-[11px] font-bold uppercase tracking-[0.15em] mb-3">
          Assigned to
        </label>

        <input
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          list="assignee-names"
          placeholder="Type a name — leave blank to unassign"
          className="w-full bg-white/[0.05] border border-white/12 rounded-xl px-4 py-2.5 text-sm placeholder-white/30 outline-none focus:border-[#FF6B35] transition"
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
                className="text-xs bg-white/[0.07] hover:bg-white/[0.12] px-2.5 py-1 rounded-lg text-white/60 transition"
              >
                {a}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Internal note */}
      <div>
        <label className="block text-white/40 text-[11px] font-bold uppercase tracking-[0.15em] mb-3">
          Internal note
        </label>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="What happened on the call, what to do next…"
          className="w-full bg-white/[0.05] border border-white/12 rounded-xl px-4 py-3 text-sm placeholder-white/30 outline-none focus:border-[#FF6B35] transition resize-none"
        />
        <p className="text-white/25 text-xs mt-1.5">
          Only your team sees this — never shown in the app
        </p>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => save()}
          disabled={busy || !dirty}
          className="bg-gradient-to-r from-[#FF8A3D] to-[#F2542D] font-bold px-6 py-2.5 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition hover:opacity-90"
        >
          {busy ? 'Saving…' : 'Save changes'}
        </button>

        {saved && (
          <span className="text-[#12B3A0] text-sm font-semibold">Saved ✓</span>
        )}

        {request.assigned_at && (
          <span className="text-white/30 text-xs ml-auto">
            Assigned {new Date(request.assigned_at).toLocaleDateString('en-IN')}
          </span>
        )}
      </div>
    </div>
  );
}