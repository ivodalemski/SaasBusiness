import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function Home() {
  const businesses = await prisma.business.findMany({
    include: { services: true },
  });

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            SaaS Платформа за Онлайн Резервации
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Изберете обект от каталога, за да прегледате неговата страница за резервации:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {businesses.map((b) => (
            <div key={b.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                {b.category}
              </span>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">{b.name}</h2>
              <p className="text-gray-500 text-sm mt-1">📍 {b.address} • {b.services.length} предлагани услуги</p>
              
              <div className="mt-6">
                <Link
                  href={`/${b.slug}`}
                  className="inline-block w-full text-center bg-gray-900 text-white font-medium py-2.5 rounded-lg hover:bg-gray-800 transition"
                >
                  Отвори линк: /{b.slug}
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}