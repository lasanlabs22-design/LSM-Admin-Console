import Link from 'next/link';
import { adminFetch, Stats } from '@/lib/api';
import { STATUS_META, TYPE_META } from '@/lib/meta';

export default async function DashboardPage() {
  let stats: Stats | null = null;
  let error: string | null = null;

  try {
    stats = await adminFetch('/admin/stats');
  } catch (err: any) {
    error = err.message;
  }

  if (error || !stats) {
    return (
      <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-5">
        <p className="text-red-300 font-semibold mb-1">
          Could not load the dashboard
        </p>
        <p className="text-red-300/70 text-sm">{error}</p>
        <p className="text-white/40 text-sm mt-3">
          Is the backend running? It should be at{' '}
          <code className="text-white/60">localhost:3000</code>.
        </p>
      </div>
    );
  }

  const r = stats.requests;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">
          {r.this_week} request{r.this_week === 1 ? '' : 's'} in the last 7 days
        </p>
      </div>

      {/* Headline numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Needs attention"
          value={r.new}
          accent="#3A86FF"
          href="/requests?status=new"
          highlight
        />
        <StatCard
          label="In progress"
          value={r.contacted + r.in_progress}
          accent="#E8AE00"
          href="/requests?status=in_progress"
        />
        <StatCard
          label="Closed"
          value={r.closed}
          accent="#8A8F98"
          href="/requests?status=closed"
        />
        <StatCard
          label="Users"
          value={stats.contacts.total}
          accent="#FF6B35"
          href="/contacts"
          sub={`+${stats.contacts.this_week} this week`}
        />
      </div>

      {/* Breakdown by type */}
      <section>
        <SectionTitle>By request type</SectionTitle>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.byType.map((t) => {
            const meta = TYPE_META[t.type] || {
              label: t.type,
              color: '#8A8F98',
              emoji: '📄',
            };

            return (
              <Link
                key={t.type}
                href={`/requests?type=${t.type}`}
                className="bg-white/[0.04] border border-white/10 rounded-xl p-4 hover:border-white/25 transition"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span>{meta.emoji}</span>
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: meta.color }}
                  >
                    {meta.label}
                  </span>
                </div>
                <div className="text-2xl font-bold">{t.count}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Who's carrying what */}
      <section>
        <SectionTitle>Open work by person</SectionTitle>

        {stats.workload.length === 0 ? (
          <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6 text-center">
            <p className="text-white/50 text-sm">Nothing assigned yet</p>
            <Link
              href="/requests?status=new"
              className="inline-block mt-3 text-[#FF6B35] text-sm font-semibold"
            >
              Assign the new requests →
            </Link>
          </div>
        ) : (
          <div className="bg-white/[0.04] border border-white/10 rounded-xl divide-y divide-white/[0.07]">
            {stats.workload.map((w) => (
              <Link
                key={w.assigned_to}
                href={`/requests?assignedTo=${encodeURIComponent(w.assigned_to)}`}
                className="flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF8A3D] to-[#F2542D] flex items-center justify-center text-sm font-bold">
                    {w.assigned_to.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold">{w.assigned_to}</span>
                </div>
                <span className="text-white/50 text-sm">
                  {w.count} open
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Status spread */}
      <section>
        <SectionTitle>Status</SectionTitle>

        <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 space-y-3">
          {[
            ['new', r.new],
            ['contacted', r.contacted],
            ['in_progress', r.in_progress],
            ['closed', r.closed],
          ].map(([key, count]) => {
            const meta = STATUS_META[key as string];
            const pct = r.total ? ((count as number) / r.total) * 100 : 0;

            return (
              <div key={key as string}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span style={{ color: meta.color }} className="font-semibold">
                    {meta.label}
                  </span>
                  <span className="text-white/50">{count}</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: meta.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-white/40 text-xs font-bold uppercase tracking-[0.15em] mb-3">
      {children}
    </h2>
  );
}

function StatCard({
  label,
  value,
  accent,
  href,
  sub,
  highlight,
}: {
  label: string;
  value: number;
  accent: string;
  href: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className="relative bg-white/[0.04] border rounded-xl p-4 overflow-hidden hover:border-white/25 transition"
      style={{
        borderColor: highlight && value > 0 ? `${accent}55` : 'rgba(255,255,255,0.1)',
      }}
    >
      <div
        className="absolute -top-8 -right-8 w-20 h-20 rounded-full opacity-15"
        style={{ background: accent }}
      />
      <div className="relative">
        <div className="text-white/45 text-xs font-semibold uppercase tracking-wider">
          {label}
        </div>
        <div className="text-3xl font-bold mt-2" style={{ color: accent }}>
          {value}
        </div>
        {sub && <div className="text-white/35 text-xs mt-1">{sub}</div>}
      </div>
    </Link>
  );
}