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
      <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-5">
        <p className="text-red-300 font-semibold">Could not load this request</p>
        <p className="text-red-300/70 text-sm mt-1">{error}</p>
        <Link
          href="/requests"
          className="inline-block mt-4 text-[#FF6B35] text-sm font-semibold"
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
    <div className="space-y-5">
      <Link
        href="/requests"
        className="inline-flex items-center gap-1.5 text-white/45 hover:text-white/75 text-sm transition"
      >
        ← Back to requests
      </Link>

      {/* Header */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${type.color}, ${type.color}CC)` }}
      >
        <div className="absolute -top-14 -right-10 w-40 h-40 rounded-full bg-white/10" />

        <div className="relative">
          <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/75">
            {type.emoji} {type.label} request
          </div>
          <h1 className="text-2xl font-bold mt-2 leading-tight">
            {r.title || r.name}
          </h1>
          <div className="text-white/70 text-xs mt-3">
            {formatDateTime(r.created_at)} · {timeAgo(r.created_at)}
          </div>
        </div>
      </div>

      {/* Actions — status, assignee, note */}
      <Actions request={r} assignees={assignees} />

      {/* Customer */}
      <Card title="Customer">
        <div className="space-y-3">
          <Row label="Name" value={r.name} />
          <Row
            label="Phone"
            value={
              <a
                href={`tel:+91${r.phone}`}
                className="text-[#FF6B35] font-semibold"
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
                  className="text-[#FF6B35] font-semibold break-all"
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

        <div className="flex gap-2 mt-5">
          <a
            href={`tel:+91${r.phone}`}
            className="flex-1 bg-[#FF6B35] text-center font-bold py-3 rounded-xl hover:opacity-90 transition"
          >
            Call
          </a>
          <a
            href={`https://wa.me/91${r.phone}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 bg-[#25D366] text-center font-bold py-3 rounded-xl hover:opacity-90 transition"
          >
            WhatsApp
          </a>
        </div>
      </Card>

      {/* What they asked for */}
      {r.description && (
        <Card title="What they need">
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
            {r.description}
          </p>
        </Card>
      )}

      {/* Structured details */}
      {detailEntries.length > 0 && (
        <Card title="Details">
          <div className="grid sm:grid-cols-2 gap-2.5">
            {detailEntries.map(([key, value]) => (
              <div
                key={key}
                className="bg-white/[0.05] rounded-xl px-3.5 py-3"
              >
                <div className="text-white/40 text-[10px] font-bold uppercase tracking-wider">
                  {key.replace(/([A-Z])/g, ' $1')}
                </div>
                <div className="font-semibold text-sm mt-1">
                  {Array.isArray(value) ? value.join(', ') : String(value)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <p className="text-white/20 text-[11px] font-mono text-center pt-2">
        {r.id}
      </p>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
      <h2 className="text-white/40 text-[11px] font-bold uppercase tracking-[0.15em] mb-4">
        {title}
      </h2>
      {children}
    </div>
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
      <span className="text-white/40 text-xs w-28 shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-[15px] font-medium">{value}</span>
    </div>
  );
}