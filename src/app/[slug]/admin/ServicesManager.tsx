'use client';

import { useState, useTransition } from 'react';
import { createService, deleteService } from '@/app/actions/services';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string | null;
}

interface ServicesManagerProps {
  businessId: string;
  slug: string;
  services: Service[];
}

export default function ServicesManager({ businessId, slug, services }: ServicesManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleAddService(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createService(formData, slug);
      if (!res?.success) {
        setError(res?.error || 'Възникна грешка при добавянето.');
      }
    });
  }

  async function handleDelete(serviceId: string) {
    if (!confirm('Сигурни ли сте, че искате да изтриете тази услуга?')) return;
    
    startTransition(async () => {
      await deleteService(serviceId, slug);
    });
  }

  return (
    <div className="space-y-8">
      {/* Карта: Добавяне на Нова Услуга */}
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800/80 shadow-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
            ⚡
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 tracking-wide">Добавяне на услуга</h2>
            <p className="text-xs text-slate-400">Въведете детайли за новата услуга, която предлагате</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            ⚠️ {error}
          </div>
        )}

        <form action={handleAddService} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <input type="hidden" name="businessId" value={businessId} />

          {/* Наименование */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">Наименование</label>
            <input
              type="text"
              name="name"
              required
              placeholder="напр. Мъжко подстригване"
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition"
            />
          </div>

          {/* Цена */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">Цена (лв.)</label>
            <input
              type="number"
              name="price"
              step="0.01"
              required
              placeholder="25.00"
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition"
            />
          </div>

          {/* Времетраене */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">Времетраене (мин)</label>
            <input
              type="number"
              name="duration"
              defaultValue={30}
              required
              placeholder="30"
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition"
            />
          </div>

          {/* Бутон за запис */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-sm px-5 py-2.5 rounded-xl transition shadow-lg shadow-amber-500/10 disabled:opacity-50"
            >
              {isPending ? 'Запазване...' : '+ Добави услуга'}
            </button>
          </div>
        </form>
      </div>

      {/* Списък с активни услуги */}
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800/80 shadow-2xl p-6 sm:p-8">
        <h3 className="text-base font-bold text-slate-100 mb-4 tracking-wide">
          Текущи услуги ({services.length})
        </h3>

        {services.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">Все още нямате добавени услуги.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between hover:border-slate-700/80 transition group"
              >
                <div>
                  <h4 className="font-semibold text-slate-100 text-sm">{service.name}</h4>
                  <div className="flex items-center gap-3 mt-1.5 text-xs">
                    <span className="font-bold text-amber-400">{service.price} лв.</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 font-mono">{service.duration} мин</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(service.id)}
                  disabled={isPending}
                  className="text-xs bg-slate-900 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 p-2 rounded-xl transition"
                  title="Изтрий услугата"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}