import type { Tier } from './types';

const CUTOFFS: [Tier, number][] = [
  ['challenger', 10], ['grandmaster', 50], ['master', 150],
  ['diamond', 350], ['platinum', 600], ['gold', 850],
];

export function assignTier(rank: number): Tier {
  for (const [tier, max] of CUTOFFS) if (rank <= max) return tier;
  return 'silver';
}

export const TIER_META: Record<Tier, { label: string; color: string }> = {
  challenger: { label: 'Challenger', color: '#f4c874' },
  grandmaster: { label: 'Grandmaster', color: '#ef4444' },
  master: { label: 'Master', color: '#a855f7' },
  diamond: { label: 'Diamond', color: '#3b82f6' },
  platinum: { label: 'Platinum', color: '#14b8a6' },
  gold: { label: 'Gold', color: '#eab308' },
  silver: { label: 'Silver', color: '#9ca3af' },
};
