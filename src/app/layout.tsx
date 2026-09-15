import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { logoutUserAction } from '@/app/actions/auth';
import './globals.css';

export const metadata: Metadata = {
  title: 'ЧАСНИК',
  description: 'Намерете най-добрите услуги и запазете своя час бързо и лесно с ЧАСНИК.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

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

  const isLoggedIn = !!user;

  return (
    <html lang="bg" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen font-sans antialiased selection:bg-amber-500 selection:text-slate-950 flex flex-col">
        
        {/* Навигационна Лента */}
        <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            
            {/* Лого горе вляво */}
            {isLoggedIn ? (
              <form action={async () => {
                'use server';
                await logoutUserAction('/');
              }}>
                <button
                  type="submit"
                  className="flex items-center gap-3 group text-left cursor-pointer bg-transparent border-none p-0"
                  title="Изход и преминаване към клиентска страница"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 ring-1 ring-amber-300/50 group-hover:scale-105 transition-transform shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 11l2.5-2.5a2.121 2.121 0 0 1 3 3L17 16l-4-4" />
                      <path d="M8 11L5.5 8.5a2.121 2.121 0 0 0-3 3L7 16l4-4" />
                      <path d="M12 11l-2.5 2.5a2.121 2.121 0 0 0 0 3l.5.5a2.121 2.121 0 0 0 3 0l2.5-2.5" />
                      <path d="M14.5 8.5L12 11" />
                    </svg>
                  </div>
                  <span className="font-black text-xl text-slate-100 tracking-tight group-hover:text-amber-400 transition-colors">
                    ЧАСНИК<span className="text-amber-400">.</span>
                  </span>
                </button>
              </form>
            ) : (
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 ring-1 ring-amber-300/50 group-hover:scale-105 transition-transform shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 11l2.5-2.5a2.121 2.121 0 0 1 3 3L17 16l-4-4" />
                    <path d="M8 11L5.5 8.5a2.121 2.121 0 0 0-3 3L7 16l4-4" />
                    <path d="M12 11l-2.5 2.5a2.121 2.121 0 0 0 0 3l.5.5a2.121 2.121 0 0 0 3 0l2.5-2.5" />
                    <path d="M14.5 8.5L12 11" />
                  </svg>
                </div>
                <span className="font-black text-xl text-slate-100 tracking-tight group-hover:text-amber-400 transition-colors">
                  ЧАСНИК<span className="text-amber-400">.</span>
                </span>
              </Link>
            )}

            {/* Навигация горе вдясно */}
            <div className="flex items-center gap-3 sm:gap-4">
              {isLoggedIn ? (
                <form action={async () => {
                  'use server';
                  await logoutUserAction('/');
                }}>
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Изход</span>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </button>
                </form>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-amber-400 transition px-3 py-2"
                  >
                    Вход за бизнеси
                  </Link>
                  <Link
                    href="/register"
                    className="bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md shadow-amber-500/10 transition-all hover:shadow-amber-500/20 flex items-center gap-1.5"
                  >
                    <span>Регистрирай обект</span>
                    <span className="font-mono">→</span>
                  </Link>
                </>
              )}
            </div>

          </div>
        </header>

        {/* Основно Съдържание */}
        <div className="flex-grow">
          {children}
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ЧАСНИК. Всички права са запазени.</p>
        </footer>
      </body>
    </html>
  );
}