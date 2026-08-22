import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'labchess — the AI research ladder',
  description: 'lolchess-style rankings for AI research organizations, powered by OpenAlex.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen antialiased`}>
        <Navbar />
        <main className="mx-auto max-w-7xl px-4">{children}</main>
      </body>
    </html>
  );
}
