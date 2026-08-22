import { TIER_META } from '@/lib/tiers';
import type { Tier } from '@/lib/types';

const LETTER: Record<Tier, string> = {
  challenger: 'C', grandmaster: 'GM', master: 'M', diamond: 'D',
  platinum: 'P', gold: 'G', silver: 'S',
};

export function TierBadge({ tier, size = 'sm' }: { tier: Tier; size?: 'sm' | 'lg' }) {
  const { label, color } = TIER_META[tier];
  const px = size === 'lg' ? 40 : 22;
  return (
    <span className="inline-flex items-center gap-1.5" title={label}>
      <svg width={px} height={px} viewBox="0 0 24 24" aria-hidden>
        <path d="M12 1 21 5v7c0 5.2-3.8 9.5-9 11-5.2-1.5-9-5.8-9-11V5l9-4z" fill={color} opacity={0.18} stroke={color} strokeWidth={1.6} />
        <text x="12" y="15.5" textAnchor="middle" fontSize={tier === 'grandmaster' ? 7.5 : 10} fontWeight={800} fill={color}>{LETTER[tier]}</text>
      </svg>
      {size === 'lg' && <span className="font-bold" style={{ color }}>{label}</span>}
      {size === 'sm' && <span className="text-xs font-semibold" style={{ color }}>{label}</span>}
    </span>
  );
}
