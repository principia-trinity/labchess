import { describe, expect, test } from 'vitest';
import { assignTier } from '@/lib/tiers';
import { computeLP, computeMovement } from '@/lib/scoring';
import { regionForCountry } from '@/lib/regions';
import { slugify, assignSlugs } from '@/lib/slug';
import { flagEmoji } from '@/lib/flags';
import { logoChain } from '@/lib/logo';

describe('assignTier', () => {
  test.each([
    [1, 'challenger'], [10, 'challenger'], [11, 'grandmaster'], [50, 'grandmaster'],
    [51, 'master'], [150, 'master'], [151, 'diamond'], [350, 'diamond'],
    [351, 'platinum'], [600, 'platinum'], [601, 'gold'], [850, 'gold'],
    [851, 'silver'], [2000, 'silver'],
  ] as const)('rank %i → %s', (rank, tier) => {
    expect(assignTier(rank)).toBe(tier);
  });
});

describe('computeLP', () => {
  test('formula: papers × (1 + min(mc,20)/10), rounded', () => {
    expect(computeLP(100, 5)).toBe(150);
    expect(computeLP(100, 0)).toBe(100);
    expect(computeLP(3, 3.33)).toBe(4); // 3 × 1.333 = 3.999 → 4
  });
  test('meanCitedness capped at 20', () => {
    expect(computeLP(100, 50)).toBe(300); // capped: 100 × 3
  });
});

describe('computeMovement', () => {
  test('climbed 5→2 is +3', () => expect(computeMovement(5, 2)).toBe(3));
  test('fell 2→5 is -3', () => expect(computeMovement(2, 5)).toBe(-3));
  test('no prev is null (NEW)', () => expect(computeMovement(undefined, 4)).toBeNull());
});

describe('regionForCountry', () => {
  test.each([
    ['US', 'us'], ['CN', 'china'], ['GB', 'uk'], ['DE', 'europe'], ['FR', 'europe'],
    ['JP', 'asia'], ['KR', 'asia'], ['HK', 'asia'], ['CA', 'other'], ['AU', 'other'], [null, 'other'],
  ] as const)('%s → %s', (cc, region) => {
    expect(regionForCountry(cc)).toBe(region);
  });
});

describe('slugs', () => {
  test('slugify normalizes', () => {
    expect(slugify('Massachusetts Institute of Technology')).toBe('massachusetts-institute-of-technology');
    expect(slugify('ETH Zürich')).toBe('eth-zurich');
    expect(slugify('清华大学')).toBe('org'); // non-latin falls back
  });
  test('collision gets id suffix, previous slug is stable', () => {
    const prev = new Map([['I2', 'acme-university']]);
    const out = assignSlugs(
      [{ id: 'I2', name: 'Acme University (renamed)' }, { id: 'I7', name: 'Acme University' }],
      prev,
    );
    expect(out.get('I2')).toBe('acme-university'); // stable from prev
    expect(out.get('I7')).toBe('acme-university-7'); // collision → id suffix
  });
});

describe('flagEmoji', () => {
  test('US flag', () => expect(flagEmoji('US')).toBe('🇺🇸'));
  test('null → globe', () => expect(flagEmoji(null)).toBe('🌐'));
});

describe('logoChain', () => {
  test('logo then favicon fallback', () => {
    expect(logoChain('https://x.com/l.png', 'https://web.mit.edu/about')).toEqual([
      'https://x.com/l.png',
      'https://www.google.com/s2/favicons?domain=web.mit.edu&sz=64',
    ]);
  });
  test('bad homepage ignored', () => {
    expect(logoChain(null, 'not a url')).toEqual([]);
  });
});
