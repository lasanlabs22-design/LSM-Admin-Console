'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Catches anything a console page throws while rendering, so a bug on one
 * screen shows this — with the navigation still around it — instead of
 * taking the whole console down.
 */
export default function ConsoleError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="space-y-6">
      <header className="rise">
        <h1 className="t-display">Something went wrong</h1>
        <p className="t-body mt-1.5">
          This screen hit an error. The rest of the console still works.
        </p>
      </header>

      <div
        role="alert"
        className="card p-5 flex flex-wrap items-center gap-3"
        style={{ borderColor: 'var(--bad-line)' }}
      >
        <p className="t-meta flex-1 min-w-[200px]">
          {error.digest
            ? `Reference: ${error.digest}`
            : 'Try again in a moment.'}
        </p>
        <button onClick={retry} className="btn btn-primary">
          Try again
        </button>
        <Link href="/" className="btn btn-ghost">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
