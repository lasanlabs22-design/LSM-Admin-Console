'use client';

import type { AdminInfluencer } from './page';
import Dialog from '@/components/Dialog';
import {
  PARTNER_STATUS,
  instagramUrl,
  roleMeta,
  safeExternalUrl,
  tint,
} from '@/lib/meta';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PartnerDetail({
  partner: p,
  onClose,
}: {
  partner: AdminInfluencer;
  onClose: () => void;
}) {
  const role = roleMeta(p.role);
  const status = PARTNER_STATUS[p.status] || PARTNER_STATUS.pending;
  const portfolio = safeExternalUrl(p.portfolio_url);

  const tags = [
    ...(p.services || []),
    ...(p.skills || []),
    ...(p.other_service ? [p.other_service] : []),
  ];

  return (
    <Dialog label={`${p.name}, ${role.label}`} size="panel" onClose={onClose}>
      {/* Header */}
      <div
        className="p-6 pb-5 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${tint(role.color, 13)}, transparent)`,
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center transition hover:opacity-70"
          style={{ background: 'var(--surface-hover)' }}
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4Z" />
          </svg>
        </button>

        <div className="flex items-start gap-4">
          {p.photo_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={p.photo_url}
              alt={p.name}
              className="w-20 h-20 rounded-2xl object-cover shrink-0"
              style={{ background: 'var(--surface-hover)' }}
            />
          ) : (
            <div
              className="w-20 h-20 shrink-0 rounded-2xl flex items-center justify-center font-semibold text-white text-[26px]"
              style={{ background: role.color }}
            >
              {p.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0 pr-10">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[10px] font-semibold uppercase px-2 py-1 rounded"
                style={{
                  color: role.color,
                  background: tint(role.color, 12),
                  letterSpacing: '0.06em',
                }}
              >
                {role.label}
              </span>

              <span
                className="flex items-center gap-1.5 text-[12px] font-semibold"
                style={{ color: status.color }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: status.color }}
                />
                {status.long}
              </span>
            </div>

            <h2 className="t-display mt-2" style={{ fontSize: 24 }}>
              {p.name}
            </h2>

            {p.role === 'vendor' && p.company_name && (
              <p className="t-body mt-0.5">{p.company_name}</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-6">
        {/* Contact */}
        <Section title="How to reach them">
          <Row label="Phone">
            <a
              href={`tel:+91${p.phone}`}
              className="t-num font-semibold"
              style={{ color: 'var(--brand)' }}
            >
              +91 {p.phone}
            </a>
          </Row>

          {p.email && (
            <Row label="Email">
              <a
                href={`mailto:${p.email}`}
                className="break-all"
                style={{ color: 'var(--brand)' }}
              >
                {p.email}
              </a>
            </Row>
          )}

          {p.city && <Row label="City">{p.city}</Row>}
        </Section>

        {/* Role-specific */}
        {p.role === 'influencer' && (
          <Section title="Their audience">
            {p.instagram_id && (
              <Row label="Instagram">
                <a
                  href={instagramUrl(p.instagram_id)}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--role-creator)' }}
                >
                  @{p.instagram_id} ↗
                </a>
              </Row>
            )}
            {p.followers && <Row label="Followers">{p.followers}</Row>}
            {p.category && <Row label="Posts about">{p.category}</Row>}
            <Row label="Rate per post">
              {p.rate_per_post
                ? '₹' + p.rate_per_post.toLocaleString('en-IN')
                : 'Not given'}
            </Row>
          </Section>
        )}

        {p.role === 'vendor' && (
          <Section title="The business">
            {p.company_name && <Row label="Company">{p.company_name}</Row>}
            <Row label="GST">
              {p.gst_number ? (
                <span className="t-num">{p.gst_number}</span>
              ) : (
                <span style={{ color: 'var(--text-faint)' }}>Not given</span>
              )}
            </Row>
          </Section>
        )}

        {p.role === 'freelancer' && p.portfolio_url && (
          <Section title="Their work">
            <Row label="Portfolio">
              {portfolio ? (
                <a
                  href={portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all"
                  style={{ color: 'var(--brand)' }}
                >
                  {p.portfolio_url} ↗
                </a>
              ) : (
                /* Not a web link — show it, but don't make it clickable */
                <span className="break-all">{p.portfolio_url}</span>
              )}
            </Row>
            {p.instagram_id && (
              <Row label="Instagram">
                <a
                  href={instagramUrl(p.instagram_id)}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--role-creator)' }}
                >
                  @{p.instagram_id} ↗
                </a>
              </Row>
            )}
          </Section>
        )}

        {/* What they offer */}
        {tags.length > 0 && (
          <Section title={p.role === 'vendor' ? 'Services offered' : 'Skills'}>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="text-[12.5px] px-3 py-1.5 rounded-lg"
                  style={{
                    background: tint(role.color, 8),
                    color: 'var(--text)',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Pricing */}
        {p.role !== 'influencer' && p.rate_card && (
          <Section title="Rate card">
            <p
              className="text-[14px] leading-relaxed whitespace-pre-wrap"
              style={{ color: 'var(--text-muted)' }}
            >
              {p.rate_card}
            </p>
          </Section>
        )}

        {/* About */}
        {p.bio && (
          <Section
            title={p.role === 'vendor' ? 'About the company' : 'About them'}
          >
            <p
              className="text-[14px] leading-relaxed"
              style={{ color: 'var(--text-muted)' }}
            >
              {p.bio}
            </p>
          </Section>
        )}

        {/* Review trail */}
        <Section title="History">
          <Row label="Applied">{formatDate(p.created_at)}</Row>
          {p.reviewed_at && (
            <Row label="Last reviewed">{formatDate(p.reviewed_at)}</Row>
          )}
          <Row label="Open requests">{p.open_requests}</Row>

          {p.review_note && (
            <div
              className="rounded-xl p-4 mt-3"
              style={{ background: 'var(--surface-hover)' }}
            >
              <span className="t-label" style={{ fontSize: 9.5 }}>
                Review note
              </span>
              <p
                className="text-[13.5px] mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                {p.review_note}
              </p>
            </div>
          )}
        </Section>
      </div>
    </Dialog>
  );
}

/* ---------- Pieces ---------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="t-label mb-3">{title}</h3>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-start justify-between gap-4 py-2.5 border-b last:border-0"
      style={{ borderColor: 'var(--line)' }}
    >
      <span
        className="text-[13px] shrink-0"
        style={{ color: 'var(--text-faint)' }}
      >
        {label}
      </span>
      <span
        className="text-[13.5px] font-medium text-right"
        style={{ color: 'var(--text)' }}
      >
        {children}
      </span>
    </div>
  );
}
