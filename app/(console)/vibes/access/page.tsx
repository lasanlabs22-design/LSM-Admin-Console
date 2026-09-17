import Link from 'next/link';
import { adminFetch } from '@/lib/api';
import AccessRequest from '../AccessRequest';
import AccessHolder from '../AccessHolder';
import AutoRefresh from '@/components/AutoRefresh';

export default async function VibesAccessPage() {
  let pending: any[] = [];
  let approved: any[] = [];
  let error: string | null = null;

  try {
    const data = await adminFetch('/admin/vibes-access');
    pending = data.pending;
    approved = data.approved;
  } catch (err: any) {
    error = err.message;
  }

  return (
    <div className="space-y-5">
      <AutoRefresh />

      <header className="rise">
        <div className="flex items-center gap-3">
          <Link
            href="/vibes"
            className="text-[13px] font-semibold"
            style={{ color: 'var(--brand)' }}
          >
            ← Vibes
          </Link>
        </div>

        <h1 className="t-display mt-2">Posting access</h1>
        <p className="t-body mt-1.5">
          {pending.length > 0
            ? `${pending.length} waiting for an answer`
            : `${approved.length} can post`}
        </p>
      </header>

      {error && (
        <div
          className="card p-4"
          style={{ borderColor: 'rgba(217,48,37,0.3)' }}
        >
          <p className="text-[13px]" style={{ color: 'var(--bad)' }}>
            {error}
          </p>
        </div>
      )}

      {/* Waiting on us */}
      <div className="rise" style={{ animationDelay: '0.05s' }}>
        <h2 className="t-label mb-3">Waiting on us</h2>

        {pending.length > 0 ? (
          <div className="space-y-2.5">
            {pending.map((p) => (
              <AccessRequest key={p.id} person={p} />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <p className="t-body">Nobody waiting</p>
            <p className="t-meta mt-1.5">
              People ask from the Vibes screen in the app
            </p>
          </div>
        )}
      </div>

      {/* Who already has it */}
      {approved.length > 0 && (
        <div className="rise" style={{ animationDelay: '0.1s' }}>
          <h2 className="t-label mb-3">Can post ({approved.length})</h2>

          <div className="card overflow-hidden">
            {approved.map((p) => (
              <AccessHolder key={p.id} person={p} />
            ))}
          </div>

          <p className="t-meta mt-3" style={{ fontSize: 11.5 }}>
            Revoking stops new posts. Anything already up stays — hide it from
            the Vibes page if you need to.
          </p>
        </div>
      )}
    </div>
  );
}
