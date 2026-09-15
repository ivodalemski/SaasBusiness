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
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// 1. Добавяне на услуга
export async function createServiceAction(formData: FormData) {
  try {
    const user = await getAuthUser();
    if (!user) return { success: false, error: 'Неоторизиран достъп.' };

    const businessId = formData.get('businessId') as string;
    const slug = formData.get('slug') as string;
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const durationMin = parseInt(formData.get('durationMin') as string, 10);

    if (!name || isNaN(price) || isNaN(durationMin)) {
      return { success: false, error: 'Моля, попълнете всички полета с валидни данни.' };
    }

    // Проверка за собственост над бизнеса
    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business || business.userId !== user.id) {
      return { success: false, error: 'Нямате права за това действие.' };
    }

    await prisma.service.create({
      data: {
        businessId,
        name,
        price,
        durationMin,
      },
    });

    revalidatePath(`/${slug}/admin`);
    return { success: true };
  } catch (error) {
    console.error('Грешка при създаване на услуга:', error);
    return { success: false, error: 'Възникна сървърна грешка.' };
  }
}

// 2. Изтриване на услуга
export async function deleteServiceAction(serviceId: string, businessId: string, slug: string) {
  try {
    const user = await getAuthUser();
    if (!user) return { success: false, error: 'Неоторизиран достъп.' };

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business || business.userId !== user.id) {
      return { success: false, error: 'Нямате права за това действие.' };
    }

    await prisma.service.delete({
      where: { id: serviceId },
    });

    revalidatePath(`/${slug}/admin`);
    return { success: true };
  } catch (error) {
    console.error('Грешка при изтриване на услуга:', error);
    return { success: false, error: 'Възникна грешка при изтриване.' };
  }
}
export { deleteServiceAction as deleteService };
export { createServiceAction as createService };