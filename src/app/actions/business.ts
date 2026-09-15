'use server';

import { prisma } from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function registerBusinessAction(data: {
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
}) {
  try {
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

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError || !authData.user) {
      return { success: false, error: authError?.message || 'Грешка при регистрация.' };
    }

    const business = await prisma.business.create({
      data: {
        userId: authData.user.id,
        name: data.name,
        slug: data.slug,
        category: data.category,
        phone: data.phone,
        email: data.email,
        address: data.address,
        services: {
          create: {
            name: data.serviceName || 'Стандартна услуга',
            price: Number(data.servicePrice) || 30,
            durationMin: Number(data.serviceDurationMin) || 60,
          },
        },
      },
    });

    return { success: true, slug: business.slug };
  } catch (error: any) {
    console.error('Грешка при регистрация:', error);
    if (error.code === 'P2002') {
      return { success: false, error: 'Бизнес с такъв URL (slug) вече съществува.' };
    }
    return { success: false, error: 'Сървърна грешка при създаване на бизнеса.' };
  }
}