import Link from 'next/link';
import { adminFetch } from '@/lib/api';
import InfluencerCard from './InfluencerCard';
import PartnerRow from './PartnerRow';
import { SORTS, sortPartners, type SortKey } from './sort';
import StatusFilter from './StatusFilter';
import HubRequest, { HubRequestItem } from './HubRequest';
import AutoRefresh from '@/components/AutoRefresh';
import { errorMessage } from '@/lib/meta';
import LoadError from '@/components/LoadError';
import StatCard from '@/components/StatCard';
import Pagination from '@/components/Pagination';

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

type HubStats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  influencers: number;
  vendors: number;
  freelancers: number;
};

/* ---------- Finding people in a long list ---------- */

const PAGE_SIZE = 24;

export default async function InfluencersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  /* Two views of the message queue: what needs answering, and what's done */
  const showDone = params.messages === 'done';

  const sort: SortKey =
    params.sort && params.sort in SORTS ? (params.sort as SortKey) : 'review';
  const view = params.view === 'list' ? 'list' : 'cards';
  const hasFilters = !!(params.status || params.role || params.q);

  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.role) query.set('role', params.role);
  if (params.q) query.set('q', params.q);

  let influencers: AdminInfluencer[] = [];
  let requests: HubRequestItem[] = [];
  let stats: HubStats | null = null;
  let error: string | null = null;

  try {
    const data = await adminFetch<{
      influencers: AdminInfluencer[];
      stats: HubStats;
    }>(`/admin/influencers?${query.toString()}`);
    influencers = data.influencers || [];
    stats = data.stats;
  } catch (err) {
    error = errorMessage(err);
  }

  const sorted = sortPartners(influencers, sort);
  const total = sorted.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(params.page) || 1), pages);
  const shown = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Page links keep every filter and view choice, and nothing else
  const pageQuery = new URLSearchParams();
  for (const key of ['status', 'role', 'q', 'sort', 'view', 'messages']) {
    if (params[key]) pageQuery.set(key, params[key]!);
  }

  /* Messages are a separate concern — a failure here shouldn't
     take out the whole page */
  try {
    const reqData = await adminFetch<{ requests: HubRequestItem[] }>(
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
          <StatCard
            label="Waiting"
            href="/influencers?status=pending"
            value={stats.pending}
            accent="var(--warn)"
            urgent={stats.pending > 0}
          />
          <StatCard
            label="Approved"
            href="/influencers?status=approved"
            value={stats.approved}
            accent="var(--good)"
          />
          <StatCard
            label="Creators"
            href="/influencers?role=influencer"
            value={stats.influencers}
            accent="var(--role-creator)"
          />
          <StatCard
            label="Vendors"
            href="/influencers?role=vendor"
            value={stats.vendors}
            accent="var(--role-vendor)"
          />
          <StatCard
            label="Freelancers"
            href="/influencers?role=freelancer"
            value={stats.freelancers}
            accent="var(--role-freelancer)"
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
        <StatusFilter current={params} sort={sort} view={view} />
      </div>

      {error && <LoadError message={error} />}

      {!error && total === 0 && (
        <div className="card p-12 text-center">
          {hasFilters ? (
            <>
              <p className="t-body">Nobody matches these filters</p>
              <Link
                href="/influencers"
                className="inline-block mt-3 text-[13px] font-semibold"
                style={{ color: 'var(--brand)' }}
              >
                Clear filters
              </Link>
            </>
          ) : (
            <>
              <p className="t-body">No partners yet</p>
              <p className="t-meta mt-1.5">
                They&apos;ll appear here once people start signing up on Lasan
                Hub
              </p>
            </>
          )}
        </div>
      )}

      {total > 0 && (
        <p className="t-meta" aria-live="polite">
          Showing {(page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString('en-IN')}
        </p>
      )}

      {view === 'list' ? (
        shown.length > 0 && (
          <div className="card overflow-hidden divide-line">
            {shown.map((inf) => (
              <PartnerRow key={inf.id} partner={inf} />
            ))}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {shown.map((inf, i) => (
            <InfluencerCard key={inf.id} influencer={inf} index={i} />
          ))}
        </div>
      )}

      <Pagination
        path="/influencers"
        query={pageQuery}
        page={page}
        pages={pages}
      />
    </div>
  );
}
