import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ServicesManager from './ServicesManager';
import BookingsManager from './BookingsManager';

interface AdminPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BusinessAdminPage({ params }: AdminPageProps) {
  const { slug } = await params;

  // Извличаме бизнеса ЗАЕДНО с услугите И резервациите
  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      services: true,
      bookings: {
        include: {
          service: true,
        },
        orderBy: {
          bookingTime: 'desc',
        },
      },
    },
  });

  if (!business) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="border-b border-slate-800 pb-5">
          <h1 className="text-2xl font-bold text-slate-100">Административен панел - {business.name}</h1>
          <p className="text-xs text-slate-400 mt-1">
            Адрес: {business.address} | Публичен линк: /{business.slug}
          </p>
        </div>

        {/* 1. Секция с Получените Резервации */}
        <BookingsManager
          bookings={business.bookings || []}
          slug={business.slug}
        />

        {/* 2. Секция с Управление на Услугите */}
        <ServicesManager
          businessId={business.id}
          slug={business.slug}
          services={business.services}
        />
      </div>
    </main>
  );
}