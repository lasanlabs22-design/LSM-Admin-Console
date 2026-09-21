import Link from 'next/link';
import { adminFetch } from '@/lib/api';
import AutoRefresh from '@/components/AutoRefresh';
import LoadError from '@/components/LoadError';
import StatCard from '@/components/StatCard';
import { WORK_STATUS, errorMessage, roleMeta, timeAgo } from '@/lib/meta';
import type { WorkItem, WorkStats } from '@/lib/types';

export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const filter = params.status;

  let work: WorkItem[] = [];
  let stats: WorkStats | null = null;
  let error: string | null = null;

  try {
    const data = await adminFetch<{ work: WorkItem[]; stats: WorkStats }>(
      `/admin/work${filter ? `?status=${encodeURIComponent(filter)}` : ''}`
    );
    work = data.work || [];
    stats = data.stats;
  } catch (err) {
    error = errorMessage(err);
  }

  return (
    <div className="space-y-5">
      <AutoRefresh />
      <header className="rise">
        <h1 className="t-display">Work in progress</h1>
        <p className="t-body mt-1.5">
          {stats
            ? `${stats.offered + stats.accepted + stats.in_progress} jobs out with partners`
            : 'Loading…'}
        </p>
      </header>

      {stats && (
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 rise"
          style={{ animationDelay: '0.05s' }}
        >
          <StatCard
            label="Awaiting reply"
            value={stats.offered}
            accent="var(--warn)"
            urgent={stats.offered > 0}
            href="/work?status=offered"
          />
          <StatCard
            label="Accepted"
            value={stats.accepted}
            accent="var(--good)"
            href="/work?status=accepted"
          />
          <StatCard
            label="In progress"
            value={stats.in_progress}
            accent="var(--brand)"
            href="/work?status=in_progress"
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            accent="var(--neutral)"
            href="/work?status=completed"
          />
        </div>
      )}

      {filter && (
        <Link
          href="/work"
          className="inline-block text-[13px] font-semibold"
          style={{ color: 'var(--brand)' }}
        >
          ← Show everything open
        </Link>
      )}

      {error && <LoadError message={error} />}

      {!error && work.length === 0 && (
        <div className="card p-12 text-center">
          <p className="t-body">Nothing out with partners</p>
          <p className="t-meta mt-1.5">
            Open a request and choose someone to send it to
          </p>
        </div>
      )}

      <div className="space-y-2.5">
        {work.map((w, i) => {
          const s = WORK_STATUS[w.status] || WORK_STATUS.offered;

          return (
            <div
              key={w.id}
              className="card p-4 rise"
              style={{
                animationDelay: `${0.04 * Math.min(i, 8)}s`,
                borderColor:
                  w.status === 'offered' ? 'var(--warn-line)' : 'var(--line)',
              }}
            >
              {/* What the job is */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/requests/${w.request_id}`}
                    className="t-title hover:opacity-70 transition"
                  >
                    {w.title || w.details?.service || 'Request'}
                  </Link>

                  <div
                    className="flex flex-wrap gap-x-3 text-[12.5px] mt-1"
                    style={{ color: 'var(--text-faint)' }}
                  >
                    <span>For {w.customer_name}</span>
                    {w.customer_city && <span>{w.customer_city}</span>}
                    <a
                      href={`tel:+91${w.customer_phone}`}
                      className="t-num font-semibold"
                      style={{ color: 'var(--brand)' }}
                    >
                      {w.customer_phone}
                    </a>
                  </div>
                </div>

                <span
                  className="shrink-0 flex items-center gap-1.5 text-[12px] font-semibold"
                  style={{ color: s.colour }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: s.colour }}
                  />
                  {s.label}
                </span>
              </div>

              {/* Who has it */}
              <div
                className="flex items-center gap-3 mt-3 pt-3 border-t"
                style={{ borderColor: 'var(--line)' }}
              >
                {w.partner_photo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={w.partner_photo}
                    alt={w.partner_name}
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div
                    className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-semibold text-white text-[12px]"
                    style={{
                      background: roleMeta(w.partner_role).color,
                    }}
                  >
                    {w.partner_name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-semibold truncate">
                    {w.company_name || w.partner_name}
                  </div>
                  <div className="t-meta" style={{ fontSize: 11.5 }}>
                    {s.note} · {timeAgo(w.assigned_at)}
                  </div>
                </div>

                <a
                  href={`tel:+91${w.partner_phone}`}
                  className="t-num text-[12.5px] font-semibold shrink-0"
                  style={{ color: 'var(--brand)' }}
                >
                  {w.partner_phone}
                </a>
              </div>

              {w.verdict && (
                <div
                  className="rounded-lg px-3 py-2 mt-3 text-[12.5px]"
                  style={{ background: 'var(--surface-hover)' }}
                >
                  Client said <strong>{w.verdict}</strong>
                  {w.comment && ` — ${w.comment}`}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
