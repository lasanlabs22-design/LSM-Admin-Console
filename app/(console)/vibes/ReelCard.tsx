'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminReel } from './page';

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
}

export default function ReelCard({ reel }: { reel: AdminReel }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(reel.caption || '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isLive = reel.status === 'live';

  const patch = async (body: Record<string, any>) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/reels/${reel.id}`, {
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
      const res = await fetch(`/api/reels/${reel.id}`, { method: 'DELETE' });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div
      className="card overflow-hidden group relative"
      style={{ opacity: isLive ? 1 : 0.55 }}
    >
      {/* Video — plays on hover */}
      <div
        className="relative aspect-[9/16] cursor-pointer"
        style={{ background: 'var(--surface-hover)' }}
        onMouseEnter={() => videoRef.current?.play().catch(() => {})}
        onMouseLeave={() => {
          videoRef.current?.pause();
          if (videoRef.current) videoRef.current.currentTime = 0;
        }}
      >
        <video
          ref={videoRef}
          src={reel.video_url}
          poster={reel.thumbnail_url || undefined}
          className="w-full h-full object-cover"
          muted
          loop
          playsInline
          preload="metadata"
        />

        {/* Source badge */}
        <span
          className="absolute top-2 left-2 text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded"
          style={{
            letterSpacing: '0.08em',
            background:
              reel.source === 'user'
                ? 'rgba(123,47,247,0.9)'
                : 'rgba(255,107,53,0.9)',
            color: '#fff',
          }}
        >
          {reel.source === 'user' ? 'User' : 'Team'}
        </span>

        {/* Hidden marker */}
        {!isLive && (
          <span className="absolute top-2 right-2 text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-black/70 text-white">
            Hidden
          </span>
        )}

        {/* Views */}
        <span className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] text-white bg-black/55 px-1.5 py-0.5 rounded">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
            <path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
          </svg>
          <span className="t-num">{reel.view_count}</span>
        </span>
      </div>

      {/* Details */}
      <div className="p-3">
        {editing ? (
          <div className="space-y-2">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              maxLength={300}
              autoFocus
              className="w-full rounded-lg px-2.5 py-2 text-[12px] border outline-none resize-none focus:border-[var(--brand)]"
              style={{
                background: 'var(--surface-hover)',
                borderColor: 'var(--line)',
                color: 'var(--text)',
              }}
            />
            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  patch({ caption });
                  setEditing(false);
                }}
                disabled={busy}
                className="flex-1 text-[11px] font-semibold py-1.5 rounded-lg text-white"
                style={{ background: 'var(--brand)' }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setCaption(reel.caption || '');
                  setEditing(false);
                }}
                className="px-3 text-[11px] rounded-lg border"
                style={{
                  borderColor: 'var(--line)',
                  color: 'var(--text-faint)',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-[12px] font-semibold truncate">
              {reel.username}
            </div>

            <p
              className="text-[11.5px] mt-0.5 line-clamp-2 min-h-[30px]"
              style={{ color: 'var(--text-faint)' }}
            >
              {reel.caption || 'No caption'}
            </p>

            <div
              className="flex items-center justify-between mt-2 pt-2 border-t"
              style={{ borderColor: 'var(--line)' }}
            >
              <span
                className="t-num text-[10px]"
                style={{ color: 'var(--text-faint)' }}
              >
                {timeAgo(reel.created_at)}
              </span>

              <div className="flex gap-1">
                <IconButton
                  title="Edit caption"
                  onClick={() => setEditing(true)}
                  disabled={busy}
                >
                  <path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25ZM20.7 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z" />
                </IconButton>

                <IconButton
                  title={isLive ? 'Hide from the app' : 'Show in the app'}
                  onClick={() => patch({ status: isLive ? 'hidden' : 'live' })}
                  disabled={busy}
                >
                  {isLive ? (
                    <path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
                  ) : (
                    <path d="M2 4.3 3.3 3 21 20.7 19.7 22l-3-3A11 11 0 0 1 12 20C5 20 2 13 2 13a17 17 0 0 1 4-5L2 4.3ZM12 6c7 0 10 7 10 7a17 17 0 0 1-3 4l-3-3a4 4 0 0 0-5-5L8.6 6.6A11 11 0 0 1 12 6Z" />
                  )}
                </IconButton>

                <IconButton
                  title="Delete"
                  danger
                  onClick={() => setConfirmDelete(true)}
                  disabled={busy}
                >
                  <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12ZM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4Z" />
                </IconButton>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete confirmation, over the card */}
      {confirmDelete && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
          <p className="text-white text-[13px] font-medium mb-1">
            Delete this reel?
          </p>
          <p className="text-white/50 text-[11px] mb-4">
            The video is removed permanently
          </p>

          <div className="flex gap-2 w-full">
            <button
              onClick={remove}
              disabled={busy}
              className="flex-1 text-[12px] font-semibold py-2 rounded-lg text-white disabled:opacity-50"
              style={{ background: '#D93025' }}
            >
              {busy ? 'Deleting…' : 'Delete'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 text-[12px] py-2 rounded-lg text-white/70 border border-white/20"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function IconButton({
  children,
  onClick,
  title,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="w-6 h-6 rounded-md flex items-center justify-center transition disabled:opacity-30 hover:opacity-100"
      style={{
        background: 'var(--surface-hover)',
        color: danger ? '#EF4444' : 'var(--text-faint)',
      }}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        {children}
      </svg>
    </button>
  );
}
