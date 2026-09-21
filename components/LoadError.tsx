'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

/**
 * Shown in place of a section that couldn't load. The rest of the page
 * stays usable, and Retry reloads the data without a full page refresh.
 */
export default function LoadError({
  message,
  title,
}: {
  message: string;
  title?: string;
}) {
  const router = useRouter();
  const [retrying, startRetry] = useTransition();

  return (
    <div
      role="alert"
      className="card p-4 sm:p-5 flex flex-wrap items-start gap-x-4 gap-y-3"
      style={{ borderColor: 'var(--bad-line)' }}
    >
      <div className="flex-1 min-w-[200px]">
        {title && (
          <div className="t-title mb-1" style={{ color: 'var(--bad)' }}>
            {title}
          </div>
        )}
        <p
          className="text-[13.5px]"
          style={{ color: title ? 'var(--text-muted)' : 'var(--bad)' }}
        >
          {message}
        </p>
        <p className="t-meta mt-1.5">This page also retries on its own.</p>
      </div>

      <button
        onClick={() => startRetry(() => router.refresh())}
        disabled={retrying}
        className="btn btn-ghost shrink-0"
      >
        {retrying ? 'Retrying…' : 'Retry'}
      </button>
    </div>
  );
}
