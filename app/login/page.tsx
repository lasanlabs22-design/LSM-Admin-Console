'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    if (!password.trim()) return;

    setBusy(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        setError('That password is not right');
      }
    } catch {
      setError('Could not reach the server');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D1A] flex items-center justify-center px-6">
      {/* Soft glow behind the card */}
      <div className="absolute w-[420px] h-[420px] rounded-full bg-[#FF6B35] opacity-20 blur-[120px]" />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF8A3D] to-[#F2542D] mb-5 shadow-lg shadow-orange-500/30">
            <span className="text-2xl">🛒</span>
          </div>
          <h1 className="text-white text-2xl font-bold tracking-[0.2em]">
            LASAN MART
          </h1>
          <p className="text-white/40 text-sm mt-2">Admin Console</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
          <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-3">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Enter admin password"
            autoFocus
            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 h-13 py-3.5 text-white placeholder-white/25 outline-none focus:border-[#FF6B35] transition"
          />

          {error && (
            <p className="text-red-400 text-sm mt-3">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={busy || !password.trim()}
            className="w-full mt-5 bg-gradient-to-r from-[#FF8A3D] to-[#F2542D] text-white font-bold py-3.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition hover:opacity-90"
          >
            {busy ? 'Checking…' : 'Sign In'}
          </button>
        </div>

        <p className="text-white/25 text-xs text-center mt-6">
          Internal use only
        </p>
      </div>
    </div>
  );
}