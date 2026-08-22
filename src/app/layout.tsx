import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { getSnapshot } from '@/lib/data';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'labchess — the AI research ladder',
  description: 'lolchess-style rankings for AI research organizations, powered by OpenAlex.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const searchEntries = getSnapshot().orgs.map((o) => ({
    slug: o.slug, name: o.name, rank: o.rank, tier: o.tier, logoUrl: o.logoUrl, homepage: o.homepage,
  }));
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen antialiased`}>
        <Navbar searchEntries={searchEntries} />
        <main className="mx-auto max-w-7xl px-4">{children}</main>
      </body>
    </html>
  );
}
