import Link from 'next/link';
import { adminFetch, AdminRequest } from '@/lib/api';
import {
  STATUS_META,
  TYPE_META,
  errorMessage,
  timeAgo,
  tint,
} from '@/lib/meta';
import LoadError from '@/components/LoadError';
import Pagination from '@/components/Pagination';
import Filters from './Filters';
import AutoRefresh from '@/components/AutoRefresh';

type RequestList = {
  requests: AdminRequest[];
  total: number;
  page: number;
  pages: number;
};

/** Groups requests under Today / Yesterday / This week / Earlier */
function groupByDay(requests: AdminRequest[]) {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const groups: { label: string; items: AdminRequest[] }[] = [];

  const bucketFor = (iso: string) => {
    const d = new Date(iso);
    const days = Math.floor(
      (startOfToday.getTime() -
        new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) /
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

  let data: RequestList | null = null;
  let error: string | null = null;

  try {
    data = await adminFetch<RequestList>(`/admin/requests?${query.toString()}`);
  } catch (err) {
    error = errorMessage(err);
  }

  const groups = data ? groupByDay(data.requests) : [];

  return (
    <div className="space-y-5">
      <AutoRefresh />

      <header className="rise">
        <h1 className="t-display">Requests</h1>
        <p className="t-body mt-1.5">
          {data ? `${data.total} total` : 'Loading…'}
        </p>
      </header>

      <div className="rise" style={{ animationDelay: '0.05s' }}>
        <Filters current={params} />
      </div>

      {error && <LoadError message={error} />}

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
      {data && (
        <Pagination
          path="/requests"
          query={query}
          page={data.page}
          pages={data.pages}
        />
      )}
    </div>
  );
}

function RequestCard({ request: r }: { request: AdminRequest }) {
  const status = STATUS_META[r.status] || STATUS_META.new;
  const type = TYPE_META[r.type] || {
    label: r.type,
    color: 'var(--neutral)',
    emoji: '📄',
  };

  /** Who outside the team is doing this, if anyone */
  const partner = r.assignment;

  // Closed requests recede; new ones stand out
  const isClosed = r.status === 'closed';
  const isNew = r.status === 'new';

  return (
    <Link
      href={`/requests/${r.id}`}
      className="card card-hover card-lift block p-4 relative overflow-hidden"
      style={{
        opacity: isClosed ? 0.62 : 1,
        borderColor: isNew ? tint(status.color, 20) : 'var(--line)',
      }}
    >
      {/* Left edge stripe in the type's colour */}
      <span
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: type.color, opacity: isClosed ? 0.4 : 0.8 }}
      />

      <div className="pl-2">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span
              className="text-[10px] font-semibold uppercase px-2 py-1 rounded-md"
              style={{
                color: type.color,
                background: tint(type.color, 9),
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

            {/* Out with a partner — so the list says so without a click */}
            {partner && (
              <span
                className="text-[10.5px] font-medium px-2 py-1 rounded-md"
                style={{
                  color: 'var(--role-vendor)',
                  background: 'var(--good-soft)',
                }}
              >
                → {partner.company_name || partner.partner_name}
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

        <h3 className="t-title break-words">{r.title || r.name}</h3>

        {r.description && (
          <p
            className="text-[13px] mt-1 line-clamp-2"
            style={{ color: 'var(--text-muted)' }}
          >
            {r.description}
          </p>
        )}

        <div
          className="flex items-center gap-x-3 gap-y-1 mt-3 pt-3 text-[12px] border-t min-w-0"
          style={{ borderColor: 'var(--line)', color: 'var(--text-faint)' }}
        >
          <span
            className="font-medium truncate min-w-0"
            style={{ color: 'var(--text-muted)' }}
          >
            {r.name}
          </span>
          <span className="t-num shrink-0 hidden min-[380px]:inline">
            {r.phone}
          </span>
          {r.company_name && (
            <span className="hidden sm:inline truncate min-w-0">
              {r.company_name}
            </span>
          )}
          <span className="ml-auto shrink-0">{timeAgo(r.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}
