import Link from 'next/link';
import { SearchBox } from './SearchBox';
import type { SearchEntry } from '@/lib/types';

export function Navbar({ searchEntries }: { searchEntries: SearchEntry[] }) {
  return (
    <nav className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg-panel)]/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          lab<span className="text-[var(--accent)]">chess</span>
        </Link>
        <div className="flex gap-4 text-sm text-[var(--text-dim)]">
          <Link href="/" className="hover:text-[var(--text)]">Map</Link>
          <Link href="/leaderboard" className="hover:text-[var(--text)]">Leaderboard</Link>
          <Link href="/about" className="hover:text-[var(--text)]">About</Link>
        </div>
        <div className="ml-auto"><SearchBox entries={searchEntries} /></div>
      </div>
    </nav>
  );
}
