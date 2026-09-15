// @ts-nocheck
'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createService, updateService, deleteService } from '@/app/actions/services';

export interface Service {
  id: string;
  name: string;
  price: number;
  durationMin?: number;
  duration?: number;
}

export interface ServicesManagerProps {
  businessId: string;
  slug: string;
  services: Service[];
}

export default function ServicesManager({ businessId, slug, services }: ServicesManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Режим на редактиране
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Стойности във формата
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [durationMin, setDurationMin] = useState('30');

  // Попълване на данните при избор за редактиране
  useEffect(() => {
    if (editingService) {
      setName(editingService.name);
      setPrice(editingService.price.toString());
      setDurationMin((editingService.durationMin ?? editingService.duration ?? 30).toString());
    } else {
      resetForm();
    }
  }, [editingService]);

  function resetForm() {
    setEditingService(null);
    setName('');
    setPrice('');
    setDurationMin('30');
    setError(null);
  }

  function handleStartEdit(service: Service) {
    setEditingService(service);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      let res;
      if (editingService) {
        res = await updateService(formData);
      } else {
        res = await createService(formData);
      }

      if (!res?.success) {
        setError(res?.error || 'Възникна грешка при обработката.');
      } else {
        resetForm();
        router.refresh();
      }
    });
  }

  async function handleDelete(serviceId: string) {
    if (!confirm('Сигурни ли сте, че искате да изтриете тази услуга?')) return;

    startTransition(async () => {
      const res = await deleteService(serviceId, slug);
      if (!res?.success) {
        setError(res?.error || 'Възникна грешка при изтриването.');
      } else {
        if (editingService?.id === serviceId) resetForm();
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Форма: Добавяне / Редактиране */}
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800/80 shadow-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
              {editingService ? '✏️' : '⚡'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 tracking-wide">
                {editingService ? 'Редактиране на услуга' : 'Добавяне на услуга'}
              </h2>
              <p className="text-xs text-slate-400">
                {editingService
                  ? `Редактирате "${editingService.name}"`
                  : 'Въведете детайли за новата услуга, която предлагате'}
              </p>
            </div>
          </div>

          {editingService && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl transition"
            >
              ✕ Отказ
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            ⚠️ {error}
          </div>
        )}

        <form action={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <input type="hidden" name="businessId" value={businessId || ''} />
          <input type="hidden" name="slug" value={slug || ''} />
          {editingService && <input type="hidden" name="serviceId" value={editingService.id} />}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">Наименование</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="напр. Мъжко подстригване"
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">Цена (лв.)</label>
            <input
              type="number"
              name="price"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              placeholder="25.00"
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">Времетраене (мин)</label>
            <input
              type="number"
              name="durationMin"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              required
              placeholder="30"
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-sm px-5 py-2.5 rounded-xl transition disabled:opacity-50 cursor-pointer shadow-lg shadow-amber-500/10"
            >
              {isPending
                ? 'Запазване...'
                : editingService
                ? 'Запази промените'
                : '+ Добави услуга'}
            </button>
          </div>
        </form>
      </div>

      {/* Списък с активни услуги */}
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800/80 shadow-2xl p-6 sm:p-8">
        <h3 className="text-base font-bold text-slate-100 mb-4 tracking-wide">
          Текущи услуги ({services?.length || 0})
        </h3>

        {!services || services.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">Все още нямате добавени услуги.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service: any) => {
              const isEditingThis = editingService?.id === service.id;
              return (
                <div
                  key={service.id}
                  className={`bg-slate-950/60 border ${
                    isEditingThis ? 'border-amber-500/80 ring-1 ring-amber-500/50' : 'border-slate-800/80'
                  } rounded-xl p-4 flex items-center justify-between transition`}
                >
                  <div>
                    <h4 className="font-semibold text-slate-100 text-sm">{service.name}</h4>
                    <div className="flex items-center gap-3 mt-1.5 text-xs">
                      <span className="font-bold text-amber-400">{service.price} лв.</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400 font-mono">
                        {service.durationMin ?? service.duration ?? 30} мин
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartEdit(service)}
                      disabled={isPending}
                      className="text-xs bg-slate-900 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 border border-slate-800 hover:border-amber-500/30 p-2 rounded-xl transition cursor-pointer"
                      title="Редактирай услугата"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      disabled={isPending}
                      className="text-xs bg-slate-900 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 p-2 rounded-xl transition cursor-pointer"
                      title="Изтрий услугата"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}