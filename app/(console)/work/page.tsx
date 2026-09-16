import Link from 'next/link';
import { adminFetch } from '@/lib/api';

const STATUS: Record<string, { label: string; colour: string; note: string }> =
  {
    offered: {
      label: 'Waiting on them',
      colour: '#E8AE00',
      note: "Sent — they haven't answered yet",
    },
    accepted: {
      label: 'Accepted',
      colour: '#12B3A0',
      note: "They've taken it on but not started",
    },
    in_progress: {
      label: 'In progress',
      colour: '#5F259F',
      note: 'Work is underway',
    },
    completed: {
      label: 'Completed',
      colour: '#12B3A0',
      note: "They say it's done",
    },
  };

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const filter = params.status;

  let work: any[] = [];
  let stats: any = null;
  let error: string | null = null;

  try {
    const data = await adminFetch(
      `/admin/work${filter ? `?status=${filter}` : ''}`
    );
    work = data.work;
    stats = data.stats;
  } catch (err: any) {
    error = err.message;
  }

  return (
    <div className="space-y-5">
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
          <Stat
            label="Awaiting reply"
            value={stats.offered}
            accent="#E8AE00"
            urgent={stats.offered > 0}
            href="/work?status=offered"
          />
          <Stat
            label="Accepted"
            value={stats.accepted}
            accent="#12B3A0"
            href="/work?status=accepted"
          />
          <Stat
            label="In progress"
            value={stats.in_progress}
            accent="#5F259F"
            href="/work?status=in_progress"
          />
          <Stat
            label="Completed"
            value={stats.completed}
            accent="#8A8F98"
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
          const s = STATUS[w.status] || STATUS.offered;

          return (
            <div
              key={w.id}
              className="card p-4 rise"
              style={{
                animationDelay: `${0.04 * Math.min(i, 8)}s`,
                borderColor:
                  w.status === 'offered'
                    ? 'rgba(232,174,0,0.3)'
                    : 'var(--line)',
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
                      background:
                        w.partner_role === 'vendor' ? '#0EA97A' : '#3A86FF',
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

function Stat({
  label,
  value,
  accent,
  urgent,
  href,
}: {
  label: string;
  value: number;
  accent: string;
  urgent?: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="card card-hover p-4 relative overflow-hidden block"
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
    </Link>
  );
}
