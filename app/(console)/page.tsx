import Link from 'next/link';
import { adminFetch, Stats } from '@/lib/api';
import { STATUS_META, TYPE_META, errorMessage } from '@/lib/meta';
import DonutChart from '@/components/DonutChart';
import AutoRefresh from '@/components/AutoRefresh';
import LoadError from '@/components/LoadError';
import StatCard from '@/components/StatCard';

export default async function DashboardPage() {
  let stats: Stats | null = null;
  let error: string | null = null;

  try {
    stats = await adminFetch<Stats>('/admin/stats');
  } catch (err) {
    error = errorMessage(err);
  }

  if (error || !stats) {
    return (
      <div className="space-y-6">
        <AutoRefresh />
        <header className="rise">
          <h1 className="t-display">Dashboard</h1>
        </header>
        <LoadError
          title="Could not load the dashboard"
          message={error || 'No data came back'}
        />
      </div>
    );
  }

  const r = stats.requests;
  const open = r.new + r.contacted + r.in_progress;

  const statusSlices = [
    { label: 'New', value: r.new, color: STATUS_META.new.color },
    {
      label: 'Contacted',
      value: r.contacted,
      color: STATUS_META.contacted.color,
    },
    {
      label: 'In Progress',
      value: r.in_progress,
      color: STATUS_META.in_progress.color,
    },
    { label: 'Closed', value: r.closed, color: STATUS_META.closed.color },
  ].filter((s) => s.value > 0);

  const typeSlices = stats.byType.map((t) => ({
    label: TYPE_META[t.type]?.label || t.type,
    value: t.count,
    color: TYPE_META[t.type]?.color || 'var(--neutral)',
  }));

  return (
    <div className="space-y-9">
      <AutoRefresh />
      {/* Heading */}
      <header className="rise">
        <h1 className="t-display">Dashboard</h1>
        <p className="t-body mt-1.5">
          {r.this_week} new request{r.this_week === 1 ? '' : 's'} this week
          {open > 0 && (
            <>
              {' · '}
              <span style={{ color: 'var(--brand)' }}>{open} still open</span>
            </>
          )}
        </p>
      </header>

      {/* Numbers */}
      <section
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 rise"
        style={{ animationDelay: '0.05s' }}
      >
        <StatCard
          label="Needs attention"
          value={r.new}
          accent={STATUS_META.new.color}
          href="/requests?status=new"
          urgent={r.new > 0}
        />
        <StatCard
          label="Working on"
          value={r.contacted + r.in_progress}
          accent={STATUS_META.in_progress.color}
          href="/requests?status=in_progress"
        />
        <StatCard
          label="Completed"
          value={r.closed}
          accent={STATUS_META.closed.color}
          href="/requests?status=closed"
        />
        <StatCard
          label="Users"
          value={stats.contacts.total}
          accent="var(--brand)"
          href="/contacts"
          sub={
            stats.contacts.this_week > 0
              ? `+${stats.contacts.this_week} this week`
              : undefined
          }
        />
      </section>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <section className="card p-6 rise" style={{ animationDelay: '0.1s' }}>
          <div className="t-label mb-5">Status breakdown</div>
          {statusSlices.length > 0 ? (
            <DonutChart data={statusSlices} />
          ) : (
            <Blank text="No requests yet" />
          )}
        </section>

        <section className="card p-6 rise" style={{ animationDelay: '0.15s' }}>
          <div className="t-label mb-5">By request type</div>
          {typeSlices.length > 0 ? (
            <DonutChart data={typeSlices} />
          ) : (
            <Blank text="No requests yet" />
          )}
        </section>
      </div>

      {/* Team workload */}
      <section className="rise" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="t-label">Open work by person</h2>
          {stats.workload.length > 0 && (
            <Link
              href="/requests?assignedTo=unassigned"
              className="text-[12px] font-medium"
              style={{ color: 'var(--brand)' }}
            >
              See unassigned →
            </Link>
          )}
        </div>

        {stats.workload.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="t-body">Nothing assigned yet</p>
            <Link
              href="/requests?status=new"
              className="inline-block mt-3 text-[13px] font-semibold"
              style={{ color: 'var(--brand)' }}
            >
              Assign the new requests →
            </Link>
          </div>
        ) : (
          <div className="card divide-line overflow-hidden">
            {stats.workload.map((w) => {
              const share = open ? (w.count / open) * 100 : 0;

              return (
                <Link
                  key={w.assigned_to}
                  href={`/requests?assignedTo=${encodeURIComponent(w.assigned_to)}`}
                  className="relative flex items-center gap-3.5 px-4 py-3.5 transition card-hover"
                >
                  {/* Quiet bar showing relative load */}
                  <span
                    className="absolute inset-y-0 left-0 pointer-events-none"
                    style={{
                      width: `${share}%`,
                      background: 'var(--brand-soft)',
                    }}
                  />

                  <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-[var(--brand)] to-[var(--brand-2)] flex items-center justify-center text-[13px] font-semibold text-white shrink-0">
                    {w.assigned_to.charAt(0).toUpperCase()}
                  </div>

                  <span className="relative text-[14px] font-medium flex-1">
                    {w.assigned_to}
                  </span>

                  <span className="relative t-num text-[15px] font-semibold">
                    {w.count}
                  </span>
                  <span
                    className="relative text-[11px]"
                    style={{ color: 'var(--text-faint)' }}
                  >
                    open
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

/* ---------------- Pieces ---------------- */

function Blank({ text }: { text: string }) {
  return (
    <div className="h-[190px] flex items-center justify-center">
      <p className="t-body">{text}</p>
    </div>
  );
}
