import React from 'react';
import { prisma } from '@/lib/prisma';
import BookingForm from './BookingForm';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicBookingPage({ params }: PageProps) {
  const { slug } = await params;

  const business = await prisma.business.findUnique({
    where: { slug },
    include: { services: true },
  });

  if (!business) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 selection:bg-amber-500 selection:text-slate-950 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Шапка / Информация за бизнеса */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-800/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 ring-1 ring-amber-300/50 shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 11l2.5-2.5a2.121 2.121 0 0 1 3 3L17 16l-4-4" />
                <path d="M8 11L5.5 8.5a2.121 2.121 0 0 0-3 3L7 16l4-4" />
                <path d="M12 11l-2.5 2.5a2.121 2.121 0 0 0 0 3l.5.5a2.121 2.121 0 0 0 3 0l2.5-2.5" />
                <path d="M14.5 8.5L12 11" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                {business.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 flex flex-wrap items-center gap-2">
                <span>📍 {business.address}</span>
                <span className="text-slate-700">•</span>
                <span className="text-amber-400 font-mono">📞 {business.phone}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Форма за резервация */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-800/80">
          <BookingForm
            businessId={business.id}
            businessName={business.name}
            services={business.services}
          />
        </div>

      </div>
    </main>
  );
}