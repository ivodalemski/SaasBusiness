// @ts-nocheck
'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateBookingStatus, deleteBooking } from '@/app/actions/booking';

export default function BookingsManager({ bookings = [], slug }: { bookings: any[]; slug: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleStatusChange(bookingId: string, newStatus: string) {
    setError(null);
    startTransition(async () => {
      const res = await updateBookingStatus(bookingId, newStatus, slug);
      if (!res?.success) {
        setError(res?.error || 'Грешка при обновяването.');
      } else {
        router.refresh();
      }
    });
  }

  async function handleDelete(bookingId: string) {
    if (!confirm('Сигурни ли сте, че искате да изтриете тази резервация?')) return;

    setError(null);
    startTransition(async () => {
      const res = await deleteBooking(bookingId, slug);
      if (!res?.success) {
        setError(res?.error || 'Грешка при изтриването.');
      } else {
        router.refresh();
      }
    });
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-semibold">Потвърдена</span>;
      case 'CANCELLED':
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full text-xs font-semibold">Отказана</span>;
      default:
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-xs font-semibold">Чакаща</span>;
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800/80 shadow-2xl p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
            📅
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 tracking-wide">Получени резервации ({bookings.length})</h2>
            <p className="text-xs text-slate-400">Преглед и управление на записванията от клиенти</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
          ⚠️ {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <p className="text-xs text-slate-500 py-6 text-center">Все още нямате получени резервации.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking: any) => {
            const dt = new Date(booking.bookingTime);
            const dateStr = dt.toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const timeStr = dt.toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={booking.id}
                className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-slate-700/80"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-slate-100 text-base">{booking.customerName}</h4>
                    {getStatusBadge(booking.status)}
                  </div>
                  <p className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                    <span className="text-amber-400 font-medium">✂️ {booking.service?.name} ({booking.service?.price} лв.)</span>
                    <span>•</span>
                    <span>📞 {booking.customerPhone}</span>
                    {booking.customerEmail && <span>• ✉️ {booking.customerEmail}</span>}
                  </p>
                  <p className="text-xs text-slate-500">
                    🗓️ Дата & час: <span className="font-mono text-slate-200 font-semibold">{dateStr} в {timeStr} ч.</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}
                    disabled={isPending || booking.status === 'CONFIRMED'}
                    className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-2 rounded-xl transition disabled:opacity-40 cursor-pointer font-medium"
                  >
                    ✓ Потвърди
                  </button>
                  <button
                    onClick={() => handleStatusChange(booking.id, 'CANCELLED')}
                    disabled={isPending || booking.status === 'CANCELLED'}
                    className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 px-3 py-2 rounded-xl transition disabled:opacity-40 cursor-pointer font-medium"
                  >
                    ✕ Откажи
                  </button>
                  <button
                    onClick={() => handleDelete(booking.id)}
                    disabled={isPending}
                    className="text-xs bg-slate-900 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 border border-slate-800 p-2 rounded-xl transition cursor-pointer"
                    title="Изтрий резервацията"
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
  );
}