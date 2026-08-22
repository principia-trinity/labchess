import { describe, expect, test } from 'vitest';
import { getOrgBySlug, getSnapshot } from '@/lib/data';

describe('data loaders', () => {
  test('snapshot loads and is ranked 1..n', () => {
    const s = getSnapshot();
    expect(s.orgs.length).toBeGreaterThan(100);
    expect(s.orgs[0].rank).toBe(1);
    expect(s.orgs.at(-1)!.rank).toBe(s.orgs.length);
  });
  test('slug lookup roundtrips', () => {
    const s = getSnapshot();
    const hit = getOrgBySlug(s.orgs[0].slug);
    expect(hit?.kind).toBe('active');
  });
  test('unknown slug is null', () => {
    expect(getOrgBySlug('definitely-not-an-org-xyz')).toBeNull();
  });
});
