'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Dialog from '@/components/Dialog';
import { errorMessage } from '@/lib/meta';
import {
  type AdminHoarding,
  MEDIA_TYPES,
  ILLUMINATION,
} from './types';

/** What the backend hands back to sign one upload */
type UploadSignature = {
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: string;
  signature: string;
};

const MAX_PHOTOS = 8;
const MAX_MB = 10;

/** Signs, then uploads one photo straight to Cloudinary */
async function uploadPhoto(file: File): Promise<string> {
  const sigRes = await fetch('/api/hoardings/upload-signature', {
    method: 'POST',
  });
  const sig = (await sigRes.json().catch(() => ({}))) as
    | UploadSignature
    | { error?: string };

  if (!sigRes.ok || !('signature' in sig)) {
    throw new Error(
      ('error' in sig && sig.error) || 'Could not start the upload'
    );
  }

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sig.apiKey);
  form.append('timestamp', sig.timestamp);
  form.append('folder', sig.folder);
  form.append('signature', sig.signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
    { method: 'POST', body: form }
  );
  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.secure_url) throw new Error('Photo upload failed');
  return data.secure_url as string;
}

/**
 * "17.4483, 78.3915" pasted from Google Maps (right-click a spot → the
 * coordinates are copied). Returns null for empty, false for nonsense.
 */
function parsePin(raw: string): { lat: number; lng: number } | null | false {
  const v = raw.trim();
  if (!v) return null;
  const m = v.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (!m) return false;
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return false;
  return { lat, lng };
}

type Props = {
  /** Editing this one; without it the form adds a new hoarding */
  hoarding?: AdminHoarding;
  onClose: () => void;
};

export default function HoardingForm({ hoarding: h, onClose }: Props) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(h?.title ?? '');
  const [mediaType, setMediaType] = useState(h?.media_type ?? 'Billboard');
  const [city, setCity] = useState(h?.city ?? '');
  const [area, setArea] = useState(h?.area ?? '');
  const [address, setAddress] = useState(h?.address ?? '');
  const [pin, setPin] = useState(
    h?.latitude != null && h?.longitude != null
      ? `${h.latitude}, ${h.longitude}`
      : ''
  );
  const [widthFt, setWidthFt] = useState(h?.width_ft?.toString() ?? '');
  const [heightFt, setHeightFt] = useState(h?.height_ft?.toString() ?? '');
  const [illumination, setIllumination] = useState(h?.illumination ?? '');
  const [facing, setFacing] = useState(h?.facing ?? '');
  const [traffic, setTraffic] = useState(h?.traffic ?? '');
  const [price, setPrice] = useState(h?.price_per_month?.toString() ?? '');
  const [minMonths, setMinMonths] = useState(h?.min_months?.toString() ?? '');
  const [availability, setAvailability] = useState<'available' | 'booked'>(
    h?.availability ?? 'available'
  );
  const [availableFrom, setAvailableFrom] = useState(h?.available_from ?? '');
  const [description, setDescription] = useState(h?.description ?? '');
  const [photos, setPhotos] = useState<string[]>(h?.photos ?? []);
  const [status, setStatus] = useState<'live' | 'hidden'>(h?.status ?? 'live');

  const [uploading, setUploading] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const busy = saving || uploading > 0;

  const addPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError('');

    const room = MAX_PHOTOS - photos.length;
    const picked = Array.from(files).slice(0, room);

    for (const f of picked) {
      if (!f.type.startsWith('image/')) {
        setError(`${f.name} is not an image`);
        return;
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        setError(`Photos must be under ${MAX_MB}MB`);
        return;
      }
    }

    setUploading(picked.length);
    try {
      // One at a time, so they keep the order they were picked in
      for (const f of picked) {
        const url = await uploadPhoto(f);
        setPhotos((prev) => [...prev, url]);
        setUploading((n) => n - 1);
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setUploading(0);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const makeCover = (url: string) =>
    setPhotos((prev) => [url, ...prev.filter((p) => p !== url)]);

  const removePhoto = (url: string) =>
    setPhotos((prev) => prev.filter((p) => p !== url));

  const save = async () => {
    setError('');

    if (title.trim().length < 2) return setError('Give the hoarding a title');
    if (!city.trim()) return setError('City is required');
    if (!area.trim()) return setError('Area is required');

    const parsed = parsePin(pin);
    if (parsed === false) {
      return setError('Map pin should look like 17.4483, 78.3915');
    }

    setSaving(true);
    try {
      const body = {
        title,
        mediaType,
        city,
        area,
        address,
        latitude: parsed ? parsed.lat : null,
        longitude: parsed ? parsed.lng : null,
        widthFt: widthFt || null,
        heightFt: heightFt || null,
        illumination,
        facing,
        traffic,
        pricePerMonth: price || null,
        minMonths: minMonths || null,
        availability,
        availableFrom: availability === 'booked' ? availableFrom || null : null,
        description,
        photos,
        status,
      };

      const res = await fetch(
        h ? `/api/hoardings/${h.id}` : '/api/hoardings',
        {
          method: h ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Could not save the hoarding');
      }

      router.refresh();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      label={h ? 'Edit hoarding' : 'Add hoarding'}
      size="panel"
      onClose={() => {
        // Don't drop a half-finished upload or save
        if (!busy) onClose();
      }}
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="t-title">{h ? 'Edit hoarding' : 'Add a hoarding'}</h2>
          <button
            onClick={onClose}
            disabled={busy}
            className="w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-40"
            style={{ background: 'var(--surface-hover)' }}
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4Z" />
            </svg>
          </button>
        </div>

        {/* ---------- Photos ---------- */}
        <section>
          <Label hint="The first one is the cover in the app">Photos</Label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {photos.map((url, i) => (
              <div
                key={url}
                className="relative aspect-[4/3] rounded-xl overflow-hidden group"
                style={{ background: 'var(--surface-hover)' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute top-1.5 left-1.5 pill pill-brand">
                    Cover
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex gap-1 p-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                  {i > 0 && (
                    <button
                      onClick={() => makeCover(url)}
                      disabled={busy}
                      className="flex-1 text-[10.5px] font-semibold py-1 rounded-md bg-black/70 text-white"
                    >
                      Make cover
                    </button>
                  )}
                  <button
                    onClick={() => removePhoto(url)}
                    disabled={busy}
                    className="px-2 text-[10.5px] font-semibold py-1 rounded-md text-white"
                    style={{ background: 'var(--bad)' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {photos.length < MAX_PHOTOS && (
              <button
                onClick={() => fileInput.current?.click()}
                disabled={busy}
                className="aspect-[4/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition disabled:opacity-50"
                style={{
                  borderColor: 'var(--line)',
                  background: 'var(--surface-hover)',
                  color: 'var(--text-faint)',
                }}
              >
                <span className="text-[22px] leading-none">+</span>
                <span className="text-[11px] font-medium">
                  {uploading > 0 ? `Uploading ${uploading}…` : 'Add photos'}
                </span>
              </button>
            )}
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => addPhotos(e.target.files)}
          />
        </section>

        {/* ---------- What and where ---------- */}
        <section className="grid sm:grid-cols-2 gap-3">
          <Field label="Title" className="sm:col-span-2">
            <input
              className="field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hitech City Flyover, facing Cyber Towers"
              maxLength={120}
            />
          </Field>

          <Field label="Type">
            <select
              className="field"
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value)}
            >
              {MEDIA_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>

          <Field label="Lighting">
            <select
              className="field"
              value={illumination}
              onChange={(e) => setIllumination(e.target.value)}
            >
              <option value="">Not specified</option>
              {ILLUMINATION.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>

          <Field label="City">
            <input
              className="field"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Hyderabad"
              maxLength={60}
            />
          </Field>

          <Field label="Area">
            <input
              className="field"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Madhapur"
              maxLength={80}
            />
          </Field>

          <Field label="Address / landmark" className="sm:col-span-2">
            <input
              className="field"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Opp. Inorbit Mall, Mindspace Road"
              maxLength={200}
            />
          </Field>

          <Field
            label="Map pin"
            hint="In Google Maps, right-click the spot and click the numbers to copy them, then paste here"
            className="sm:col-span-2"
          >
            <input
              className="field"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="17.4483, 78.3915"
            />
          </Field>
        </section>

        {/* ---------- Size, audience, price ---------- */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="Width (ft)">
            <input
              className="field"
              inputMode="decimal"
              value={widthFt}
              onChange={(e) => setWidthFt(e.target.value)}
              placeholder="40"
            />
          </Field>
          <Field label="Height (ft)">
            <input
              className="field"
              inputMode="decimal"
              value={heightFt}
              onChange={(e) => setHeightFt(e.target.value)}
              placeholder="20"
            />
          </Field>
          <Field label="Price / month (₹)">
            <input
              className="field"
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ''))}
              placeholder="85000"
            />
          </Field>
          <Field label="Min. months">
            <input
              className="field"
              inputMode="numeric"
              value={minMonths}
              onChange={(e) => setMinMonths(e.target.value.replace(/[^\d]/g, ''))}
              placeholder="1"
            />
          </Field>

          <Field label="Facing" className="col-span-2">
            <input
              className="field"
              value={facing}
              onChange={(e) => setFacing(e.target.value)}
              placeholder="Traffic towards Gachibowli"
              maxLength={120}
            />
          </Field>
          <Field label="Traffic / footfall" className="col-span-2">
            <input
              className="field"
              value={traffic}
              onChange={(e) => setTraffic(e.target.value)}
              placeholder="~1.2 lakh vehicles a day"
              maxLength={120}
            />
          </Field>
        </section>

        {/* ---------- Availability and visibility ---------- */}
        <section className="grid sm:grid-cols-3 gap-3">
          <Field label="Availability">
            <select
              className="field"
              value={availability}
              onChange={(e) =>
                setAvailability(e.target.value as 'available' | 'booked')
              }
            >
              <option value="available">Available now</option>
              <option value="booked">Booked</option>
            </select>
          </Field>

          {availability === 'booked' && (
            <Field label="Free again from">
              <input
                className="field"
                type="date"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
              />
            </Field>
          )}

          <Field label="Show in the app">
            <select
              className="field"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'live' | 'hidden')}
            >
              <option value="live">Live</option>
              <option value="hidden">Hidden</option>
            </select>
          </Field>
        </section>

        <Field label="Description">
          <textarea
            className="field resize-none"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Anything else a customer should know — visibility, nearby landmarks, printing and mounting included or not…"
            maxLength={1000}
          />
        </Field>

        {error && (
          <p className="text-[13px]" style={{ color: 'var(--bad)' }}>
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            onClick={save}
            disabled={busy}
            className="btn btn-primary flex-1"
          >
            {saving ? 'Saving…' : h ? 'Save changes' : 'Add hoarding'}
          </button>
          <button onClick={onClose} disabled={busy} className="btn btn-ghost">
            Cancel
          </button>
        </div>
      </div>
    </Dialog>
  );
}

function Label({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-1.5">
      <span className="t-label">{children}</span>
      {hint && (
        <span className="t-meta ml-2" style={{ fontSize: 11 }}>
          {hint}
        </span>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className ?? ''}`}>
      <Label hint={hint}>{label}</Label>
      {children}
    </label>
  );
}
