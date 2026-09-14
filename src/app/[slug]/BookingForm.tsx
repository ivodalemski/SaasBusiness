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
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 text-green-900 p-8 rounded-2xl text-center space-y-4 shadow-sm animate-fade-in">
        <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md text-2xl">
          ✓
        </div>
        <h2 className="text-2xl font-bold">Часът е запазен успешно!</h2>
        <p className="text-sm text-green-700 max-w-md mx-auto">
          Благодарим Ви! Вашата резервация за <strong>{selectedDate}</strong> в <strong>{selectedTime} ч.</strong> бе регистрирана. Изпратихме потвърждение на посочения имейл.
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            setSelectedDate('');
            setSelectedTime('');
          }}
          className="mt-2 bg-green-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-green-700 transition shadow-sm"
        >
          Запази друг час
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-200 flex items-center gap-3">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Стъпка 1: Избор на услуга */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">
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
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="space-y-1">
                  <div className="font-semibold text-gray-900">{service.name}</div>
                  <div className="text-xs text-gray-500">⏱️ {service.durationMin} мин</div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-blue-600">{service.price} лв.</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Стъпка 2: Избор на дата */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          2. Изберете дата
        </label>
        <input
          type="date"
          min={todayStr}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
        />
      </div>

      {/* Стъпка 3: Избор на свободен час */}
      {selectedDate && (
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            3. Изберете свободен час
          </label>
          
          {loadingSlots ? (
            <div className="text-xs text-gray-500 py-2">Зареждане на свободните часове...</div>
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
                    className={`py-2.5 rounded-xl text-sm font-medium border transition ${
                      isBooked
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed line-through'
                        : isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600'
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
        <label className="block text-sm font-semibold text-gray-800">
          4. Данни за резервацията
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Вашето име / Фирма</label>
            <input
              type="text"
              name="customerName"
              required
              placeholder="Иван Иванов / ЕООД"
              className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Телефон за връзка</label>
            <input
              type="tel"
              name="customerPhone"
              required
              placeholder="0888 123 456"
              className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Имейл адрес (за известия)</label>
          <input
            type="email"
            name="customerEmail"
            required
            placeholder="ivan@example.com"
            className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
          />
        </div>
      </div>

      {/* Обобщение и изпращане */}
      <div className="pt-4 border-t border-gray-100">
        {selectedService && (
          <div className="flex justify-between items-center mb-4 text-sm text-gray-600 bg-gray-50 p-3.5 rounded-xl border border-gray-200/60">
            <div>
              <span>Избрано: <strong>{selectedService.name}</strong></span>
              {selectedDate && selectedTime && (
                <div className="text-xs text-blue-600 font-semibold mt-0.5">
                  📅 {selectedDate} в {selectedTime} ч.
                </div>
              )}
            </div>
            <span className="font-bold text-gray-900">{selectedService.price} лв.</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !selectedDate || !selectedTime}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 text-base"
        >
          {loading ? 'Запазване...' : 'Запази час'}
        </button>
      </div>
    </form>
  );
}