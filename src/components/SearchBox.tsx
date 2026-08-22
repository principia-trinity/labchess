'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { SearchEntry } from '@/lib/types';
import { OrgLogo } from './OrgLogo';
import { TierBadge } from './TierBadge';

export function SearchBox({ entries }: { entries: SearchEntry[] }) {
  const [q, setQ] = useState('');
  const hits = q.length >= 2
    ? entries.filter((e) => e.name.toLowerCase().includes(q.toLowerCase())).slice(0, 8)
    : [];
  return (
    <div className="relative">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search orgs…"
        aria-label="Search organizations"
        className="w-44 rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-sm outline-none focus:border-[var(--accent)] sm:w-64"
      />
      {hits.length > 0 && (
        <ul className="absolute right-0 top-10 z-50 w-72 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] shadow-xl">
          {hits.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/org/${e.slug}`}
                onClick={() => setQ('')}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--bg-row)]"
              >
                <OrgLogo name={e.name} logoUrl={e.logoUrl} homepage={e.homepage} size={20} />
                <span className="min-w-0 flex-1 truncate">{e.name}</span>
                <span className="text-xs text-[var(--text-dim)]">#{e.rank}</span>
                <TierBadge tier={e.tier} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
