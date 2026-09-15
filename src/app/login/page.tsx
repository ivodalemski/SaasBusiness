'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { loginUserAction } from '@/app/actions/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const res = await loginUserAction(email, password);

    if (!res.success) {
      setErrorMsg(res.error || 'Грешка при влизане.');
      setLoading(false);
      return;
    }

    window.location.href = `/${res.slug}/admin`;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-amber-500 selection:text-slate-950">
      <div className="max-w-md w-full space-y-6 bg-slate-900/50 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-800/80">
        
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 ring-1 ring-amber-300/50 mx-auto">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 11l2.5-2.5a2.121 2.121 0 0 1 3 3L17 16l-4-4" />
              <path d="M8 11L5.5 8.5a2.121 2.121 0 0 0-3 3L7 16l4-4" />
              <path d="M12 11l-2.5 2.5a2.121 2.121 0 0 0 0 3l.5.5a2.121 2.121 0 0 0 3 0l2.5-2.5" />
              <path d="M14.5 8.5L12 11" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Вход в <span className="text-amber-400">ЧАСНИК</span>
          </h1>
          <p className="text-xs text-slate-400">
            Влезте в контролния панел на вашия бизнес
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Имейл адрес</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@example.com"
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Парола</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold py-3.5 px-6 rounded-xl transition shadow-lg shadow-amber-500/10 disabled:opacity-50 text-sm mt-2"
          >
            {loading ? 'Влизане...' : 'Влез в таблото'}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Нямате акаунт?{' '}
            <Link href="/register" className="text-amber-400 font-semibold hover:underline">
              Регистрирайте нов бизнес
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}