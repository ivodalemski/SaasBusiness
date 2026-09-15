import { prisma } from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { logoutUserAction } from '@/app/actions/auth';

interface AdminPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BusinessAdminPage({ params }: AdminPageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();

  // 1. Проверка за логнат потребител през Supabase
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

  if (!user) {
    redirect('/login');
  }

  // 2. Вземане на данните за бизнеса и неговите услуги
  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      services: true,
    },
  });

  if (!business || business.userId !== user.id) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Хедър на Таблото */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
              Административен панел
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 mt-2">
              {business.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Управление на услуги и резервации
            </p>
          </div>

          {/* Бутон "Клиентска страница" - Излиза от профила и отваря публичната страница */}
          <form
            action={async () => {
              'use server';
              await logoutUserAction(`/${slug}`);
            }}
          >
            <button
              type="submit"
              className="bg-slate-900 hover:bg-amber-400 hover:text-slate-950 text-slate-300 border border-slate-800 font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Клиентска страница</span>
              <span className="font-mono">→</span>
            </button>
          </form>
        </div>

        {/* Секция с Услуги */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-amber-400">🛠️</span>
              <span>Предлагани Услуги</span>
            </h2>
          </div>

          {/* Таблица с Услуги (Без излишен бутон за изход отгоре) */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
            {business.services.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                Все още нямати добавени услуги.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Име на услугата</th>
                      <th className="px-6 py-4">Продължителност</th>
                      <th className="px-6 py-4 text-right">Цена</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {business.services.map((service) => (
                      <tr key={service.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-100">
                          {service.name}
                        </td>
                        <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                          ⏱️ {service.duration} мин.
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-amber-400 font-mono">
                          {service.price} лв.
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}