import { z } from 'zod';

export const TIERS = ['challenger', 'grandmaster', 'master', 'diamond', 'platinum', 'gold', 'silver'] as const;
export type Tier = (typeof TIERS)[number];

export const REGIONS = ['us', 'china', 'europe', 'uk', 'asia', 'other'] as const;
export type Region = (typeof REGIONS)[number];

const httpUrl = z.string().refine((u) => /^https?:\/\//.test(u), { message: 'must be http(s) URL' });

export const WorkSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  year: z.number().int(),
  citations: z.number().int().nonnegative(),
  url: httpUrl.nullable(),
});
export type Work = z.infer<typeof WorkSchema>;

export const OrgSchema = z.object({
  id: z.string().regex(/^I\d+$/),
  slug: z.string().min(1),
  name: z.string().min(1),
  countryCode: z.string().length(2).nullable(),
  region: z.enum(REGIONS),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  homepage: httpUrl.nullable(),
  logoUrl: httpUrl.nullable(),
  type: z.string().nullable(),
  papers12mo: z.number().int().nonnegative(),
  meanCitedness: z.number().nonnegative(),
  citations: z.number().int().nonnegative(),
  worksCount: z.number().int().nonnegative(),
  hIndex: z.number().int().nonnegative(),
  topFields: z.array(z.object({ name: z.string(), count: z.number() })),
  topWorks: z.array(WorkSchema),
  lp: z.number().int().nonnegative(),
  rank: z.number().int().positive(),
  tier: z.enum(TIERS),
  movement: z.number().int().nullable(),
});
export type Org = z.infer<typeof OrgSchema>;

export const SnapshotSchema = z.object({
  generatedAt: z.string(),
  orgs: z.array(OrgSchema),
});
export type Snapshot = z.infer<typeof SnapshotSchema>;

export const HistoryFileSchema = z.record(
  z.string(),
  z.object({
    name: z.string(),
    slug: z.string(),
    entries: z.array(z.tuple([z.string(), z.number(), z.number()])), // [isoDate, rank, lp]
  }),
);
export type HistoryFile = z.infer<typeof HistoryFileSchema>;

// Slim payloads for client components (no zod needed — derived server-side).
export interface LeaderboardRow {
  regionRank: number;
  slug: string; name: string; countryCode: string | null;
  logoUrl: string | null; homepage: string | null;
  lp: number; rank: number; tier: Tier; movement: number | null;
  papers12mo: number; citations: number; topField: string | null;
}
export interface MapOrg {
  slug: string; name: string; countryCode: string | null; region: Region;
  lat: number | null; lng: number | null;
  logoUrl: string | null; homepage: string | null;
  lp: number; rank: number; tier: Tier;
  papers12mo: number; citations: number;
}
export interface SearchEntry { slug: string; name: string; rank: number; tier: Tier; logoUrl: string | null; homepage: string | null; }
