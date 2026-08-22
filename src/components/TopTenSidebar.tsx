import Link from 'next/link';
import type { MapOrg } from '@/lib/types';
import { TierBadge } from './TierBadge';
import { OrgLogo } from './OrgLogo';

export function TopTenSidebar({ orgs }: { orgs: MapOrg[] }) {
  const top = [...orgs].sort((a, b) => b.lp - a.lp).slice(0, 10);
  return (
    <aside className="rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-3">
      <h2 className="mb-2 text-sm font-bold text-[var(--text-dim)]">Top 10 · Global</h2>
      <ol className="flex flex-col gap-1">
        {top.map((o, i) => (
          <li key={o.slug}>
            <Link href={`/org/${o.slug}`} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-[var(--bg-row)]">
              <span className="w-5 text-right font-bold text-[var(--text-dim)]">{i + 1}</span>
              <OrgLogo name={o.name} logoUrl={o.logoUrl} homepage={o.homepage} size={22} />
              <span className="min-w-0 flex-1 truncate font-semibold">{o.name}</span>
              <TierBadge tier={o.tier} />
            </Link>
          </li>
        ))}
      </ol>
      <Link href="/leaderboard" className="mt-2 block text-center text-xs font-semibold text-[var(--accent)] hover:underline">
        Full leaderboard →
      </Link>
    </aside>
  );
}
