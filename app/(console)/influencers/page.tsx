import Link from 'next/link';
import { adminFetch } from '@/lib/api';
import InfluencerCard from './InfluencerCard';
import StatusFilter from './StatusFilter';
import HubRequest, { HubRequestItem } from './HubRequest';
import AutoRefresh from '@/components/AutoRefresh';

export type AdminInfluencer = {
  id: string;
  phone: string;
  role: 'influencer' | 'vendor' | 'freelancer';
  name: string;
  email: string | null;
  photo_url: string | null;
  instagram_id: string | null;
  followers: string | null;
  category: string | null;
  city: string | null;
  bio: string | null;
  rate_per_post: number | null;
  company_name: string | null;
  gst_number: string | null;
  services: string[] | null;
  other_service: string | null;
  portfolio_url: string | null;
  skills: string[] | null;
  rate_card: string | null;
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

  /* Two views of the message queue: what needs answering, and what's done */
  const showDone = params.messages === 'done';

  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.role) query.set('role', params.role);
  if (params.q) query.set('q', params.q);

  let influencers: AdminInfluencer[] = [];
  let requests: HubRequestItem[] = [];
  let stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    influencers: number;
    vendors: number;
    freelancers: number;
  } | null = null;
  let error: string | null = null;

  try {
    const data = await adminFetch(`/admin/influencers?${query.toString()}`);
    influencers = data.influencers;
    stats = data.stats;
  } catch (err: any) {
    error = err.message;
  }

  /* Messages are a separate concern — a failure here shouldn't
     take out the whole page */
  try {
    const reqData = await adminFetch(
      `/admin/influencer-requests?status=${showDone ? 'closed' : 'new'}`
    );
    requests = reqData.requests || [];
  } catch {
    // Leave the section empty
  }

  return (
    <div className="space-y-5">
      <AutoRefresh />
      <header className="rise">
        <h1 className="t-display">Lasan Hub</h1>
        <p className="t-body mt-1.5">
          {stats
            ? stats.pending > 0
              ? `${stats.pending} waiting for review`
              : `${stats.approved} approved partners`
            : 'Loading…'}
        </p>
      </header>

      {stats && (
        <div
          className="grid grid-cols-2 lg:grid-cols-5 gap-3 rise"
          style={{ animationDelay: '0.05s' }}
        >
          <Stat
            label="Waiting"
            value={stats.pending}
            accent="#E8AE00"
            urgent={stats.pending > 0}
          />
          <Stat label="Approved" value={stats.approved} accent="#12B3A0" />
          <Stat label="Creators" value={stats.influencers} accent="#C13584" />
          <Stat label="Vendors" value={stats.vendors} accent="#0EA97A" />
          <Stat
            label="Freelancers"
            value={stats.freelancers}
            accent="#3A86FF"
          />
        </div>
      )}

      {/* Messages first — someone already approved and waiting on us
          is more urgent than a new application */}
      <div className="rise" style={{ animationDelay: '0.08s' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="t-label">
            {showDone
              ? 'Resolved messages'
              : requests.length > 0
                ? `${requests.length} unanswered message${
                    requests.length === 1 ? '' : 's'
                  }`
                : 'Messages'}
          </h2>

          <Link
            href={showDone ? '/influencers' : '/influencers?messages=done'}
            className="text-[12.5px] font-semibold"
            style={{ color: 'var(--brand)' }}
          >
            {showDone ? '← Back to open' : 'View resolved'}
          </Link>
        </div>

        {requests.length > 0 ? (
          <div className="space-y-2.5">
            {requests.map((r) => (
              <HubRequest key={r.id} request={r} done={showDone} />
            ))}
          </div>
        ) : (
          <div className="card p-6 text-center">
            <p className="t-meta">
              {showDone ? 'Nothing resolved yet' : 'Nothing waiting'}
            </p>
          </div>
        )}
      </div>

      <div className="rise" style={{ animationDelay: '0.12s' }}>
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
          <p className="t-body">No partners yet</p>
          <p className="t-meta mt-1.5">
            They&apos;ll appear here once people start signing up on Lasan Hub
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
