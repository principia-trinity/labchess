import { describe, expect, test } from 'vitest';
import { OrgSchema, SnapshotSchema, HistoryFileSchema } from '@/lib/types';

export const validOrg = {
  id: 'I121332964', slug: 'mit', name: 'Massachusetts Institute of Technology',
  countryCode: 'US', region: 'us', lat: 42.36, lng: -71.09,
  homepage: 'https://web.mit.edu', logoUrl: 'https://example.com/mit.png',
  type: 'education', papers12mo: 1200, meanCitedness: 8.4,
  citations: 5000000, worksCount: 300000, hIndex: 900,
  topFields: [{ name: 'Machine Learning', count: 400 }],
  topWorks: [{ id: 'https://openalex.org/W1', title: 'A Paper', year: 2026, citations: 42, url: 'https://doi.org/10/x' }],
  lp: 2208, rank: 1, tier: 'challenger', movement: 2,
};

describe('schemas', () => {
  test('valid org parses', () => {
    expect(OrgSchema.parse(validOrg)).toEqual(validOrg);
  });
  test('nullable fields accept null', () => {
    const o = { ...validOrg, countryCode: null, lat: null, lng: null, homepage: null, logoUrl: null, type: null, movement: null };
    expect(OrgSchema.parse(o).movement).toBeNull();
  });
  test('bad tier rejected', () => {
    expect(() => OrgSchema.parse({ ...validOrg, tier: 'bronze' })).toThrow();
  });
  test('bad id rejected', () => {
    expect(() => OrgSchema.parse({ ...validOrg, id: 'X123' })).toThrow();
  });
  test('snapshot parses', () => {
    expect(SnapshotSchema.parse({ generatedAt: '2026-08-22T00:00:00Z', orgs: [validOrg] }).orgs).toHaveLength(1);
  });
  test('history file parses', () => {
    const h = { I121332964: { name: 'MIT', slug: 'mit', entries: [['2026-08-22', 1, 2208]] } };
    expect(HistoryFileSchema.parse(h)).toEqual(h);
  });
});
