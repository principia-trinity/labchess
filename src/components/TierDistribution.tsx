import { TIER_META } from '@/lib/tiers';
import { TIERS, type Org } from '@/lib/types';

export function TierDistribution({ orgs }: { orgs: Org[] }) {
  const counts = TIERS.map((t) => ({ tier: t, n: orgs.filter((o) => o.tier === t).length }));
  const max = Math.max(1, ...counts.map((c) => c.n));
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] p-4">
      <h2 className="mb-3 text-sm font-bold text-[var(--text-dim)]">Tier distribution</h2>
      <div className="flex h-28 items-end gap-2">
        {counts.map(({ tier, n }) => (
          <div key={tier} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-xs text-[var(--text-dim)]">{n}</span>
            <div className="w-full rounded-t" style={{ height: `${(n / max) * 80}px`, background: TIER_META[tier].color, opacity: 0.85 }} />
            <span className="text-[10px] font-semibold" style={{ color: TIER_META[tier].color }}>{TIER_META[tier].label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
