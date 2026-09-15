'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/email';

const DAILY_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

export async function getBookedSlots(businessId: string, dateStr: string, serviceDurationMin: number = 0) {
  try {
    const searchStart = new Date(`${dateStr}T00:00:00`);
    searchStart.setDate(searchStart.getDate() - 1);

    const searchEnd = new Date(`${dateStr}T23:59:59`);
    searchEnd.setDate(searchEnd.getDate() + 1);

    // Извличаме съществуващите резервации с времетраенето на техните услуги
    const bookings = await prisma.booking.findMany({
      where: {
        businessId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        bookingTime: { gte: searchStart, lte: searchEnd },
      },
      include: {
        service: {
          select: { durationMin: true },
        },
      },
    });

    const unavailableSlots: string[] = [];

    // Проверяваме всеки възможен слот за припокриване
    for (const slot of DAILY_SLOTS) {
      const slotStart = new Date(`${dateStr}T${slot}:00`);
      const slotEnd = new Date(slotStart.getTime() + serviceDurationMin * 60 * 1000);

      const isOverlapping = bookings.some((b) => {
        const bStart = new Date(b.bookingTime);
        const bDuration = b.service?.durationMin || 60;
        const bEnd = new Date(bStart.getTime() + bDuration * 60 * 1000);

        // Формула за припокриване на два времеви интервала
        return slotStart < bEnd && slotEnd > bStart;
      });

      if (isOverlapping) {
        unavailableSlots.push(slot);
      }
    }

    return unavailableSlots;
  } catch (error) {
    console.error('Грешка при извличане на заетите часове:', error);
    return [];
  }
}

export async function createBooking(formData: FormData) {
  const businessId = formData.get('businessId') as string;
  const serviceId = formData.get('serviceId') as string;
  const customerName = formData.get('customerName') as string;
  const customerPhone = formData.get('customerPhone') as string;
  const customerEmail = formData.get('customerEmail') as string | null;
  const dateTimeStr = formData.get('bookingTime') as string;

  if (!businessId || !serviceId || !customerName || !customerPhone || !dateTimeStr) {
    return { success: false, error: 'Моля, попълнете всички задължителни полета.' };
  }

  const bookingDate = new Date(dateTimeStr);
  if (isNaN(bookingDate.getTime())) {
    return { success: false, error: 'Невалидна дата или час.' };
  }

  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return { success: false, error: 'Избраната услуга не бе намерена.' };
    }

    const newStart = bookingDate;
    const newEnd = new Date(newStart.getTime() + service.durationMin * 60 * 1000);

    const searchStart = new Date(newStart.getTime() - 24 * 60 * 60 * 1000);
    const searchEnd = new Date(newEnd.getTime() + 24 * 60 * 60 * 1000);

    const existingBookings = await prisma.booking.findMany({
      where: {
        businessId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        bookingTime: { gte: searchStart, lte: searchEnd },
      },
      include: { service: true },
    });

    // Валидация за припокриване на сървърно ниво
    const isConflict = existingBookings.some((b) => {
      const bStart = new Date(b.bookingTime);
      const bDuration = b.service?.durationMin || 60;
      const bEnd = new Date(bStart.getTime() + bDuration * 60 * 1000);

      return newStart < bEnd && newEnd > bStart;
    });

    if (isConflict) {
      return { success: false, error: 'Избраният час (или част от времетраенето) вече е зает. Моля, изберете друг час.' };
    }

    const booking = await prisma.booking.create({
      data: {
        businessId,
        serviceId,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        bookingTime: bookingDate,
        status: 'PENDING',
      },
      include: { business: true, service: true },
    });

    const formattedDate = bookingDate.toLocaleString('bg-BG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    if (booking.customerEmail) {
      await sendEmail({
        to: booking.customerEmail,
        subject: `Заявка за час в ${booking.business.name}`,
        html: `
          <h2>Здравейте, ${customerName}!</h2>
          <p>Вашата заявка за час бе приета успешно.</p>
          <ul>
            <li><strong>Услуга:</strong> ${booking.service.name}</li>
            <li><strong>Времетраене:</strong> ${booking.service.durationMin} мин.</li>
            <li><strong>Дата и час:</strong> ${formattedDate}</li>
            <li><strong>Обект:</strong> ${booking.business.name} (${booking.business.address})</li>
          </ul>
        `,
      });
    }

    if (booking.business.email) {
      await sendEmail({
        to: booking.business.email,
        subject: `🚨 Нова резервация: ${booking.service.name}`,
        html: `
          <h2>Нова резервация за ${booking.business.name}</h2>
          <p><strong>Клиент:</strong> ${customerName} (${customerPhone})</p>
          <p><strong>Услуга:</strong> ${booking.service.name} (${booking.service.durationMin} мин.)</p>
          <p><strong>Дата и час:</strong> ${formattedDate}</p>
        `,
      });
    }

    return { success: true, bookingId: booking.id };
  } catch (error) {
    console.error('Грешка при запазване на час:', error);
    return { success: false, error: 'Възникна грешка при запазването.' };
  }
}

export async function updateBookingStatus(bookingId: string, status: string, slug: string) {
  try {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: { business: true, service: true },
    });

    const formattedDate = new Date(booking.bookingTime).toLocaleString('bg-BG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    if (booking.customerEmail) {
      const statusText = status === 'CONFIRMED' ? 'ПОТВЪРДЕНА' : 'ОТКАЗАНА';
      const statusColor = status === 'CONFIRMED' ? '#16a34a' : '#dc2626';

      await sendEmail({
        to: booking.customerEmail,
        subject: `Обновен статус за резервация в ${booking.business.name}`,
        html: `
          <h2>Здравейте, ${booking.customerName}!</h2>
          <p>Вашата резервация за <strong>${booking.service.name}</strong> на <strong>${formattedDate}</strong> беше:</p>
          <h1 style="color: ${statusColor};">${statusText}</h1>
        `,
      });
    }

    revalidatePath(`/${slug}/admin`);
    return { success: true };
  } catch (error) {
    console.error('Грешка при обновяване на статуса:', error);
    return { success: false, error: 'Възникна грешка при обновяването.' };
  }
}

export async function deleteBooking(bookingId: string, slug: string) {
  try {
    await prisma.booking.delete({
      where: { id: bookingId },
    });

    revalidatePath(`/${slug}/admin`);
    return { success: true };
  } catch (error) {
    console.error('Грешка при изтриване на резервацията:', error);
    return { success: false, error: 'Възникна грешка при изтриването.' };
  }
}