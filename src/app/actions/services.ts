'use server';

import { prisma } from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

async function getAuthUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function createService(formData: FormData) {
  try {
    const user = await getAuthUser();
    if (!user) return { success: false, error: 'Неоторизиран достъп. Моля, влезте отново.' };

    const businessId = formData.get('businessId') as string;
    const slug = formData.get('slug') as string;
    const name = formData.get('name') as string;
    const priceStr = formData.get('price') as string;
    const durationStr = (formData.get('durationMin') || formData.get('duration')) as string;

    if (!businessId || businessId.trim() === '') {
      return { success: false, error: 'Грешка: Не е намерено ID на бизнеса.' };
    }

    const price = parseFloat(priceStr);
    const durationMin = parseInt(durationStr, 10);

    if (!name || isNaN(price) || isNaN(durationMin)) {
      return { success: false, error: 'Моля, попълнете всички полета с валидни данни.' };
    }

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business || business.userId !== user.id) {
      return { success: false, error: 'Нямате права за редакция на този бизнес.' };
    }

    await prisma.service.create({
      data: {
        businessId,
        name,
        price,
        durationMin,
      },
    });

    const targetSlug = slug || business.slug;
    if (targetSlug) {
      revalidatePath(`/${targetSlug}/admin`);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Грешка при създаване на услуга:', error);
    return { success: false, error: 'Сървърна грешка при запис.' };
  }
}

export async function updateService(formData: FormData) {
  try {
    const user = await getAuthUser();
    if (!user) return { success: false, error: 'Неоторизиран достъп.' };

    const serviceId = formData.get('serviceId') as string;
    const slug = formData.get('slug') as string;
    const name = formData.get('name') as string;
    const priceStr = formData.get('price') as string;
    const durationStr = (formData.get('durationMin') || formData.get('duration')) as string;

    if (!serviceId) {
      return { success: false, error: 'Липсва ID на услугата за дублиране/редакция.' };
    }

    const price = parseFloat(priceStr);
    const durationMin = parseInt(durationStr, 10);

    if (!name || isNaN(price) || isNaN(durationMin)) {
      return { success: false, error: 'Моля, попълнете всички полета с валидни данни.' };
    }

    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { business: true },
    });

    if (!existingService || existingService.business.userId !== user.id) {
      return { success: false, error: 'Нямате права за промяна на тази услуга.' };
    }

    await prisma.service.update({
      where: { id: serviceId },
      data: {
        name,
        price,
        durationMin,
      },
    });

    const targetSlug = slug || existingService.business.slug;
    if (targetSlug) {
      revalidatePath(`/${targetSlug}/admin`);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Грешка при редактиране на услуга:', error);
    return { success: false, error: 'Сървърна грешка при обновяване.' };
  }
}

export async function deleteService(serviceId: string, slug: string) {
  try {
    const user = await getAuthUser();
    if (!user) return { success: false, error: 'Неоторизиран достъп.' };

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { business: true },
    });

    if (!service || service.business.userId !== user.id) {
      return { success: false, error: 'Нямате права за изтриване.' };
    }

    await prisma.service.delete({ where: { id: serviceId } });

    const targetSlug = slug || service.business.slug;
    if (targetSlug) {
      revalidatePath(`/${targetSlug}/admin`);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Грешка при изтриване на услугата.' };
  }
}