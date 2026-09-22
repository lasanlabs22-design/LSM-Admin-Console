'use client';

import { useState } from 'react';
import type { AdminInfluencer } from './page';
import PartnerDetail from './PartnerDetail';
import { PARTNER_STATUS, roleMeta, timeAgo, tint } from '@/lib/meta';

/**
 * One partner as a single slim line, for scanning long lists.
 * Everything else — and the approve / reject buttons — is one tap away.
 */
export default function PartnerRow({
  partner: p,
}: {
  partner: AdminInfluencer;
}) {
  const [open, setOpen] = useState(false);

  const status = PARTNER_STATUS[p.status] || PARTNER_STATUS.pending;
  const role = roleMeta(p.role);

  // What identifies them beyond the name, per role
  const secondary =
    p.role === 'vendor'
      ? p.company_name
      : p.instagram_id
        ? `@${p.instagram_id}`
        : null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left flex items-center gap-3 px-3.5 sm:px-4 py-3 transition-colors hover:bg-[var(--surface-hover)]"
      >
        {p.photo_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={p.photo_url}
            alt=""
            className="w-9 h-9 rounded-full object-cover shrink-0"
            style={{ background: 'var(--surface-hover)' }}
          />
        ) : (
          <span
            className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-semibold text-white text-[13px]"
            style={{ background: role.color }}
          >
            {p.name.charAt(0).toUpperCase()}
          </span>
        )}

        <span className="flex-1 min-w-0">
          <span className="flex items-center gap-2 min-w-0">
            <span className="text-[14px] font-semibold truncate">{p.name}</span>
            <span
              className="text-[9.5px] font-semibold uppercase px-1.5 py-0.5 rounded shrink-0"
              style={{
                color: role.color,
                background: tint(role.color, 12),
                letterSpacing: '0.05em',
              }}
            >
              {role.label}
            </span>
          </span>

          <span
            className="block text-[12px] mt-0.5 truncate"
            style={{ color: 'var(--text-faint)' }}
          >
            {[secondary, p.city, p.phone].filter(Boolean).join(' · ')}
          </span>
        </span>

        <span className="flex flex-col items-end gap-1 shrink-0">
          <span
            className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md"
            style={{
              color: status.color,
              background: status.bg,
              letterSpacing: '0.05em',
            }}
          >
            {status.label}
          </span>
          <span className="t-meta" style={{ fontSize: 11 }}>
            {timeAgo(p.created_at)}
          </span>
        </span>
      </button>

      {open && <PartnerDetail partner={p} onClose={() => setOpen(false)} />}
    </>
  );
}
