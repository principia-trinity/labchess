import { describe, expect, test } from 'vitest';
import { appendHistory, buildSnapshot, shrinkGuard } from '@/lib/refresh-core';
import type { HistoryFile, Snapshot } from '@/lib/types';

const inst = (id: string, name: string, opts: Partial<Record<string, any>> = {}) => ({
  id: `https://openalex.org/${id}`,
  display_name: name,
  country_code: opts.cc ?? 'US',
  geo: opts.geo === null ? undefined : { latitude: 40, longitude: -70 },
  homepage_url: 'https://example.edu',
  image_url: 'https://img/x.png',
  type: 'education',
  works_count: 1000,
  cited_by_count: 50000,
  summary_stats: { '2yr_mean_citedness': opts.mc ?? 5, h_index: 100 },
  topics: [{ display_name: 'Machine Learning', count: 40 }],
});

function build(overrides: Partial<Parameters<typeof buildSnapshot>[0]> = {}) {
  return buildSnapshot({
    date: '2026-08-22T00:00:00Z',
    discovered: [
      { id: 'I1', papers12mo: 200 },
      { id: 'I2', papers12mo: 100 },
      { id: 'I9', papers12mo: 999 }, // no institution record → dropped
    ],
    institutions: [inst('I1', 'Alpha University'), inst('I2', 'Beta Lab', { mc: 30 })],
    worksByOrg: new Map([['I1', []], ['I2', []]]),
    prev: null,
    ...overrides,
  });
}

describe('buildSnapshot', () => {
  test('ranks by LP desc, assigns tier and slug, drops unknown institutions', () => {
    const snap = build();
    // I1: 200 × 1.5 = 300; I2: 100 × 3 (capped) = 300 → tie broken by papers12mo desc
    expect(snap.orgs.map((o) => o.id)).toEqual(['I1', 'I2']);
    expect(snap.orgs[0]).toMatchObject({ rank: 1, tier: 'challenger', lp: 300, slug: 'alpha-university', region: 'us', movement: null });
  });
  test('movement computed against prev snapshot ranks', () => {
    const prev = build();
    const snap = build({
      prev,
      discovered: [{ id: 'I2', papers12mo: 500 }, { id: 'I1', papers12mo: 100 }],
    });
    const byId = Object.fromEntries(snap.orgs.map((o) => [o.id, o]));
    expect(byId.I2.movement).toBe(1);  // was 2, now 1
    expect(byId.I1.movement).toBe(-1); // was 1, now 2
  });
  test('slugs stay stable via prev', () => {
    const prev = build();
    const snap = build({
      prev,
      institutions: [inst('I1', 'Alpha University (Renamed)'), inst('I2', 'Beta Lab')],
    });
    expect(snap.orgs.find((o) => o.id === 'I1')?.slug).toBe('alpha-university');
  });
  test('missing geo → null lat/lng, still on ladder', () => {
    const snap = build({ institutions: [inst('I1', 'Alpha University', { geo: null }), inst('I2', 'Beta Lab')] });
    const a = snap.orgs.find((o) => o.id === 'I1')!;
    expect(a.lat).toBeNull();
    expect(a.rank).toBeGreaterThan(0);
  });
  test('maxOrgs truncates', () => {
    expect(build({ maxOrgs: 1 }).orgs).toHaveLength(1);
  });
});

describe('shrinkGuard', () => {
  test('throws below 80% of previous', () => {
    expect(() => shrinkGuard(1000, 799)).toThrow();
    expect(() => shrinkGuard(1000, 800)).not.toThrow();
    expect(() => shrinkGuard(null, 5)).not.toThrow(); // first run
  });
});

describe('appendHistory', () => {
  test('appends and is idempotent per date, does not mutate input', () => {
    const snap: Snapshot = build();
    const h0: HistoryFile = {};
    const h1 = appendHistory(h0, snap);
    const h2 = appendHistory(h1, snap); // rerun same day
    expect(h0).toEqual({});
    expect(h1.I1.entries).toEqual([['2026-08-22', 1, 300]]);
    expect(h2.I1.entries).toHaveLength(1);
  });
});
