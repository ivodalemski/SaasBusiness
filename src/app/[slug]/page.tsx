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
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <h1 className="text-3xl font-extrabold text-slate-900">{business.name}</h1>
          <p className="text-sm text-slate-500 mt-2">📍 {business.address} | 📞 {business.phone}</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
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