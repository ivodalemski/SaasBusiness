'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/email';

export async function getBookedSlots(businessId: string, dateStr: string) {
  try {
    const startOfDay = new Date(`${dateStr}T00:00:00`);
    const endOfDay = new Date(`${dateStr}T23:59:59`);

    const bookings = await prisma.booking.findMany({
      where: {
        businessId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        bookingTime: { gte: startOfDay, lte: endOfDay },
      },
      select: { bookingTime: true },
    });

    return bookings.map((b) => {
      const d = new Date(b.bookingTime);
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    });
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
    const existingBooking = await prisma.booking.findFirst({
      where: {
        businessId,
        bookingTime: bookingDate,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (existingBooking) {
      return { success: false, error: 'Избраният час току-що бе зает. Моля, изберете друг час.' };
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
      include: {
        business: true,
        service: true,
      },
    });

    const formattedDate = bookingDate.toLocaleString('bg-BG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    // 1. Имейл към Клиента
    if (booking.customerEmail) {
      await sendEmail({
        to: booking.customerEmail,
        subject: `Заявка за час в ${booking.business.name}`,
        html: `
          <h2>Здравейте, ${customerName}!</h2>
          <p>Вашата заявка за час бе приета успешно.</p>
          <ul>
            <li><strong>Услуга:</strong> ${booking.service.name}</li>
            <li><strong>Дата и час:</strong> ${formattedDate}</li>
            <li><strong>Обект:</strong> ${booking.business.name} (${booking.business.address})</li>
          </ul>
          <p>Очаквайте потвърждение от обекта.</p>
        `,
      });
    }

    // 2. Известие към Собственика на бизнеса
    if (booking.business.email) {
      await sendEmail({
        to: booking.business.email,
        subject: `🚨 Нова резервация: ${booking.service.name}`,
        html: `
          <h2>Нова резервация за ${booking.business.name}</h2>
          <p><strong>Клиент:</strong> ${customerName} (${customerPhone})</p>
          <p><strong>Услуга:</strong> ${booking.service.name}</p>
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

    // Известие към клиента при промяна на статуса
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
          <p>Благодарим Ви, че използвате ${booking.business.name}!</p>
        `,
      });
    }

    revalidatePath(`/${slug}/admin`);
    return { success: true };
  } catch (error) {
    console.error('Грешка при обновяване на статуса:', error);
    return { success: false, error: 'Възникна грешка при обновяването.' };
  }
}export async function deleteBooking(bookingId: string, slug: string) {
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