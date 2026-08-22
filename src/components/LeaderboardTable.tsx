'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { LeaderboardRow } from '@/lib/types';
import { flagEmoji } from '@/lib/flags';
import { TierBadge } from './TierBadge';
import { OrgLogo } from './OrgLogo';
import { Movement } from './Movement';

export function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  const [q, setQ] = useState('');
  const shown = q ? rows.filter((r) => r.name.toLowerCase().includes(q.toLowerCase())) : rows;
  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search organizations…"
        className="mb-3 w-full max-w-sm rounded-md border border-[var(--border)] bg-[var(--bg-panel)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
      />
      <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="bg-[var(--bg-panel)] text-left text-xs text-[var(--text-dim)]">
              <th className="px-3 py-2">#</th><th className="px-1 py-2" /><th className="px-3 py-2">Organization</th>
              <th className="px-3 py-2">Tier</th><th className="px-3 py-2 text-right">LP</th>
              <th className="px-3 py-2 text-right">Papers (12mo)</th><th className="px-3 py-2 text-right">Citations</th>
              <th className="px-3 py-2">Top field</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.slug} className="border-t border-[var(--border)] bg-[var(--bg-row)] hover:bg-[var(--bg-panel)]">
                <td className="px-3 py-2 font-bold text-[var(--text-dim)]">{r.regionRank}</td>
                <td className="px-1 py-2"><Movement value={r.movement} /></td>
                <td className="px-3 py-2">
                  <Link href={`/org/${r.slug}`} className="flex items-center gap-2.5 font-semibold hover:text-[var(--accent)]">
                    <OrgLogo name={r.name} logoUrl={r.logoUrl} homepage={r.homepage} size={26} />
                    <span>{r.name}</span>
                    <span aria-hidden>{flagEmoji(r.countryCode)}</span>
                  </Link>
                </td>
                <td className="px-3 py-2"><TierBadge tier={r.tier} /></td>
                <td className="px-3 py-2 text-right font-bold text-[var(--accent)]">{r.lp.toLocaleString()}</td>
                <td className="px-3 py-2 text-right">{r.papers12mo.toLocaleString()}</td>
                <td className="px-3 py-2 text-right text-[var(--text-dim)]">{r.citations.toLocaleString()}</td>
                <td className="px-3 py-2 text-[var(--text-dim)]">{r.topField ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
