'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const MAX_MB = 100;

export default function ReelUploader() {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [username, setUsername] = useState('@lasanmart');
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  const pick = (f: File | null) => {
    setError('');

    if (!f) return;

    if (!f.type.startsWith('video/')) {
      setError('That is not a video file');
      return;
    }

    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`Videos must be under ${MAX_MB}MB`);
      return;
    }

    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setCaption('');
    setProgress(0);
    setError('');
    if (fileInput.current) fileInput.current.value = '';
  };

  const upload = async () => {
    if (!file || busy) return;

    setBusy(true);
    setError('');
    setProgress(0);

    try {
      /* ---- 1. Straight to Cloudinary ---- */
      const form = new FormData();
      form.append('file', file);
      form.append('upload_preset', PRESET as string);

      const cloudinary = await new Promise<any>((resolve, reject) => {
        // XMLHttpRequest, not fetch — it's the only way to get
        // real upload progress, and a 60MB video needs a progress bar
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            // e.loaded can exceed e.total because of multipart overhead,
            // so clamp it. We stop at 99% — the last step is Cloudinary
            // transcoding, which finishes when onload fires.
            setProgress(Math.min(99, Math.round((e.loaded / e.total) * 100)));
          }
        };

        xhr.onload = () => {
          setProgress(100);

          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error('Upload failed'));
          }
        };

        xhr.onerror = () => reject(new Error('Upload failed'));

        xhr.open(
          'POST',
          `https://api.cloudinary.com/v1_1/${CLOUD}/video/upload`
        );
        xhr.send(form);
      });

      /* ---- 2. Tell our backend about it ---- */
      // Cloudinary can generate a thumbnail by swapping the extension
      const thumbnailUrl = cloudinary.secure_url.replace(/\.\w+$/, '.jpg');

      const res = await fetch('/api/reels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: cloudinary.secure_url,
          thumbnailUrl,
          publicId: cloudinary.public_id,
          duration: cloudinary.duration,
          caption: caption.trim(),
          username: username.trim(),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Could not save the reel');
      }

      reset();
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card p-5">
      <h2 className="t-label mb-4">Post a reel</h2>

      {!file ? (
        /* ---------- Drop zone ---------- */
        <div
          onClick={() => fileInput.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pick(e.dataTransfer.files[0]);
          }}
          className="rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition"
          style={{
            borderColor: dragging ? 'var(--brand)' : 'var(--line)',
            background: dragging ? 'var(--brand-soft)' : 'var(--surface-hover)',
          }}
        >
          <div
            className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
            style={{ background: 'var(--brand-soft)' }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--brand)"
              strokeWidth="2"
              className="w-5 h-5"
            >
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </div>

          <p className="text-[14px] font-medium">
            Drop a video here, or click to choose
          </p>
          <p className="t-meta mt-1">MP4 or MOV · up to {MAX_MB}MB</p>
        </div>
      ) : (
        /* ---------- Preview and details ---------- */
        <div className="space-y-4">
          <div className="flex gap-4">
            <video
              src={previewUrl!}
              className="w-24 h-[136px] object-cover rounded-xl shrink-0"
              style={{ background: 'var(--surface-hover)' }}
              muted
              playsInline
            />

            <div className="flex-1 min-w-0 space-y-2.5">
              <div>
                <div className="text-[13px] font-medium truncate">
                  {file.name}
                </div>
                <div className="t-meta t-num">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </div>
              </div>

              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@lasanmart"
                disabled={busy}
                className="w-full rounded-lg px-3 h-9 text-[13px] border outline-none transition focus:border-[var(--brand)]"
                style={{
                  background: 'var(--surface-hover)',
                  borderColor: 'var(--line)',
                  color: 'var(--text)',
                }}
              />

              <button
                onClick={reset}
                disabled={busy}
                className="text-[12px] transition hover:opacity-70 disabled:opacity-30"
                style={{ color: 'var(--text-faint)' }}
              >
                Choose a different video
              </button>
            </div>
          </div>

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={2}
            maxLength={300}
            placeholder="Caption — what's happening in this reel?"
            disabled={busy}
            className="w-full rounded-xl px-4 py-3 text-[14px] border outline-none resize-none transition focus:border-[var(--brand)]"
            style={{
              background: 'var(--surface-hover)',
              borderColor: 'var(--line)',
              color: 'var(--text)',
            }}
          />

          {/* Progress */}
          {busy && (
            <div>
              <div className="flex justify-between t-meta mb-1.5">
                <span>
                  {progress >= 100 ? 'Processing video…' : 'Uploading…'}
                </span>
                <span className="t-num">{progress}%</span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: 'var(--surface-hover)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg,#FF8A3D,#F2542D)',
                  }}
                />
              </div>
            </div>
          )}

          <button
            onClick={upload}
            disabled={busy}
            className="w-full text-white font-semibold text-[14px] py-3 rounded-xl transition disabled:opacity-40 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#FF8A3D,#F2542D)' }}
          >
            {busy
              ? progress >= 100
                ? 'Processing…'
                : `Uploading ${progress}%`
              : 'Publish reel'}
          </button>
        </div>
      )}

      {error && (
        <p className="text-[13px] mt-3" style={{ color: '#EF4444' }}>
          {error}
        </p>
      )}

      <input
        ref={fileInput}
        type="file"
        accept="video/*"
        hidden
        onChange={(e) => pick(e.target.files?.[0] || null)}
      />
    </div>
  );
}
