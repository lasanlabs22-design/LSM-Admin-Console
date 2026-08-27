import Link from 'next/link';
import { adminFetch, AdminContact } from '@/lib/api';
import { timeAgo } from '@/lib/meta';

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const query = new URLSearchParams();
  if (params.q) query.set('q', params.q);
  if (params.page) query.set('page', params.page);

  let data: {
    contacts: AdminContact[];
    total: number;
    page: number;
    pages: number;
  } | null = null;
  let error: string | null = null;

  try {
    data = await adminFetch(`/admin/contacts?${query.toString()}`);
  } catch (err: any) {
    error = err.message;
  }

  return (
    <div className="space-y-5">
      <header className="rise">
        <h1 className="t-display">Users</h1>
        <p className="t-body mt-1.5">
          {data ? `${data.total} registered` : 'Loading…'}
        </p>
      </header>

      {error && (
        <div className="card p-4" style={{ borderColor: 'rgba(217,48,37,0.3)' }}>
          <p className="text-[13px]" style={{ color: '#EF4444' }}>
            {error}
          </p>
        </div>
      )}

      <div className="space-y-2.5">
        {data?.contacts.map((c, i) => (
          <div
            key={c.id}
            className="card card-hover p-4 rise"
            style={{ animationDelay: `${0.04 * Math.min(i, 8)}s` }}
          >
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-[#FF8A3D] to-[#F2542D] flex items-center justify-center font-semibold text-white text-[15px]">
                {c.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="t-title">{c.name}</div>

                {c.company_name && (
                  <div
                    className="text-[13px] mt-0.5"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {c.company_name}
                    {c.sector && ` · ${c.sector}`}
                  </div>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[12px]">
                  <a
                    href={`tel:+91${c.phone}`}
                    className="t-num font-semibold"
                    style={{ color: 'var(--brand)' }}
                  >
                    {c.phone}
                  </a>
                  {c.email && (
                    <a
                      href={`mailto:${c.email}`}
                      className="break-all"
                      style={{ color: 'var(--text-faint)' }}
                    >
                      {c.email}
                    </a>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="t-num text-[20px] font-semibold leading-none">
                  {c.request_count}
                </div>
                <div className="t-label mt-1.5" style={{ fontSize: 9.5 }}>
                  request{c.request_count === 1 ? '' : 's'}
                </div>
              </div>
            </div>

            <div
              className="flex items-center justify-between mt-3 pt-3 text-[12px] border-t"
              style={{ borderColor: 'var(--line)', color: 'var(--text-faint)' }}
            >
              <span>Joined {timeAgo(c.created_at)}</span>
              {c.last_request_at && (
                <Link
                  href={`/requests?q=${c.phone}`}
                  className="font-semibold"
                  style={{ color: 'var(--brand)' }}
                >
                  View requests →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-3">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => {
            const q = new URLSearchParams(query);
            q.set('page', String(p));
            const isCurrent = p === data.page;

            return (
              <Link
                key={p}
                href={`/contacts?${q.toString()}`}
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