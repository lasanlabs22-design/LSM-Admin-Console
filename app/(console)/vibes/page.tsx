import Link from 'next/link';
import { adminFetch } from '@/lib/api';
import ReelUploader from '@/components/ReelUploader';
import ReelCard from './ReelCard';
import LoadError from '@/components/LoadError';
import StatCard from '@/components/StatCard';
import { errorMessage } from '@/lib/meta';

export type AdminReel = {
  id: string;
  video_url: string;
  thumbnail_url: string | null;
  public_id: string | null;
  caption: string | null;
  username: string;
  source: 'team' | 'user';
  status: 'live' | 'pending' | 'hidden';
  duration: number | null;
  view_count: number;
  sort_order: number;
  created_at: string;
  contact_name: string | null;
  contact_phone: string | null;
  /** Viewers who flagged it in the app. Older backends leave it out. */
  report_count?: number;
};

type ReelStats = {
  total: number;
  live: number;
  hidden: number;
  from_users: number;
  total_views: number;
};

export default async function VibesPage() {
  let reels: AdminReel[] = [];
  let stats: ReelStats | null = null;
  let error: string | null = null;

  try {
    const data = await adminFetch<{ reels: AdminReel[]; stats: ReelStats }>(
      '/admin/reels'
    );
    reels = data.reels || [];
    stats = data.stats;
  } catch (err) {
    error = errorMessage(err);
  }

  const reported = reels
    .filter((r) => (r.report_count ?? 0) > 0)
    .sort((a, b) => (b.report_count ?? 0) - (a.report_count ?? 0));

  return (
    <div className="space-y-6">
      <header className="rise flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="t-display">Lasan Vibes</h1>
          <p className="t-body mt-1.5">
            {stats
              ? `${stats.live} live · ${stats.total_views} views`
              : 'Loading…'}
          </p>
        </div>

        <Link
          href="/vibes/access"
          className="shrink-0 text-[13px] font-semibold px-4 py-2 rounded-xl border transition hover:opacity-80"
          style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}
        >
          Posting access →
        </Link>
      </header>

      {/* Numbers */}
      {stats && (
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 rise"
          style={{ animationDelay: '0.05s' }}
        >
          <StatCard label="Live" value={stats.live} accent="var(--good)" />
          <StatCard
            label="Hidden"
            value={stats.hidden}
            accent="var(--neutral)"
          />
          <StatCard
            label="From users"
            value={stats.from_users}
            accent="var(--accent)"
          />
          <StatCard
            label="Total views"
            value={stats.total_views}
            accent="var(--brand)"
          />
        </div>
      )}

      {/* Uploader */}
      <div className="rise" style={{ animationDelay: '0.1s' }}>
        <ReelUploader />
      </div>

      {error && <LoadError message={error} />}

      {/* Reported by viewers — the team looks at these first. A user's
          reel hides itself after 3 reports; show it again if it's fine. */}
      {reported.length > 0 && (
        <section className="rise" style={{ animationDelay: '0.12s' }}>
          <div className="flex items-center gap-3 mb-1">
            <span className="t-label" style={{ color: 'var(--bad)' }}>
              Needs review
            </span>
            <span
              className="t-num text-[11px]"
              style={{ color: 'var(--text-faint)' }}
            >
              {reported.length}
            </span>
            <span className="flex-1 h-px" style={{ background: 'var(--line)' }} />
          </div>
          <p className="t-meta mb-3">
            Reported in the app. User reels hide automatically after 3
            reports. If one is fine, tap <b>Looks fine</b> — it goes back in
            the app and leaves this list. Otherwise delete it.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {reported.map((reel) => (
              <ReelCard key={reel.id} reel={reel} />
            ))}
          </div>
        </section>
      )}

      {/* The reels */}
      <section className="rise" style={{ animationDelay: '0.15s' }}>
        <div className="flex items-center gap-3 mb-3">
          <span className="t-label">All reels</span>
          <span
            className="t-num text-[11px]"
            style={{ color: 'var(--text-faint)' }}
          >
            {reels.length}
          </span>
          <span className="flex-1 h-px" style={{ background: 'var(--line)' }} />
        </div>

        {reels.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="t-body">No reels yet</p>
            <p className="t-meta mt-1.5">
              Upload one above and it appears in the app straight away
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {reels.map((reel) => (
              <ReelCard key={reel.id} reel={reel} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
