import Link from 'next/link';
import { adminFetch, AdminContact } from '@/lib/api';
import { errorMessage, timeAgo } from '@/lib/meta';
import LoadError from '@/components/LoadError';
import Pagination from '@/components/Pagination';
import DeleteContact from './DeleteContact';

type ContactList = {
  contacts: AdminContact[];
  total: number;
  page: number;
  pages: number;
};

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const query = new URLSearchParams();
  if (params.q) query.set('q', params.q);
  if (params.page) query.set('page', params.page);

  let data: ContactList | null = null;
  let error: string | null = null;

  try {
    data = await adminFetch<ContactList>(`/admin/contacts?${query.toString()}`);
  } catch (err) {
    error = errorMessage(err);
  }

  return (
    <div className="space-y-5">
      <header className="rise">
        <h1 className="t-display">Users</h1>
        <p className="t-body mt-1.5">
          {data ? `${data.total} registered` : 'Loading…'}
        </p>
      </header>

      {error && <LoadError message={error} />}

      <div className="space-y-2.5">
        {data?.contacts.map((c, i) => (
          <div
            key={c.id}
            className="card card-hover p-4 rise"
            style={{ animationDelay: `${0.04 * Math.min(i, 8)}s` }}
          >
            <div className="flex items-start gap-3.5">
              {c.photo_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={c.photo_url}
                  alt={c.name}
                  className="w-11 h-11 shrink-0 rounded-full object-cover"
                  style={{ background: 'var(--surface-hover)' }}
                />
              ) : (
                <div className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-[var(--brand)] to-[var(--brand-2)] flex items-center justify-center font-semibold text-white text-[15px]">
                  {c.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="t-title break-words">{c.name}</div>

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
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mt-3 pt-3 text-[12px] border-t"
              style={{ borderColor: 'var(--line)', color: 'var(--text-faint)' }}
            >
              <span>Joined {timeAgo(c.created_at)}</span>

              <div className="flex items-center gap-4">
                <DeleteContact contactId={c.id} name={c.name} phone={c.phone} />

                {c.last_request_at && (
                  <Link
                    href={`/requests?q=${encodeURIComponent(c.phone)}`}
                    className="font-semibold"
                    style={{ color: 'var(--brand)' }}
                  >
                    View requests →
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {data && (
        <Pagination
          path="/contacts"
          query={query}
          page={data.page}
          pages={data.pages}
        />
      )}
    </div>
  );
}
