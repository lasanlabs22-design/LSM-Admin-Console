import Link from 'next/link';
import { adminFetch, AdminRequest } from '@/lib/api';
import { STATUS_META, TYPE_META, timeAgo } from '@/lib/meta';
import Filters from './Filters';

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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Requests</h1>
        <p className="text-white/40 text-sm mt-1">
          {data ? `${data.total} total` : 'Loading…'}
        </p>
      </div>

      <Filters current={params} />

      {error && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {data && data.requests.length === 0 && (
        <div className="bg-white/[0.04] border border-white/10 rounded-xl p-10 text-center">
          <p className="text-white/50">Nothing matches those filters</p>
          <Link
            href="/requests"
            className="inline-block mt-3 text-[#FF6B35] text-sm font-semibold"
          >
            Clear filters
          </Link>
        </div>
      )}

      <div className="space-y-2.5">
        {data?.requests.map((r) => {
          const status = STATUS_META[r.status] || STATUS_META.new;
          const type = TYPE_META[r.type] || {
            label: r.type,
            color: '#8A8F98',
            emoji: '📄',
          };

          return (
            <Link
              key={r.id}
              href={`/requests/${r.id}`}
              className="block bg-white/[0.04] border border-white/10 rounded-xl p-4 hover:border-white/25 transition"
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded"
                    style={{
                      color: type.color,
                      background: `${type.color}1A`,
                    }}
                  >
                    {type.emoji} {type.label}
                  </span>

                  {r.assigned_to && (
                    <span className="text-[10px] font-semibold text-white/50 bg-white/[0.07] px-2 py-1 rounded">
                      {r.assigned_to}
                    </span>
                  )}
                </div>

                <span
                  className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded"
                  style={{ color: status.color, background: status.bg }}
                >
                  {status.label}
                </span>
              </div>

              <h3 className="font-bold text-[15px] leading-snug">
                {r.title || r.name}
              </h3>

              {r.description && (
                <p className="text-white/45 text-[13px] mt-1 line-clamp-2">
                  {r.description}
                </p>
              )}

              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/[0.07] text-xs text-white/40">
                <span className="font-semibold text-white/60">{r.name}</span>
                <span>{r.phone}</span>
                {r.company_name && (
                  <span className="hidden sm:inline">{r.company_name}</span>
                )}
                <span className="ml-auto">{timeAgo(r.created_at)}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Paging */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => {
            const q = new URLSearchParams(query);
            q.set('page', String(p));

            return (
              <Link
                key={p}
                href={`/requests?${q.toString()}`}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold transition ${
                  p === data.page
                    ? 'bg-[#FF6B35] text-white'
                    : 'bg-white/[0.06] text-white/50 hover:text-white'
                }`}
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