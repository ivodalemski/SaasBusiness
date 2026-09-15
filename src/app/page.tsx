import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function Home() {
  const businesses = await prisma.business.findMany({
    include: { services: true },
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      
      {/* Светлинни ефекти във фона */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        
        {/* HERO СЕКЦИЯ */}
        <div className="text-center space-y-6 pt-6 sm:pt-10 max-w-6xl mx-auto">
          
          {/* Бадж */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs sm:text-sm font-semibold tracking-wide shadow-sm">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 11l2.5-2.5a2.121 2.121 0 0 1 3 3L17 16l-4-4" />
              <path d="M8 11L5.5 8.5a2.121 2.121 0 0 0-3 3L7 16l4-4" />
              <path d="M12 11l-2.5 2.5a2.121 2.121 0 0 0 0 3l.5.5a2.121 2.121 0 0 0 3 0l2.5-2.5" />
              <path d="M14.5 8.5L12 11" />
            </svg>
            <span>Не, не часовник. <strong className="text-amber-300 underline underline-offset-2">Часник.</strong></span>
          </div>

          {/* Основно заглавие - ГАРАНТИРАНИ ТОЧНО 2 РЕДА */}
          <h1 className="font-black text-slate-100 tracking-tight leading-tight flex flex-col items-center gap-1 sm:gap-2">
            {/* РЕД 1 */}
            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] xl:text-5xl md:whitespace-nowrap">
              Мястото, където намираш{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600">
                свободния час
              </span>
            </span>
            
            {/* РЕД 2 */}
            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] xl:text-5xl md:whitespace-nowrap text-slate-100">
              за всичко, което ти предстои.
            </span>
          </h1>

          {/* Акцентни стъпки: Намери • Избери • Запази */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 text-amber-400 font-extrabold text-xs sm:text-sm tracking-widest uppercase pt-2">
            <span>Намери</span>
            <span className="text-slate-700">•</span>
            <span>Избери</span>
            <span className="text-slate-700">•</span>
            <span>Запази</span>
          </div>

          {/* Финално послание */}
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto font-normal leading-relaxed">
            Всичко, което ти трябва, на един час разстояние.
          </p>
        </div>

        {/* КАТАЛОГ С ОБЕКТИ */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <span className="text-amber-400">🏛️</span>
              <span>Регистрирани Бизнеси</span>
            </h2>
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
              {businesses.length} {businesses.length === 1 ? 'обект' : 'обекта'}
            </span>
          </div>

          {businesses.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/30 border border-slate-800/80 rounded-2xl">
              <p className="text-slate-500 text-sm">Все още няма регистрирани обекти в ЧАСНИК.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((b) => (
                <div
                  key={b.id}
                  className="group bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800/80 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="space-y-4">
                    {/* Категория & Брой Услуги */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 uppercase tracking-widest px-2.5 py-1 rounded-md">
                        {b.category}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        🛠️ {b.services.length} {b.services.length === 1 ? 'услуга' : 'услуги'}
                      </span>
                    </div>

                    {/* Име & Информация */}
                    <div>
                      <h3 className="text-xl font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                        {b.name}
                      </h3>
                      <p className="text-slate-400 text-xs mt-2 flex items-center gap-1.5">
                        <span>📍</span>
                        <span className="truncate">{b.address}</span>
                      </p>
                    </div>

                    {/* Предлагани услуги */}
                    {b.services.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/50">
                        <div className="text-[11px] text-slate-500 font-medium mb-1.5">Предлагани услуги:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {b.services.slice(0, 3).map((s) => (
                            <span
                              key={s.id}
                              className="text-[11px] bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md"
                            >
                              {s.name} ({s.price} лв.)
                            </span>
                          ))}
                          {b.services.length > 3 && (
                            <span className="text-[11px] text-slate-500 py-0.5">
                              +{b.services.length - 3} още
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Бутон */}
                  <div className="mt-6 pt-4 border-t border-slate-800/80">
                    <Link
                      href={`/${b.slug}`}
                      className="w-full inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-amber-400 text-slate-200 hover:text-slate-950 font-bold text-xs py-3 rounded-xl border border-slate-800 hover:border-amber-400 transition-all duration-200 shadow-sm"
                    >
                      <span>Запази час</span>
                      <span className="text-amber-400 group-hover:text-slate-950 font-mono">→</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}