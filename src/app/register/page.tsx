'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { registerBusinessAction } from '@/app/actions/business';

export default function RegisterPage() {
  // Акаунт данни
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Бизнес данни
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Автосервиз');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Първоначална услуга
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState(30);
  const [serviceDurationMin, setServiceDurationMin] = useState(60);

  // Статуси
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

    // Успешна регистрация - твърдо презареждане към новия Админ Панел
    window.location.href = `/${res.slug}/admin`;
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Заглавие */}
        <div className="text-center space-y-2">
          <span className="text-3xl">🚀</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Регистрирайте Вашия бизнес
          </h1>
          <p className="text-sm text-slate-500">
            Започнете да приемате онлайн резервации за по-малко от 2 минути
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          
          {/* Секция 1: Данни за акаунта */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              1. Данни за достъп (Акаунт)
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Секция 2: Данни за бизнеса */}
          <div className="space-y-4 pt-2">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              2. Информация за бизнеса
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Име на бизнеса / обекта</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Автосервиз Далемски"
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Категория</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Уникален URL адрес (Slug)</label>
              <div className="flex items-center">
                <span className="bg-slate-100 text-slate-500 border border-r-0 border-slate-300 rounded-l-xl px-3 py-3 text-xs">
                  localhost:3000/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  placeholder="dalemski-serviz"
                  className="w-full border border-slate-300 rounded-r-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Телефон за връзка</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0888 123 456"
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Адрес на обекта</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="гр. Пловдив, бул. Васил Априлов 12"
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Секция 3: Първоначална услуга */}
          <div className="space-y-4 pt-2">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              3. Първа услуга
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Име на услугата</label>
              <input
                type="text"
                required
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="Смяна на масло и филтри"
                className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Цена (лв.)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={servicePrice}
                  onChange={(e) => setServicePrice(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Времетраене (минути)</label>
                <input
                  type="number"
                  required
                  step={15}
                  min={15}
                  value={serviceDurationMin}
                  onChange={(e) => setServiceDurationMin(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Бутон за изпращане */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 text-base"
            >
              {loading ? 'Регистрация...' : 'Създай моя бизнес профил 🚀'}
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Вече имате акаунт?{' '}
              <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                Влезте оттук
              </Link>
            </p>
          </div>
        </form>

      </div>
    </main>
  );
}