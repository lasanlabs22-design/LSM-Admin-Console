import { adminFetch } from '@/lib/api';
import { timeAgo } from '@/lib/meta';
import InfluencerCard from './InfluencerCard';
import StatusFilter from './StatusFilter';

export type AdminInfluencer = {
  id: string;
  phone: string;
  name: string;
  email: string | null;
  photo_url: string | null;
  instagram_id: string | null;
  followers: string | null;
  category: string | null;
  city: string | null;
  bio: string | null;
  rate_per_post: number | null;
  status: 'pending' | 'approved' | 'rejected' | 'paused';
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string;
  open_requests: number;
};

export default async function InfluencersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.q) query.set('q', params.q);

  let influencers: AdminInfluencer[] = [];
  let stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  } | null = null;
  let error: string | null = null;

  try {
    const data = await adminFetch(`/admin/influencers?${query.toString()}`);
    influencers = data.influencers;
    stats = data.stats;
  } catch (err: any) {
    error = err.message;
  }

  return (
    <div className="space-y-5">
      <header className="rise">
        <h1 className="t-display">Creators</h1>
        <p className="t-body mt-1.5">
          {stats
            ? stats.pending > 0
              ? `${stats.pending} waiting for review`
              : `${stats.approved} approved`
            : 'Loading…'}
        </p>
      </header>

      {stats && (
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 rise"
          style={{ animationDelay: '0.05s' }}
        >
          <Stat
            label="Waiting"
            value={stats.pending}
            accent="#E8AE00"
            urgent={stats.pending > 0}
          />
          <Stat label="Approved" value={stats.approved} accent="#12B3A0" />
          <Stat label="Rejected" value={stats.rejected} accent="#8A8F98" />
          <Stat label="Total" value={stats.total} accent="var(--brand)" />
        </div>
      )}

      <div className="rise" style={{ animationDelay: '0.1s' }}>
        <StatusFilter current={params} />
      </div>

      {error && (
        <div
          className="card p-4"
          style={{ borderColor: 'rgba(217,48,37,0.3)' }}
        >
          <p className="text-[13px]" style={{ color: '#EF4444' }}>
            {error}
          </p>
        </div>
      )}

      {!error && influencers.length === 0 && (
        <div className="card p-12 text-center">
          <p className="t-body">No creator applications yet</p>
          <p className="t-meta mt-1.5">
            They&apos;ll appear here once creators start signing up
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {influencers.map((inf, i) => (
          <InfluencerCard key={inf.id} influencer={inf} index={i} />
        ))}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  urgent,
}: {
  label: string;
  value: number;
  accent: string;
  urgent?: boolean;
}) {
  return (
    <div
      className="card p-4 relative overflow-hidden"
      style={urgent ? { borderColor: `${accent}55` } : undefined}
    >
      <span
        className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-[0.13]"
        style={{ background: accent }}
      />
      <div className="relative">
        <div className="flex items-center gap-1.5">
          {urgent && (
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: accent }}
            />
          )}
          <span className="t-label">{label}</span>
        </div>
        <div
          className="t-num mt-2.5 leading-none"
          style={{ fontSize: 30, fontWeight: 600, color: accent }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
