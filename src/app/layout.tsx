import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google';
import { SessionProvider } from '@/components/SessionProvider';
import { Sidebar } from '@/components/Sidebar';
import './globals.css';

// Geist_Mono is already bundled locally — no external font download needed
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Prime CRM — The Prime Developers',
  description: 'Live work order tracking and financial dashboard.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geistMono.variable}>
      <body>
        <SessionProvider>
          <div className="app-layout">
            <Sidebar />
            <main className="app-content">
              {children}
            </main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
