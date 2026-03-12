import './globals.css';
import Link from 'next/link';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Interactive Video Quiz Studio',
  description: 'MVP инструмент для интерактивных видео с квизами'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className="dark">
      <body>
        <header className="border-b border-slate-800 bg-slate-950/90">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold text-cyan-400">
              QuizVideo Studio
            </Link>
            <div className="flex gap-4 text-sm text-slate-300">
              <Link href="/">Проекты</Link>
              <Link href="/editor">Новый проект</Link>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
