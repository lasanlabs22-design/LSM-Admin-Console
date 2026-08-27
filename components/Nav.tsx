'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/requests', label: 'Requests', icon: '📥' },
  { href: '/contacts', label: 'Users', icon: '👥' },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch('/api/login', { method: 'DELETE' });
    router.push('/login');
    router.refresh();
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      {/* Top bar — always visible */}
      <header className="sticky top-0 z-40 bg-[#0B0D1A] border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-white font-bold tracking-[0.18em] text-sm">
              LASAN MART
            </span>
            <span className="text-[10px] text-white/35 border border-white/15 rounded px-1.5 py-0.5">
              ADMIN
            </span>
          </Link>

          {/* Desktop links */}
          <nav className="hidden sm:flex items-center gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  isActive(l.href)
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={logout}
            className="text-white/40 hover:text-white/70 text-sm transition"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Bottom bar — phones only */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0D1A] border-t border-white/10 flex">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition ${
              isActive(l.href) ? 'text-[#FF6B35]' : 'text-white/40'
            }`}
          >
            <span className="text-lg leading-none">{l.icon}</span>
            <span className="text-[10px] font-semibold">{l.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}