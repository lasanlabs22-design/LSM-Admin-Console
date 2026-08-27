import Link from 'next/link';
import { adminFetch, AdminRequest } from '@/lib/api';
import { STATUS_META, TYPE_META, timeAgo } from '@/lib/meta';
import Filters from './Filters';

/** Groups requests under Today / Yesterday / This week / Earlier */
function groupByDay(requests: AdminRequest[]) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const groups: { label: string; items: AdminRequest[] }[] = [];

  const bucketFor = (iso: string) => {
    const d = new Date(iso);
    const days = Math.floor(
      (startOfToday.getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) /
        86400000
    );

    if (days <= 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return 'This week';
    if (days < 30) return 'This month';
    return 'Earlier';
  };

  requests.forEach((r) => {
    const label = bucketFor(r.created_at);
    const existing = groups.find((g) => g.label === label);
    if (existing) existing.items.push(r);
    else groups.push({ label, items: [r] });
  });

  return groups;
}

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.type) query.set('type', params.type);
  if (params.assignedTo) query.set('assignedTo', params.assignedTo);
  if (params.q) query.set('q', params.q);
  if (params.page) query.set('page', params.page);

  let data: {
    requests: AdminRequest[];
    total: number;
    page: number;
    pages: number;
  } | null = null;
  let error: string | null = null;

  try {
    data = await adminFetch(`/admin/requests?${query.toString()}`);
  } catch (err: any) {
    error = err.message;
  }

  const groups = data ? groupByDay(data.requests) : [];

  return (
    <div className="space-y-5">
      <header className="rise">
        <h1 className="t-display">Requests</h1>
        <p className="t-body mt-1.5">
          {data ? `${data.total} total` : 'Loading…'}
        </p>
      </header>

      <div className="rise" style={{ animationDelay: '0.05s' }}>
        <Filters current={params} />
      </div>

      {error && (
        <div className="card p-4" style={{ borderColor: 'rgba(217,48,37,0.3)' }}>
          <p className="text-[13px]" style={{ color: '#EF4444' }}>
            {error}
          </p>
        </div>
      )}

      {data && data.requests.length === 0 && (
        <div className="card p-12 text-center">
          <p className="t-body">Nothing matches those filters</p>
          <Link
            href="/requests"
            className="inline-block mt-3 text-[13px] font-semibold"
            style={{ color: 'var(--brand)' }}
          >
            Clear filters
          </Link>
        </div>
      )}

      {/* Grouped list */}
      <div className="space-y-6">
        {groups.map((group, gi) => (
          <section
            key={group.label}
            className="rise"
            style={{ animationDelay: `${0.1 + gi * 0.04}s` }}
          >
            <div className="flex items-center gap-3 mb-2.5">
              <span className="t-label">{group.label}</span>
              <span
                className="t-num text-[11px]"
                style={{ color: 'var(--text-faint)' }}
              >
                {group.items.length}
              </span>
              <span
                className="flex-1 h-px"
                style={{ background: 'var(--line)' }}
              />
            </div>

            <div className="space-y-2">
              {group.items.map((r) => (
                <RequestCard key={r.id} request={r} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Paging */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-3">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => {
            const q = new URLSearchParams(query);
            q.set('page', String(p));
            const isCurrent = p === data.page;

            return (
              <Link
                key={p}
                href={`/requests?${q.toString()}`}
                className="w-9 h-9 rounded-lg flex items-center justify-center t-num text-[13px] font-semibold transition"
                style={
                  isCurrent
                    ? { background: 'var(--brand)', color: '#fff' }
                    : {
                        background: 'var(--surface)',
                        border: '1px solid var(--line)',
                        color: 'var(--text-faint)',
                      }
                }
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RequestCard({ request: r }: { request: AdminRequest }) {
  const status = STATUS_META[r.status] || STATUS_META.new;
  const type = TYPE_META[r.type] || {
    label: r.type,
    color: '#8A8F98',
    emoji: '📄',
  };

  // Closed requests recede; new ones stand out
  const isClosed = r.status === 'closed';
  const isNew = r.status === 'new';

  return (
    <Link
      href={`/requests/${r.id}`}
      className="card card-hover card-lift block p-4 relative overflow-hidden"
      style={{
        opacity: isClosed ? 0.62 : 1,
        borderColor: isNew ? `${status.color}33` : 'var(--line)',
      }}
    >
      {/* Left edge stripe in the type's colour */}
      <span
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: type.color, opacity: isClosed ? 0.4 : 0.8 }}
      />

      <div className="pl-2">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] font-semibold uppercase px-2 py-1 rounded-md"
              style={{
                color: type.color,
                background: `${type.color}18`,
                letterSpacing: '0.06em',
              }}
            >
              {type.emoji} {type.label}
            </span>

            {r.assigned_to && (
              <span
                className="text-[10.5px] font-medium px-2 py-1 rounded-md"
                style={{
                  color: 'var(--text-muted)',
                  background: 'var(--surface-hover)',
                }}
              >
                {r.assigned_to}
              </span>
            )}
          </div>

          <span
            className="shrink-0 flex items-center gap-1.5 text-[10px] font-semibold uppercase px-2 py-1 rounded-md"
            style={{
              color: status.color,
              background: status.bg,
              letterSpacing: '0.06em',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: status.color }}
            />
            {status.label}
          </span>
        </div>

        <h3 className="t-title">{r.title || r.name}</h3>

        {r.description && (
          <p
            className="text-[13px] mt-1 line-clamp-2"
            style={{ color: 'var(--text-muted)' }}
          >
            {r.description}
          </p>
        )}

        <div
          className="flex items-center gap-3 mt-3 pt-3 text-[12px] border-t"
          style={{ borderColor: 'var(--line)', color: 'var(--text-faint)' }}
        >
          <span className="font-medium" style={{ color: 'var(--text-muted)' }}>
            {r.name}
          </span>
          <span className="t-num">{r.phone}</span>
          {r.company_name && (
            <span className="hidden sm:inline truncate">{r.company_name}</span>
          )}
          <span className="ml-auto shrink-0">{timeAgo(r.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}