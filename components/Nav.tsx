'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

const LINKS = [
  {
    href: '/',
    label: 'Dashboard',
    icon: (
      <path d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" />
    ),
  },
  {
    href: '/requests',
    label: 'Requests',
    icon: (
      <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm-2 6H7V7h10v2Zm0 4H7v-2h10v2Zm-3 4H7v-2h7v2Z" />
    ),
  },
  {
    href: '/work',
    label: 'Work',
    icon: (
      <path d="M10 2h4a2 2 0 0 1 2 2v2h4a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4V4a2 2 0 0 1 2-2Zm0 4h4V4h-4v2Z" />
    ),
  },
  {
    href: '/vibes',
    label: 'Vibes',
    icon: (
      <path d="M10 16.5 16 12l-6-4.5v9ZM12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" />
    ),
  },
  {
    href: '/influencers',
    label: 'Lasan Hub',
    icon: (
      <path d="M12 2 14.4 8.2 21 8.6l-5 4.3 1.6 6.4L12 15.8 6.4 19.3 8 12.9l-5-4.3 6.6-.4L12 2Z" />
    ),
  },
  {
    href: '/contacts',
    label: 'Users',
    icon: (
      <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3Zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z" />
    ),
  },
];

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
      {children}
    </svg>
  );
}

/** The Lasan Mart shopping-cart mark */
function Logo({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="white" style={{ width: size, height: size }}>
      <path d="M17 18a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM7 18a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM7.2 14.6 7 15a1 1 0 0 0 1 1h12v-2H8.4l1.1-2H17a2 2 0 0 0 1.8-1L22 5H6.2l-.9-2H2v2h2l3.6 7.6-1.4 2Z" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <Icon>
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5ZM4 5h8V3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8v-2H4V5Z" />
    </Icon>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  const [signingOut, setSigningOut] = useState(false);

  const logout = async () => {
    setSigningOut(true);

    try {
      await fetch('/api/login', { method: 'DELETE' });
      router.push('/login');
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      {/* ---------- Desktop sidebar ---------- */}
      <aside
        className="hidden lg:flex fixed inset-y-0 left-0 w-60 flex-col border-r backdrop-blur-xl z-40"
        style={{
          borderColor: 'var(--line)',
          background: 'color-mix(in srgb, var(--bg) 82%, transparent)',
        }}
      >
        {/* Brand */}
        <div
          className="px-5 py-5 border-b"
          style={{ borderColor: 'var(--line)' }}
        >
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 rounded-[10px] flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
              style={{
                background:
                  'var(--brand-gradient)',
                boxShadow: '0 4px 14px -4px var(--brand)',
              }}
            >
              <Logo />
            </div>
            <div>
              <div className="text-[13px] font-semibold tracking-[0.16em] leading-none">
                LASAN MART
              </div>
              <div
                className="text-[10px] mt-1 tracking-wide"
                style={{ color: 'var(--text-faint)' }}
              >
                Admin Console
              </div>
            </div>
          </Link>
        </div>

        {/* Links */}
        <nav className="flex-1 p-3 space-y-0.5">
          {LINKS.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors duration-150"
                style={{
                  background: active ? 'var(--brand-soft)' : 'transparent',
                  color: active ? 'var(--brand)' : 'var(--text-faint)',
                  fontWeight: active ? 600 : 450,
                }}
              >
                {active && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r"
                    style={{ background: 'var(--brand)' }}
                  />
                )}
                <Icon>{l.icon}</Icon>
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Theme + sign out */}
        <div className="p-3 border-t" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center justify-between px-3 py-2 mb-1">
            <span className="t-label">Theme</span>
            <ThemeToggle />
          </div>

          {/* Red, and it reacts — a destructive action should look like one */}
          <button
            onClick={logout}
            disabled={signingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 disabled:opacity-50"
            style={{ color: 'var(--bad)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bad-soft)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <SignOutIcon />
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>

      {/* ---------- Mobile top bar ---------- */}
      <header
        className="lg:hidden sticky top-0 z-40 backdrop-blur-xl border-b"
        style={{
          borderColor: 'var(--line)',
          background: 'color-mix(in srgb, var(--bg) 88%, transparent)',
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        <div className="px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background:
                  'var(--brand-gradient)',
              }}
            >
              <Logo size={14} />
            </div>
            <span className="text-xs font-semibold tracking-[0.16em]">
              LASAN MART
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <button
              onClick={logout}
              disabled={signingOut}
              aria-label="Sign out"
              className="w-9 h-9 rounded-lg flex items-center justify-center transition disabled:opacity-50"
              style={{ color: 'var(--bad)', background: 'var(--bad-soft)' }}
            >
              <SignOutIcon />
            </button>
          </div>
        </div>
      </header>

      {/* ---------- Mobile bottom bar ---------- */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 backdrop-blur-xl border-t flex px-1 safe-bottom"
        style={{
          borderColor: 'var(--line)',
          background: 'color-mix(in srgb, var(--bg) 92%, transparent)',
        }}
      >
        {LINKS.map((l) => {
          const active = isActive(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? 'page' : undefined}
              className="relative flex-1 min-w-0 flex flex-col items-center gap-1 pt-2 pb-2.5 transition"
              style={{ color: active ? 'var(--brand)' : 'var(--text-faint)' }}
            >
              <span
                className="flex items-center justify-center w-11 h-7 rounded-full transition-colors"
                style={{ background: active ? 'var(--brand-soft)' : 'transparent' }}
              >
                <Icon>{l.icon}</Icon>
              </span>
              <span className="text-[10px] font-semibold leading-none truncate max-w-full">
                {l.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
