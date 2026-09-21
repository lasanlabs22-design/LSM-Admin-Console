import Link from 'next/link';
import { tint } from '@/lib/meta';

/**
 * A number with a label, used across the console's summary rows.
 * With `href` it becomes a link to the matching filtered list.
 */
export default function StatCard({
  label,
  value,
  accent,
  href,
  sub,
  urgent,
}: {
  label: string;
  value: number;
  accent: string;
  href?: string;
  sub?: string;
  urgent?: boolean;
}) {
  const body = (
    <>
      {/* Soft corner wash in the stat's colour */}
      <span
        className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-[0.13] transition-opacity group-hover:opacity-20"
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
          className="t-num mt-2.5 leading-none text-[28px] sm:text-[32px]"
          style={{ fontWeight: 600, color: accent }}
        >
          {value}
        </div>

        {sub && (
          <div className="t-meta mt-1.5" style={{ fontSize: 11 }}>
            {sub}
          </div>
        )}
      </div>
    </>
  );

  const style = urgent ? { borderColor: tint(accent, 30) } : undefined;

  if (!href) {
    return (
      <div className="card relative p-4 overflow-hidden" style={style}>
        {body}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="card card-hover card-lift relative block p-4 overflow-hidden group"
      style={style}
    >
      {body}
    </Link>
  );
}
