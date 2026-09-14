'use server';

import { prisma } from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function loginUserAction(email: string, password: string) {
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
            } catch {
              // Игнорира се при сървърно изпълнение
            }
          },
        },
      }
    );

    // 1. Влизане с имейл и парола
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return { success: false, error: 'Грешен имейл или парола.' };
    }

    // 2. Намираме бизнеса, който принадлежи на този потребител
    const business = await prisma.business.findFirst({
      where: { userId: authData.user.id },
    });

    if (!business) {
      return { success: false, error: 'Не бе намерен регистриран бизнес за този акаунт.' };
    }

    return { success: true, slug: business.slug };
  } catch (error) {
    console.error('Грешка при вход:', error);
    return { success: false, error: 'Възникна сървърна грешка при влизане.' };
  }
}