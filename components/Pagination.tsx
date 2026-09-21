import Link from 'next/link';
import { pageWindow } from '@/lib/meta';

/** Page links for a list, keeping the current filters in the URL */
export default function Pagination({
  path,
  query,
  page,
  pages,
}: {
  path: string;
  query: URLSearchParams;
  page: number;
  pages: number;
}) {
  if (pages <= 1) return null;

  return (
    <nav
      aria-label="Pages"
      className="flex flex-wrap items-center justify-center gap-1.5 pt-3"
    >
      {pageWindow(page, pages).map((p, i) => {
        if (p === null) {
          return (
            <span key={`gap-${i}`} className="t-meta px-1">
              …
            </span>
          );
        }

        const q = new URLSearchParams(query);
        q.set('page', String(p));
        const isCurrent = p === page;

        return (
          <Link
            key={p}
            href={`${path}?${q.toString()}`}
            aria-current={isCurrent ? 'page' : undefined}
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
    </nav>
  );
}
