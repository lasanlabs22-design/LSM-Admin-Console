'use client';


import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [focused, setFocused] = useState(false);
  const [shake, setShake] = useState(false);

  // Fixed positions, worked out once so they don't jump on re-render
   const [embers, setEmbers] = useState<
    { left: number; size: number; duration: number; delay: number; drift: string }[]
  >([]);

  // Random values differ between server and browser, which breaks hydration.
  // Generating them after mount means the server renders no embers,
  // then they appear a frame later — invisible to the user.
  useEffect(() => {
    setEmbers(
      Array.from({ length: 12 }, () => ({
        left: Math.random() * 100,
        size: 2 + Math.random() * 3,
        duration: 11 + Math.random() * 9,
        delay: Math.random() * 10,
        drift: `${(Math.random() - 0.5) * 90}px`,
      }))
    );
  }, []);

  const handleSubmit = async () => {
    if (!password.trim() || busy) return;

    setBusy(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        // Let the tick land before navigating
        setDone(true);
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 550);
      } else {
        setError('That password is not right');
        setShake(true);
        setTimeout(() => setShake(false), 450);
        setBusy(false);
      }
    } catch {
      setError('Could not reach the server');
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090F] flex items-center justify-center px-6 relative overflow-hidden">
      {/* ---------- Background ---------- */}

      {/* Drifting colour */}
      <div
        className="absolute w-[520px] h-[520px] rounded-full anim-aurora pointer-events-none"
        style={{
          top: '-14%',
          left: '-10%',
          background:
            'radial-gradient(circle, rgba(255,107,53,0.30), transparent 68%)',
          filter: 'blur(70px)',
        }}
      />
      <div
        className="absolute w-[460px] h-[460px] rounded-full anim-aurora pointer-events-none"
        style={{
          bottom: '-16%',
          right: '-8%',
          background:
            'radial-gradient(circle, rgba(46,107,232,0.26), transparent 68%)',
          filter: 'blur(70px)',
          animationDelay: '-8s',
          animationDuration: '21s',
        }}
      />

      {/* Sliding grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.5]"
        style={{
          maskImage:
            'radial-gradient(ellipse 70% 55% at 50% 45%, #000 20%, transparent 78%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 55% at 50% 45%, #000 20%, transparent 78%)',
        }}
      >
        <div
          className="absolute inset-0 anim-grid"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)
            `,
            backgroundSize: '52px 52px',
            top: '-52px',
            bottom: '-52px',
          }}
        />
      </div>

      {/* Rising embers */}
      {embers.map((e, i) => (
        <span
          key={i}
          className="absolute rounded-full anim-float pointer-events-none"
          style={
            {
              left: `${e.left}%`,
              bottom: '-10px',
              width: e.size,
              height: e.size,
              background: '#FFB347',
              animationDuration: `${e.duration}s`,
              animationDelay: `${e.delay}s`,
              '--drift': e.drift,
            } as React.CSSProperties
          }
        />
      ))}

      {/* ---------- Card ---------- */}
      <div className="relative w-full max-w-[380px]">
        {/* Mark */}
        <div
          className="flex flex-col items-center mb-9 anim-in"
          style={{ animationDelay: '0.05s' }}
        >
          <div className="relative mb-5">
            {/* Two pulses, offset so there's always one expanding */}
            <span
              className="absolute inset-0 rounded-2xl anim-ring"
              style={{ background: 'rgba(255,107,53,0.35)' }}
            />
            <span
              className="absolute inset-0 rounded-2xl anim-ring"
              style={{
                background: 'rgba(255,107,53,0.25)',
                animationDelay: '1.4s',
              }}
            />

            <div
              className="relative w-[62px] h-[62px] rounded-2xl flex items-center justify-center overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #FF9A4D, #F2542D)',
                boxShadow: '0 12px 40px rgba(255,107,53,0.42)',
              }}
            >
              {/* Light sweeping across the badge */}
              <span
                className="absolute top-0 bottom-0 w-8 anim-shimmer"
                style={{ background: 'rgba(255,255,255,0.28)' }}
              />
              <svg viewBox="0 0 24 24" fill="white" className="relative w-7 h-7">
                <path d="M17 18a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM7 18a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM7.2 14.6 7 15a1 1 0 0 0 1 1h12v-2H8.4l1.1-2H17a2 2 0 0 0 1.8-1L22 5H6.2l-.9-2H2v2h2l3.6 7.6-1.4 2Z" />
              </svg>
            </div>
          </div>

          <h1
            className="text-white text-[21px] font-semibold anim-in"
            style={{ letterSpacing: '0.2em', animationDelay: '0.14s' }}
          >
            LASAN MART
          </h1>

          <div
            className="flex items-center gap-2.5 mt-3 anim-in"
            style={{ animationDelay: '0.2s' }}
          >
            <span className="h-px w-7 bg-gradient-to-r from-transparent to-white/25" />
            <span
              className="text-white/40 text-[10px] font-semibold"
              style={{ letterSpacing: '0.24em' }}
            >
              ADMIN CONSOLE
            </span>
            <span className="h-px w-7 bg-gradient-to-l from-transparent to-white/25" />
          </div>
        </div>

        {/* Form */}
        <div
          className="anim-in"
          style={{
            animationDelay: '0.28s',
            transform: shake ? undefined : undefined,
            animation: shake
              ? 'fadeSlide 0.6s both, shakeX 0.42s'
              : undefined,
          }}
        >
          <div
            className="rounded-2xl p-6 border backdrop-blur-2xl transition-all duration-300"
            style={{
              background: 'rgba(255,255,255,0.045)',
              borderColor: focused
                ? 'rgba(255,107,53,0.45)'
                : 'rgba(255,255,255,0.10)',
              boxShadow: focused
                ? '0 0 0 1px rgba(255,107,53,0.15), 0 20px 60px rgba(0,0,0,0.5)'
                : '0 20px 60px rgba(0,0,0,0.4)',
            }}
          >
            <label
              className="block text-white/45 text-[10px] font-semibold mb-3"
              style={{ letterSpacing: '0.16em' }}
            >
              PASSWORD
            </label>

            <div
              className="flex items-center gap-3 rounded-xl px-4 h-[52px] border transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderColor: focused
                  ? 'rgba(255,107,53,0.6)'
                  : 'rgba(255,255,255,0.12)',
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-[17px] h-[17px] shrink-0 transition-colors duration-200"
                style={{
                  color: focused
                    ? '#FF8A3D'
                    : 'rgba(255,255,255,0.3)',
                }}
              >
                <path d="M18 8h-1V6A5 5 0 0 0 7 6v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Zm-6 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM9 8V6a3 3 0 1 1 6 0v2H9Z" />
              </svg>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Enter admin password"
                autoFocus
                disabled={busy}
                className="flex-1 bg-transparent text-white text-[15px] placeholder-white/22 outline-none disabled:opacity-60"
                style={{ letterSpacing: password ? '0.18em' : 'normal' }}
              />

              {password.length > 0 && !busy && (
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: '#FF8A3D' }}
                />
              )}
            </div>

            {/* Error slides in, doesn't jump the layout */}
            <div
              className="overflow-hidden transition-all duration-300"
              style={{ maxHeight: error ? 40 : 0, opacity: error ? 1 : 0 }}
            >
              <p className="text-[12.5px] pt-3" style={{ color: '#FF6B6B' }}>
                {error}
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={busy || !password.trim()}
              className="relative w-full mt-5 h-[50px] rounded-xl font-semibold text-[15px] text-white overflow-hidden transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
              style={{
                background: done
                  ? '#12B3A0'
                  : 'linear-gradient(135deg, #FF9A4D, #F2542D)',
                boxShadow:
                  busy || !password.trim()
                    ? 'none'
                    : '0 8px 28px rgba(255,107,53,0.35)',
              }}
            >
              {/* Sweep, only when it's usable */}
              {!busy && password.trim() && (
                <span
                  className="absolute top-0 bottom-0 w-10 anim-shimmer pointer-events-none"
                  style={{ background: 'rgba(255,255,255,0.22)' }}
                />
              )}

              <span className="relative flex items-center justify-center gap-2">
                {done ? (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-[18px] h-[18px]"
                    >
                      <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z" />
                    </svg>
                    Welcome back
                  </>
                ) : busy ? (
                  <>
                    <span
                      className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
                    />
                    Checking
                  </>
                ) : (
                  <>
                    Sign In
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-[17px] h-[17px]"
                    >
                      <path d="M4 11h12.2l-5.6-5.6L12 4l8 8-8 8-1.4-1.4 5.6-5.6H4v-2Z" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </div>
        </div>

        <p
          className="text-white/22 text-[11.5px] text-center mt-7 anim-in"
          style={{ animationDelay: '0.36s' }}
        >
          Internal use only · Lasan Labs
        </p>
      </div>
    </div>
  );
}