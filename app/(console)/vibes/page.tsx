import { adminFetch } from '@/lib/api';
import { timeAgo } from '@/lib/meta';
import ReelUploader from '@/components/ReelUploader';
import ReelCard from './ReelCard';

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
    const data = await adminFetch('/admin/reels');
    reels = data.reels;
    stats = data.stats;
  } catch (err: any) {
    error = err.message;
  }

  return (
    <div className="space-y-6">
      <header className="rise">
        <h1 className="t-display">Lasan Vibes</h1>
        <p className="t-body mt-1.5">
          {stats
            ? `${stats.live} live · ${stats.total_views} views`
            : 'Loading…'}
        </p>
      </header>

      {/* Numbers */}
      {stats && (
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 rise"
          style={{ animationDelay: '0.05s' }}
        >
          <Stat label="Live" value={stats.live} accent="#12B3A0" />
          <Stat label="Hidden" value={stats.hidden} accent="#8A8F98" />
          <Stat label="From users" value={stats.from_users} accent="#7B2FF7" />
          <Stat
            label="Total views"
            value={stats.total_views}
            accent="#FF6B35"
          />
        </div>
      )}

      {/* Uploader */}
      <div className="rise" style={{ animationDelay: '0.1s' }}>
        <ReelUploader />
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

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="card p-4 relative overflow-hidden">
      <span
        className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-[0.13]"
        style={{ background: accent }}
      />
      <div className="relative">
        <span className="t-label">{label}</span>
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
