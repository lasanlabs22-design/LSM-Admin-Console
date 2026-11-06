import { adminFetch } from '@/lib/api';
import LoadError from '@/components/LoadError';
import StatCard from '@/components/StatCard';
import { errorMessage } from '@/lib/meta';
import AddHoarding from './AddHoarding';
import HoardingCard from './HoardingCard';
import type { AdminHoarding, HoardingStats } from './types';

export default async function HoardingsPage() {
  let hoardings: AdminHoarding[] = [];
  let stats: HoardingStats | null = null;
  let error: string | null = null;

  try {
    const data = await adminFetch<{
      hoardings: AdminHoarding[];
      stats: HoardingStats;
    }>('/admin/hoardings');
    hoardings = data.hoardings || [];
    stats = data.stats;
  } catch (err) {
    error = errorMessage(err);
  }

  // Grouped by city, the way the app offers them
  const byCity = new Map<string, AdminHoarding[]>();
  for (const h of hoardings) {
    if (!byCity.has(h.city)) byCity.set(h.city, []);
    byCity.get(h.city)!.push(h);
  }

  return (
    <div className="space-y-6">
      <header className="rise flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="t-display">Hoardings</h1>
          <p className="t-body mt-1.5">
            What customers see under Offline Marketing → Hoardings in the
            app. Changes show there straight away.
          </p>
        </div>
        <AddHoarding />
      </header>

      {stats && (
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 rise"
          style={{ animationDelay: '0.05s' }}
        >
          <StatCard label="Live in app" value={stats.live} accent="var(--good)" />
          <StatCard label="Available now" value={stats.available} accent="var(--brand)" />
          <StatCard label="Cities" value={stats.cities} accent="var(--accent)" />
          <StatCard label="All listings" value={stats.total} accent="var(--neutral)" />
        </div>
      )}

      {error && <LoadError message={error} />}

      {!error && hoardings.length === 0 && (
        <div className="card p-12 text-center rise">
          <p className="t-body">No hoardings yet</p>
          <p className="t-meta mt-1.5">
            Add one with <b>+ Add hoarding</b> and it appears in the app
          </p>
        </div>
      )}

      {[...byCity.entries()].map(([city, list], i) => (
        <section key={city} className="rise" style={{ animationDelay: `${0.1 + i * 0.03}s` }}>
          <div className="flex items-center gap-3 mb-3">
            <span className="t-label">{city}</span>
            <span className="t-num text-[11px]" style={{ color: 'var(--text-faint)' }}>
              {list.length}
            </span>
            <span className="flex-1 h-px" style={{ background: 'var(--line)' }} />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {list.map((h) => (
              <HoardingCard key={h.id} hoarding={h} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
