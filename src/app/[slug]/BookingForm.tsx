'use client';

import React, { useState, useEffect } from 'react';
import { createBooking, getBookedSlots } from '@/app/actions/booking';

interface Service {
  id: string;
  name: string;
  price: number;
  durationMin: number;
}

interface BookingFormProps {
  businessId: string;
  businessName: string;
  services: Service[];
}

const DAILY_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

export default function BookingForm({ businessId, businessName, services }: BookingFormProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];
  const selectedService = services.find((s) => s.id === selectedServiceId);

  useEffect(() => {
    if (!selectedDate) return;

    async function fetchSlots() {
      setLoadingSlots(true);
      setSelectedTime('');
      const slots = await getBookedSlots(businessId, selectedDate);
      setBookedTimes(slots);
      setLoadingSlots(false);
    }

    fetchSlots();
  }, [selectedDate, businessId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      setErrorMsg('Моля, изберете дата и свободен час.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const fullDateTime = `${selectedDate}T${selectedTime}:00`;

    const formData = new FormData(e.currentTarget);
    formData.append('businessId', businessId);
    formData.append('serviceId', selectedServiceId);
    formData.append('bookingTime', fullDateTime);

    const res = await createBooking(formData);

    setLoading(false);
    if (res.success) {
      setSuccess(true);
    } else {
      setErrorMsg(res.error || 'Възникна грешка при изпращането');
    }
  }

  if (success) {
    return (
      <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 p-8 rounded-2xl text-center space-y-4 shadow-2xl backdrop-blur-xl">
        <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl shadow-lg">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-slate-100">Часът е запазен успешно!</h2>
        <p className="text-sm text-slate-300 max-w-md mx-auto">
          Благодарим Ви! Вашата резервация за <strong className="text-amber-400 font-mono">{selectedDate}</strong> в <strong className="text-amber-400 font-mono">{selectedTime} ч.</strong> бе регистрирана. Изпратихме потвърждение на посочения имейл.
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            setSelectedDate('');
            setSelectedTime('');
          }}
          className="mt-4 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold px-6 py-2.5 rounded-xl text-sm transition border border-slate-700 shadow-lg"
        >
          Запази друг час
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs font-medium flex items-center gap-3">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Стъпка 1: Избор на услуга */}
      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
          1. Изберете услуга
        </label>
        <div className="grid grid-cols-1 gap-3">
          {services.map((service) => {
            const isSelected = service.id === selectedServiceId;
            return (
              <div
                key={service.id}
                onClick={() => setSelectedServiceId(service.id)}
                className={`cursor-pointer p-4 rounded-xl border transition-all flex justify-between items-center ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/80 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/50'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="font-semibold text-slate-100 text-sm">{service.name}</div>
                  <div className="text-xs font-mono text-slate-500">⏱️ {service.durationMin} мин</div>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-amber-400 block">{service.price} лв.</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Стъпка 2: Избор на дата */}
      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
          2. Изберете дата
        </label>
        <input
          type="date"
          min={todayStr}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          required
          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition"
        />
      </div>

      {/* Стъпка 3: Избор на свободен час */}
      {selectedDate && (
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
            3. Изберете свободен час
          </label>
          
          {loadingSlots ? (
            <div className="text-xs text-slate-500 py-2 font-mono">Зареждане на свободните часове...</div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {DAILY_SLOTS.map((slot) => {
                const isBooked = bookedTimes.includes(slot);
                const isSelected = selectedTime === slot;

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={isBooked}
                    onClick={() => setSelectedTime(slot)}
                    className={`py-2.5 rounded-xl text-xs font-mono transition border ${
                      isBooked
                        ? 'bg-slate-900 border-slate-800/50 text-slate-600 line-through cursor-not-allowed'
                        : isSelected
                        ? 'bg-amber-400 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-amber-400'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Стъпка 4: Данни за контакт */}
      <div className="space-y-4 pt-2">
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
          4. Данни за резервацията
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Вашето име / Фирма</label>
            <input
              type="text"
              name="customerName"
              required
              placeholder="Иван Иванов / ЕООД"
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Телефон за връзка</label>
            <input
              type="tel"
              name="customerPhone"
              required
              placeholder="0888 123 456"
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Имейл адрес (за известия)</label>
          <input
            type="email"
            name="customerEmail"
            required
            placeholder="ivan@example.com"
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition"
          />
        </div>
      </div>

      {/* Обобщение и изпращане */}
      <div className="pt-4 border-t border-slate-800/80">
        {selectedService && (
          <div className="flex justify-between items-center mb-4 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 text-slate-400">
            <div>
              <span>Избрано: <strong className="text-slate-200">{selectedService.name}</strong></span>
              {selectedDate && selectedTime && (
                <div className="text-amber-400 font-mono font-semibold mt-0.5">
                  📅 {selectedDate} в {selectedTime} ч.
                </div>
              )}
            </div>
            <span className="font-bold text-base text-amber-400">{selectedService.price} лв.</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !selectedDate || !selectedTime}
          className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold py-3.5 px-6 rounded-xl transition shadow-lg shadow-amber-500/10 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
        >
          {loading ? 'Запазване...' : 'Запази час'}
        </button>
      </div>
    </form>
  );
}