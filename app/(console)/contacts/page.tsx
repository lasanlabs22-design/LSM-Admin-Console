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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-white/40 text-sm mt-1">
          {data ? `${data.total} registered` : 'Loading…'}
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-2.5">
        {data?.contacts.map((c) => (
          <div
            key={c.id}
            className="bg-white/[0.04] border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-[#FF8A3D] to-[#F2542D] flex items-center justify-center font-bold">
                {c.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-bold">{c.name}</div>
                {c.company_name && (
                  <div className="text-white/45 text-[13px]">
                    {c.company_name}
                    {c.sector && ` · ${c.sector}`}
                  </div>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
                  <a
                    href={`tel:+91${c.phone}`}
                    className="text-[#FF6B35] font-semibold"
                  >
                    {c.phone}
                  </a>
                  {c.email && (
                    <a
                      href={`mailto:${c.email}`}
                      className="text-white/50 break-all"
                    >
                      {c.email}
                    </a>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xl font-bold">{c.request_count}</div>
                <div className="text-white/35 text-[10px] uppercase tracking-wider">
                  request{c.request_count === 1 ? '' : 's'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.07] text-xs text-white/35">
              <span>Joined {timeAgo(c.created_at)}</span>
              {c.last_request_at && (
                <Link
                  href={`/requests?q=${c.phone}`}
                  className="text-[#FF6B35] font-semibold"
                >
                  View requests →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => {
            const q = new URLSearchParams(query);
            q.set('page', String(p));

            return (
              <Link
                key={p}
                href={`/contacts?${q.toString()}`}
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