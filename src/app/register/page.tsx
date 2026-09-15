'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { registerBusinessAction } from '@/app/actions/business';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Автосервиз');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState(30);
  const [serviceDurationMin, setServiceDurationMin] = useState(60);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  function handleNameChange(value: string) {
    setName(value);
    const generatedSlug = value
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
    setSlug(generatedSlug);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const res = await registerBusinessAction({
      email,
      password,
      name,
      slug,
      category,
      phone,
      address,
      serviceName: serviceName || 'Стандартна услуга',
      servicePrice: Number(servicePrice),
      serviceDurationMin: Number(serviceDurationMin),
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Грешка при регистрацията.');
      setLoading(false);
      return;
    }

    window.location.href = `/${res.slug}/admin`;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-amber-500 selection:text-slate-950">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Заглавие с Лого */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 ring-1 ring-amber-300/50 mx-auto">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 11l2.5-2.5a2.121 2.121 0 0 1 3 3L17 16l-4-4" />
              <path d="M8 11L5.5 8.5a2.121 2.121 0 0 0-3 3L7 16l4-4" />
              <path d="M12 11l-2.5 2.5a2.121 2.121 0 0 0 0 3l.5.5a2.121 2.121 0 0 0 3 0l2.5-2.5" />
              <path d="M14.5 8.5L12 11" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Регистрирайте Вашия бизнес в <span className="text-amber-400">ЧАСНИК</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Започнете да приемате онлайн резервации за по-малко от 2 минути
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900/50 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-800/80">
          
          {/* Секция 1: Данни за акаунта */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-100 border-b border-slate-800/80 pb-2 tracking-wide">
              1. Данни за достъп (Акаунт)
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Секция 2: Данни за бизнеса */}
          <div className="space-y-4 pt-2">
            <h2 className="text-sm font-bold text-slate-100 border-b border-slate-800/80 pb-2 tracking-wide">
              2. Информация за бизнеса
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Име на бизнеса / обекта</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Автосервиз Далемски"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Категория</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition"
                >
                  <option value="Автосервиз">Автосервиз</option>
                  <option value="Салон за красота">Салон за красота</option>
                  <option value="Стоматология">Стоматология / Медицина</option>
                  <option value="Спорт & Фитнес">Спорт & Фитнес</option>
                  <option value="Друго">Друго</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Уникален URL адрес (Slug)</label>
              <div className="flex items-center">
                <span className="bg-slate-950 text-slate-500 border border-r-0 border-slate-800 rounded-l-xl px-3 py-3 text-xs font-mono">
                  chasnik.bg/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  placeholder="dalemski-serviz"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-r-xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none font-mono transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Телефон за връзка</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0888 123 456"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Адрес на обекта</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="гр. Пловдив, бул. Васил Априлов 12"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Секция 3: Първоначална услуга */}
          <div className="space-y-4 pt-2">
            <h2 className="text-sm font-bold text-slate-100 border-b border-slate-800/80 pb-2 tracking-wide">
              3. Първа услуга
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Име на услугата</label>
              <input
                type="text"
                required
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="Смяна на масло и филтри"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Цена (лв.)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={servicePrice}
                  onChange={(e) => setServicePrice(Number(e.target.value))}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Времетраене (минути)</label>
                <input
                  type="number"
                  required
                  step={15}
                  min={15}
                  value={serviceDurationMin}
                  onChange={(e) => setServiceDurationMin(Number(e.target.value))}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Бутон */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold py-3.5 px-6 rounded-xl transition shadow-lg shadow-amber-500/10 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              {loading ? 'Регистрация...' : 'Създай моя бизнес профил 🤝'}
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Вече имате акаунт?{' '}
              <Link href="/login" className="text-amber-400 font-semibold hover:underline">
                Влезте оттук
              </Link>
            </p>
          </div>
        </form>

      </div>
    </main>
  );
}