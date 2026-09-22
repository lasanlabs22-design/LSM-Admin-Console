'use client';

import { useState } from 'react';
import type { AdminInfluencer } from './page';
import PartnerDetail from './PartnerDetail';
import PartnerActions from './PartnerActions';
import {
  PARTNER_STATUS,
  instagramUrl,
  roleMeta,
  safeExternalUrl,
  timeAgo,
  tint,
} from '@/lib/meta';

export default function InfluencerCard({
  influencer: p,
  index,
}: {
  influencer: AdminInfluencer;
  index: number;
}) {
  const [showDetail, setShowDetail] = useState(false);

  const status = PARTNER_STATUS[p.status] || PARTNER_STATUS.pending;
  const role = roleMeta(p.role);
  const isPending = p.status === 'pending';
  const portfolio = safeExternalUrl(p.portfolio_url);

  /* What to check before approving, per role */
  const tags: string[] = [
    ...(p.services || []),
    ...(p.skills || []),
    ...(p.other_service ? [p.other_service] : []),
  ];

  return (
    <>
      <div
        className="card p-4 rise relative"
        style={{
          animationDelay: `${0.04 * Math.min(index, 8)}s`,
          borderColor: isPending ? 'var(--warn-line)' : 'var(--line)',
        }}
      >
        <div
          className="flex items-start gap-3 cursor-pointer"
          onClick={() => setShowDetail(true)}
        >
          {p.photo_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={p.photo_url}
              alt={p.name}
              className="w-12 h-12 rounded-full object-cover shrink-0"
              style={{ background: 'var(--surface-hover)' }}
            />
          ) : (
            <div
              className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center font-semibold text-white text-[15px]"
              style={{ background: role.color }}
            >
              {p.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="t-title truncate">{p.name}</div>

                {/* Vendors lead with the company; creators with the handle */}
                {p.role === 'vendor' ? (
                  <div
                    className="text-[12.5px] font-medium truncate"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {p.company_name}
                    {p.gst_number && ` · GST ${p.gst_number}`}
                  </div>
                ) : p.instagram_id ? (
                  <a
                    href={instagramUrl(p.instagram_id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[12.5px] font-medium"
                    style={{ color: 'var(--role-creator)' }}
                  >
                    @{p.instagram_id} ↗
                  </a>
                ) : null}
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <span
                  className="text-[10px] font-semibold uppercase px-2 py-1 rounded-md"
                  style={{
                    color: status.color,
                    background: status.bg,
                    letterSpacing: '0.06em',
                  }}
                >
                  {status.label}
                </span>
                <span
                  className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded"
                  style={{
                    color: role.color,
                    background: tint(role.color, 10),
                    letterSpacing: '0.05em',
                  }}
                >
                  {role.label}
                </span>
              </div>
            </div>

            <div
              className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[12px]"
              style={{ color: 'var(--text-faint)' }}
            >
              <a
                href={`tel:+91${p.phone}`}
                className="t-num font-semibold"
                style={{ color: 'var(--brand)' }}
              >
                {p.phone}
              </a>
              {p.category && <span>{p.category}</span>}
              {p.city && <span>{p.city}</span>}
              {p.followers && <span>{p.followers} followers</span>}
              {portfolio && (
                <a
                  href={portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{ color: 'var(--brand)' }}
                >
                  Portfolio ↗
                </a>
              )}
            </div>
          </div>
        </div>

        {/* What they offer */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.slice(0, 6).map((t) => (
              <span
                key={t}
                className="text-[11px] px-2 py-1 rounded-md"
                style={{
                  background: 'var(--surface-hover)',
                  color: 'var(--text-muted)',
                }}
              >
                {t}
              </span>
            ))}
            {tags.length > 6 && (
              <span
                className="text-[11px] px-2 py-1"
                style={{ color: 'var(--text-faint)' }}
              >
                +{tags.length - 6}
              </span>
            )}
          </div>
        )}

        {p.bio && (
          <p
            className="text-[13px] mt-3 line-clamp-2"
            style={{ color: 'var(--text-muted)' }}
          >
            {p.bio}
          </p>
        )}

        {/* Pricing — a number for creators, free text for the rest */}
        <div
          className="flex items-start justify-between gap-4 mt-3 pt-3 border-t"
          style={{ borderColor: 'var(--line)' }}
        >
          <div className="min-w-0">
            <div className="t-label" style={{ fontSize: 9.5 }}>
              {p.role === 'influencer' ? 'Rate per post' : 'Rate card'}
            </div>

            {p.role === 'influencer' ? (
              <div className="t-num text-[16px] font-semibold mt-0.5">
                {p.rate_per_post
                  ? '₹' + p.rate_per_post.toLocaleString('en-IN')
                  : '—'}
              </div>
            ) : (
              <p
                className="text-[12.5px] mt-1 line-clamp-2"
                style={{ color: 'var(--text-muted)' }}
              >
                {p.rate_card || 'Not given'}
              </p>
            )}
          </div>

          <span className="t-meta shrink-0" style={{ fontSize: 11.5 }}>
            {timeAgo(p.created_at)}
          </span>
        </div>

        {p.review_note && (
          <div
            className="rounded-lg px-3 py-2 mt-3 text-[12px]"
            style={{ background: 'var(--surface-hover)' }}
          >
            <span className="t-label" style={{ fontSize: 9 }}>
              Note
            </span>
            <p className="mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {p.review_note}
            </p>
          </div>
        )}

        <PartnerActions partner={p} />
      </div>

      {showDetail && (
        <PartnerDetail partner={p} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
}
