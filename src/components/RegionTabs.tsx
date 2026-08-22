import Link from 'next/link';
import { REGION_LABELS } from '@/lib/regions';
import { REGIONS, type Region } from '@/lib/types';

export function RegionTabs({ base, selected }: { base: string; selected: Region | 'global' }) {
  const tabs: (Region | 'global')[] = ['global', ...REGIONS];
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] p-1">
      {tabs.map((r) => (
        <Link
          key={r}
          href={r === 'global' ? base : `${base}/${r}`}
          className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
            r === selected ? 'bg-[var(--accent)] text-black' : 'text-[var(--text-dim)] hover:text-[var(--text)]'
          }`}
        >
          {REGION_LABELS[r]}
        </Link>
      ))}
    </div>
  );
}
