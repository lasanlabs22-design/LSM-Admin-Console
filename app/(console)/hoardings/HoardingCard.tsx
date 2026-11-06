'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Dialog from '@/components/Dialog';
import HoardingForm from './HoardingForm';
import { type AdminHoarding, rupees, sizeLabel } from './types';

/** The card's four small action buttons */
const SMALL = { height: 32, fontSize: 12, padding: '0 10px' };

export default function HoardingCard({ hoarding: h }: { hoarding: AdminHoarding }) {
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isLive = h.status === 'live';
  const isBooked = h.availability === 'booked';
  const size = sizeLabel(h);

  const patch = async (body: Record<string, unknown>) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/hoardings/${h.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/hoardings/${h.id}`, { method: 'DELETE' });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="card overflow-hidden flex flex-col" style={{ opacity: isLive ? 1 : 0.6 }}>
      {/* Cover */}
      <div
        className="relative aspect-[16/10]"
        style={{ background: 'var(--surface-hover)' }}
      >
        {h.photos[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={h.photos[0]} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center t-meta">
            No photo yet
          </div>
        )}

        <div className="absolute top-2 left-2 flex gap-1.5">
          <span className={`pill ${isBooked ? 'pill-warn' : 'pill-good'}`}>
            <span className="pill-dot" />
            {isBooked ? 'Booked' : 'Available'}
          </span>
          {!isLive && <span className="pill pill-mute">Hidden</span>}
        </div>

        {h.photos.length > 1 && (
          <span className="absolute bottom-2 right-2 text-[10px] font-semibold text-white bg-black/60 px-1.5 py-0.5 rounded">
            {h.photos.length} photos
          </span>
        )}
      </div>

      {/* Details */}
      <div className="p-3.5 flex-1 flex flex-col">
        <div className="text-[14px] font-semibold leading-snug line-clamp-2">
          {h.title}
        </div>
        <div className="t-meta mt-1">
          {h.area}, {h.city}
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[12px]" style={{ color: 'var(--text-muted)' }}>
          <span>{h.media_type}</span>
          {size && <span>{size}</span>}
          {h.illumination && <span>{h.illumination}</span>}
        </div>

        <div className="flex items-end justify-between mt-3 pt-3 border-t" style={{ borderColor: 'var(--line)' }}>
          <div>
            <div className="t-num text-[16px] font-semibold" style={{ color: 'var(--brand)' }}>
              {rupees(h.price_per_month)}
            </div>
            <div className="t-meta" style={{ fontSize: 11 }}>
              per month{h.min_months ? ` · min ${h.min_months} mo` : ''}
            </div>
          </div>
          {isBooked && h.available_from && (
            <div className="t-meta text-right" style={{ fontSize: 11 }}>
              Free from
              <br />
              <span className="t-num">{h.available_from}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-1.5 mt-3">
          <button onClick={() => setEditing(true)} disabled={busy} className="btn btn-ghost" style={SMALL}>
            Edit
          </button>
          <button
            onClick={() =>
              patch(
                isBooked
                  ? { availability: 'available', availableFrom: null }
                  : { availability: 'booked' }
              )
            }
            disabled={busy}
            className="btn btn-ghost" style={SMALL}
          >
            {isBooked ? 'Mark available' : 'Mark booked'}
          </button>
          <button
            onClick={() => patch({ status: isLive ? 'hidden' : 'live' })}
            disabled={busy}
            className="btn btn-ghost" style={SMALL}
          >
            {isLive ? 'Hide from app' : 'Show in app'}
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={busy}
            className="btn btn-ghost"
            style={{ ...SMALL, color: 'var(--bad)' }}
          >
            Delete
          </button>
        </div>
      </div>

      {editing && (
        <HoardingForm hoarding={h} onClose={() => setEditing(false)} />
      )}

      {confirmDelete && (
        <Dialog label="Delete hoarding" onClose={() => !busy && setConfirmDelete(false)}>
          <h2 className="t-title">Delete this hoarding?</h2>
          <p className="t-body mt-2">
            “{h.title}” disappears from the app straight away. To take it
            down for a while instead, use <b>Hide from app</b>.
          </p>
          <div className="flex gap-2 mt-5">
            <button onClick={remove} disabled={busy} className="btn btn-bad flex-1">
              {busy ? 'Deleting…' : 'Delete'}
            </button>
            <button onClick={() => setConfirmDelete(false)} disabled={busy} className="btn btn-ghost">
              Cancel
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
