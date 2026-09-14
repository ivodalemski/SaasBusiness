import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface AdminPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BusinessAdminPage({ params }: AdminPageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();

  // 1. Инициализиране на Supabase Сървърен Клиент
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

  // 2. Проверка дали има влязъл потребител
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 3. Вземане на бизнеса от базата данни заедно с неговите резервации и услуги
  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      services: true,
      bookings: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!business) {
    notFound();
  }

  // 4. 🔒 ПРОВЕРКА ЗА СОБСТВЕНОСТ (Защита от достъп до чужд админ панел)
  if (business.userId !== user.id) {
    const ownBusiness = await prisma.business.findFirst({
      where: { userId: user.id },
    });

    if (ownBusiness) {
      redirect(`/${ownBusiness.slug}/admin`);
    } else {
      redirect('/login');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Навигационна лента (Header) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏢</span>
            <div>
              <h1 className="font-bold text-slate-900 text-base sm:text-lg leading-tight">
                {business.name}
              </h1>
              <p className="text-xs text-slate-500">
                Категория: <span className="font-medium text-slate-700">{business.category}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/${business.slug}`}
              target="_blank"
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl transition font-medium flex items-center gap-1"
            >
              <span>🔗</span>
              <span className="hidden sm:inline">Виж клиентската страница</span>
            </Link>

            <Link
  href="/login"
  className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-2 rounded-xl transition font-semibold"
>
  Изход
</Link>
          </div>
        </div>
      </header>

      {/* Основно съдържание */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Бързи Статистики */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl text-xl">📅</div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Общо резервации</p>
              <p className="text-2xl font-black text-slate-900">{business.bookings.length}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xl">🛠️</div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Предлагани услуги</p>
              <p className="text-2xl font-black text-slate-900">{business.services.length}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl text-xl">📍</div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Адрес</p>
              <p className="text-xs font-bold text-slate-800 truncate max-w-[180px]">
                {business.address || 'Не е посочен'}
              </p>
            </div>
          </div>
        </div>

        {/* Секция: Таблица с резервации */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Последно направени резервации</h2>
              <p className="text-xs text-slate-500">Списък на всички записани часчета от клиенти</p>
            </div>
          </div>

          {business.bookings.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <span className="text-4xl">📭</span>
              <p className="text-sm font-semibold text-slate-700">Все още няма направени резервации.</p>
              <p className="text-xs text-slate-400">
                Споделете вашия линк <span className="font-mono text-blue-600">localhost:3000/{business.slug}</span> с клиенти.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-6">Клиент</th>
                    <th className="py-3 px-6">Услуга</th>
                    <th className="py-3 px-6">Дата & Час</th>
                    <th className="py-3 px-6">Телефон</th>
                    <th className="py-3 px-6">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {business.bookings.map((booking: any) => (
                    <tr key={booking.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-6 font-semibold text-slate-900">{booking.customerName}</td>
                      <td className="py-4 px-6 text-slate-700">{booking.serviceName || 'Стандартна услуга'}</td>
                      <td className="py-4 px-6 text-slate-600 font-mono text-xs">
                        {booking.bookingDate
                          ? new Date(booking.bookingDate).toLocaleString('bg-BG', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : 'Непосочена дата'}
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-mono text-xs">{booking.customerPhone}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          Потвърдена
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Секция: Активни услуги */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Вашите Услуги и Цени</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {business.services.map((service: any) => (
              <div key={service.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 space-y-2">
                <p className="font-bold text-slate-900 text-sm">{service.name}</p>
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>Времетраене: {service.durationMin} мин.</span>
                  <span className="text-blue-600 font-bold">{service.price} лв.</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}