'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, Film, ShieldCheck, ArrowRight, Loader2, Sparkles } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('from') || '/admin';

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter the administrator password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Authentication failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      // Successful login
      router.push(redirectTarget);
      router.refresh();
    } catch {
      setError('Network or server connection failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-md">
      {/* Glow effect behind card */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-amber-500/20 blur-xl opacity-70" />

      <div className="relative rounded-2xl border border-white/10 bg-[#0c0d10]/90 p-8 shadow-2xl backdrop-blur-2xl">
        {/* Cinema Logo & Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-4 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
            <Film className="w-7 h-7" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-400">
              Admin Portal
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" /> Secure 256-bit
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-serif">
            Murdjadjo Cinema
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Archival Exhibition & Programming Management
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in zoom-in-95 duration-200">
            <span className="text-rose-400 font-bold">!</span>
            <p className="leading-relaxed flex-1">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-mono tracking-widest text-neutral-400 uppercase mb-2"
            >
              Master Key / Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter master password..."
                autoFocus
                required
                className="w-full pl-10 pr-11 py-3 rounded-xl bg-black/60 border border-white/15 text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-semibold text-xs font-mono tracking-widest uppercase transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying Credentials...
              </>
            ) : (
              <>
                <span>Access Control Deck</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-neutral-500">
          <Link
            href="/"
            className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5"
          >
            &larr; Back to Theatrical Front
          </Link>
          <span className="font-mono text-[11px] text-neutral-600">v2.4 Protected</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div data-admin-portal="true" className="admin-portal min-h-screen w-full bg-[#050608] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background cinematic aura & film stripes */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(217,119,6,0.12),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Ambient noise & subtle corner watermarks */}
      <div className="absolute top-6 left-6 text-xs font-mono tracking-widest text-neutral-600 uppercase flex items-center gap-2 pointer-events-none">
        <Sparkles className="w-3.5 h-3.5 text-amber-500/50" /> Murdjadjo Cinema Internal Administration
      </div>
      <div className="absolute bottom-6 right-6 text-[10px] font-mono tracking-widest text-neutral-700 pointer-events-none uppercase">
        Encrypted Session Protocol &bull; Edge Protected
      </div>

      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-neutral-400 text-sm font-mono">
            <Loader2 className="w-5 h-5 animate-spin text-amber-400" /> Initializing Portal...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
