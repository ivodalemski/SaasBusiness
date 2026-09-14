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

    // Пренасочваме към НЕГОВИЯ собствен админ панел
    window.location.href = `/${res.slug}/admin`;
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        
        <div className="text-center space-y-2">
          <span className="text-3xl">🔐</span>
          <h1 className="text-2xl font-extrabold text-slate-900">Вход в системата</h1>
          <p className="text-xs text-slate-500">
            Влезте в контролния панел на вашия бизнес
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Имейл адрес</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@example.com"
              className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Парола</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition duration-200 shadow-md disabled:opacity-50 text-sm"
          >
            {loading ? 'Влизане...' : 'Влез в таблото'}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Нямате акаунт?{' '}
            <Link href="/register" className="text-blue-600 font-semibold hover:underline">
              Регистрирайте нов бизнес
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}