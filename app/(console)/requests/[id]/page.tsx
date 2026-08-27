import Link from 'next/link';
import { adminFetch, AdminRequest } from '@/lib/api';
import { TYPE_META, formatDateTime, timeAgo } from '@/lib/meta';
import Actions from './Actions';

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let request: AdminRequest | null = null;
  let assignees: string[] = [];
  let error: string | null = null;

  try {
    const [reqData, assigneeData] = await Promise.all([
      adminFetch(`/admin/requests/${id}`),
      adminFetch('/admin/assignees').catch(() => ({ assignees: [] })),
    ]);
    request = reqData.request;
    assignees = assigneeData.assignees || [];
  } catch (err: any) {
    error = err.message;
  }

  if (error || !request) {
    return (
      <div className="card p-6" style={{ borderColor: 'rgba(217,48,37,0.3)' }}>
        <div className="t-title mb-1" style={{ color: '#EF4444' }}>
          Could not load this request
        </div>
        <p className="t-body">{error}</p>
        <Link
          href="/requests"
          className="inline-block mt-4 text-[13px] font-semibold"
          style={{ color: 'var(--brand)' }}
        >
          ← Back to requests
        </Link>
      </div>
    );
  }

  const r = request;
  const type = TYPE_META[r.type] || {
    label: r.type,
    color: '#8A8F98',
    emoji: '📄',
  };

  const detailEntries = r.details
    ? Object.entries(r.details).filter(
        ([, v]) => v !== null && v !== undefined && v !== ''
      )
    : [];

  return (
    <div className="space-y-4">
      <Link
        href="/requests"
        className="inline-flex items-center gap-1.5 text-[13px] transition hover:opacity-70 rise"
        style={{ color: 'var(--text-faint)' }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20v-2Z" />
        </svg>
        Back to requests
      </Link>

      {/* Header */}
      <div
        className="rounded-2xl p-6 relative overflow-hidden rise"
        style={{
          background: `linear-gradient(135deg, ${type.color}, ${type.color}D0)`,
          animationDelay: '0.04s',
        }}
      >
        <span className="absolute -top-16 -right-12 w-44 h-44 rounded-full bg-white/10" />
        <span
          className="absolute -bottom-10 -left-8 w-32 h-32 rounded-full bg-white/[0.07]"
        />

        <div className="relative">
          <div
            className="text-[10.5px] font-semibold uppercase text-white/75"
            style={{ letterSpacing: '0.13em' }}
          >
            {type.emoji} {type.label} request
          </div>

          <h1
            className="mt-2.5 text-white leading-tight"
            style={{ fontSize: 26, fontWeight: 650, letterSpacing: '-0.025em' }}
          >
            {r.title || r.name}
          </h1>

          <div className="text-white/65 text-[12px] mt-3.5 t-num">
            {formatDateTime(r.created_at)} · {timeAgo(r.created_at)}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="rise" style={{ animationDelay: '0.08s' }}>
        <Actions request={r} assignees={assignees} />
      </div>

      {/* Customer */}
      <Card title="Customer" delay="0.12s">
        <div className="space-y-3.5">
          <Row label="Name" value={r.name} />
          <Row
            label="Phone"
            value={
              <a
                href={`tel:+91${r.phone}`}
                className="t-num font-semibold"
                style={{ color: 'var(--brand)' }}
              >
                {r.phone}
              </a>
            }
          />
          {r.email && (
            <Row
              label="Email"
              value={
                <a
                  href={`mailto:${r.email}`}
                  className="font-medium break-all"
                  style={{ color: 'var(--brand)' }}
                >
                  {r.email}
                </a>
              }
            />
          )}
          {r.company_name && <Row label="Company" value={r.company_name} />}
          {r.sector && <Row label="Sector" value={r.sector} />}
          {r.city && <Row label="City" value={r.city} />}
          {r.contact_since && (
            <Row label="Customer since" value={timeAgo(r.contact_since)} />
          )}
        </div>

        <div className="flex gap-2.5 mt-5">
          <a
            href={`tel:+91${r.phone}`}
            className="flex-1 flex items-center justify-center gap-2 text-center font-semibold text-[14px] text-white py-3 rounded-xl transition hover:opacity-90"
            style={{ background: 'var(--brand)' }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .7-.2 1l-2.3 2.2Z" />
            </svg>
            Call
          </a>

          <a
            href={`https://wa.me/91${r.phone}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 text-center font-semibold text-[14px] text-white py-3 rounded-xl transition hover:opacity-90"
            style={{ background: '#25D366' }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.2 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1a13 13 0 0 1-5.9-5.2c-.4-.7-.7-1.5-.7-2.2 0-.8.4-1.5.8-1.8.2-.2.4-.3.6-.3h.5c.2 0 .4 0 .5.4l.8 1.9c.1.2 0 .4-.1.5l-.3.4c-.1.2-.3.3-.1.6.5.9 1.1 1.6 2 2.2.3.2.5.2.7 0l.6-.7c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3v.9c0 .1 0 .2-.1.2Z" />
            </svg>
            WhatsApp
          </a>
        </div>
      </Card>

      {/* What they asked for */}
      {r.description && (
        <Card title="What they need" delay="0.16s">
          <div
            className="rounded-xl p-4 border-l-[3px]"
            style={{
              background: 'var(--surface-hover)',
              borderColor: type.color,
            }}
          >
            <p
              className="text-[15px] leading-relaxed whitespace-pre-wrap"
              style={{ color: 'var(--text)' }}
            >
              {r.description}
            </p>
          </div>
        </Card>
      )}

      {/* Structured details */}
      {detailEntries.length > 0 && (
        <Card title="Details" delay="0.2s">
          <div className="grid sm:grid-cols-2 gap-2.5">
            {detailEntries.map(([key, value]) => (
              <div
                key={key}
                className="rounded-xl px-3.5 py-3"
                style={{ background: 'var(--surface-hover)' }}
              >
                <div className="t-label" style={{ fontSize: 9.5 }}>
                  {key.replace(/([A-Z])/g, ' $1')}
                </div>
                <div className="font-medium text-[14px] mt-1.5 leading-snug">
                  {Array.isArray(value) ? value.join(', ') : String(value)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <p
        className="t-num text-[11px] text-center pt-2 pb-2"
        style={{ color: 'var(--text-faint)', opacity: 0.6 }}
      >
        {r.id}
      </p>
    </div>
  );
}

/* ---------------- Pieces ---------------- */

function Card({
  title,
  children,
  delay,
}: {
  title: string;
  children: React.ReactNode;
  delay?: string;
}) {
  return (
    <section
      className="card p-5 rise"
      style={delay ? { animationDelay: delay } : undefined}
    >
      <h2 className="t-label mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <span
        className="text-[12px] w-28 shrink-0 pt-0.5"
        style={{ color: 'var(--text-faint)' }}
      >
        {label}
      </span>
      <span className="text-[15px] font-medium">{value}</span>
    </div>
  );
}