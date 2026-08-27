'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Read whatever the inline script already applied
  useEffect(() => {
    const current = document.documentElement.classList.contains('light')
      ? 'light'
      : 'dark';
    setTheme(current);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.remove(theme);
    document.documentElement.classList.add(next);
    localStorage.setItem('lsm-theme', next);
    setTheme(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="relative w-[52px] h-[28px] rounded-full border transition"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--line)',
      }}
    >
      {/* The knob */}
      <span
        className="absolute top-[3px] w-[20px] h-[20px] rounded-full flex items-center justify-center transition-all duration-300 ease-out"
        style={{
          left: theme === 'dark' ? '3px' : '27px',
          background:
            theme === 'dark'
              ? 'linear-gradient(135deg, #3A4258, #232838)'
              : 'linear-gradient(135deg, #FFB347, #FF8A3D)',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-3 h-3"
          fill={theme === 'dark' ? '#C7CDDB' : '#fff'}
        >
          {theme === 'dark' ? (
            <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.39 5.39 0 0 1-4.4 2.26 5.4 5.4 0 0 1-4.15-8.85C12.3 3.02 12.15 3 12 3Z" />
          ) : (
            <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0-5v3m0 14v3M2 12h3m14 0h3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" 
                  stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
          )}
        </svg>
      </span>
    </button>
  );
}