'use server';

import { prisma } from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  slug: string;
  category: string;
  phone: string;
  address: string;
  serviceName: string;
  servicePrice: number;
  serviceDurationMin: number;
}

export async function registerBusinessAction(formData: RegisterInput) {
  try {
    const cookieStore = await cookies();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // ДЕБЪГ ЛОГОВЕ В ТЕРМИНАЛА
    console.log('--- ОПИТ ЗА РЕГИСТРАЦИЯ ---');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Key намерен ли е?:', !!supabaseKey);

    if (!supabaseUrl || !supabaseKey) {
      return {
        success: false,
        error: 'Липсват Supabase променливи в .env файла!',
      };
    }

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Игнорира се при сървърно изпълнение
          }
        },
      },
    });

    // 1. Почистване на slug-а
    const cleanSlug = formData.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-');

    if (!cleanSlug) {
      return { success: false, error: 'Моля, въведете валиден URL адрес (slug).' };
    }

    // 2. Проверка за съществуващ slug
    const existing = await prisma.business.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return {
        success: false,
        error: 'Този URL адрес вече е зает. Изберете друг.',
      };
    }

    // 3. Създаване на акаунта в Supabase Auth
    console.log('Изпращане на заявка към Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      console.error('Грешка от Supabase Auth:', authError);
      return {
        success: false,
        error: `Supabase грешка: ${authError.message}`,
      };
    }

    if (!authData.user) {
      return { success: false, error: 'Не бе създаден потребителски акаунт.' };
    }

    console.log('Потребителят е създаден успешно в Supabase с ID:', authData.user.id);

    // 4. Влизане в акаунта (генериране на сесийни бисквитки)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (signInError) {
      console.error('Грешка при автоматичен вход:', signInError);
    }

    // 5. Записване на бизнеса и първата услуга в базата данни (Prisma)
    const business = await prisma.business.create({
      data: {
        userId: authData.user.id,
        name: formData.name,
        slug: cleanSlug,
        category: formData.category,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        services: {
          create: [
            {
              name: formData.serviceName || 'Основна услуга',
              price: Number(formData.servicePrice),
              durationMin: Number(formData.serviceDurationMin),
            },
          ],
        },
      },
    });

    console.log('Бизнесът е записан успешно в PostgreSQL базата с ID:', business.id);

    return { success: true, slug: business.slug };
  } catch (error: any) {
    console.error('Критична грешка в Server Action:', error);
    return { success: false, error: `Сървърна грешка: ${error?.message || 'Неизвестна грешка'}` };
  }
}