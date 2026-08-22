import type { Discovered } from './openalex';
import type { HistoryFile, Org, Snapshot, Work } from './types';
import { computeLP, computeMovement } from './scoring';
import { assignTier } from './tiers';
import { regionForCountry } from './regions';
import { assignSlugs } from './slug';

export function buildSnapshot(opts: {
  date: string;
  discovered: Discovered[];
  institutions: any[];
  worksByOrg: Map<string, Work[]>;
  prev: Snapshot | null;
  maxOrgs?: number;
}): Snapshot {
  const { date, discovered, institutions, worksByOrg, prev, maxOrgs = 1000 } = opts;
  const instById = new Map(institutions.map((r) => [String(r.id).split('/').pop(), r]));
  const prevRankById = new Map((prev?.orgs ?? []).map((o) => [o.id, o.rank]));
  const prevSlugById = new Map((prev?.orgs ?? []).map((o) => [o.id, o.slug]));

  const scored = discovered
    .filter((d) => instById.has(d.id))
    .map((d) => {
      const r = instById.get(d.id)!;
      const meanCitedness = r.summary_stats?.['2yr_mean_citedness'] ?? 0;
      return { d, r, lp: computeLP(d.papers12mo, meanCitedness), meanCitedness };
    })
    .sort((a, b) => b.lp - a.lp || b.d.papers12mo - a.d.papers12mo || String(a.r.display_name).localeCompare(String(b.r.display_name)))
    .slice(0, maxOrgs);

  const slugs = assignSlugs(
    scored.map(({ d, r }) => ({ id: d.id, name: r.display_name })),
    prevSlugById,
  );

  const orgs: Org[] = scored.map(({ d, r, lp, meanCitedness }, i) => {
    const rank = i + 1;
    const topFields: { name: string; count: number }[] = (r.topics ?? r.x_concepts ?? [])
      .slice(0, 5)
      .map((t: any) => ({ name: t.display_name, count: t.count ?? Math.round(t.score ?? 0) }));
    return {
      id: d.id,
      slug: slugs.get(d.id)!,
      name: r.display_name,
      countryCode: r.country_code ?? null,
      region: regionForCountry(r.country_code ?? null),
      lat: r.geo?.latitude ?? null,
      lng: r.geo?.longitude ?? null,
      homepage: r.homepage_url ?? null,
      logoUrl: r.image_url ?? null,
      type: r.type ?? null,
      papers12mo: d.papers12mo,
      meanCitedness,
      citations: r.cited_by_count ?? 0,
      worksCount: r.works_count ?? 0,
      hIndex: r.summary_stats?.h_index ?? 0,
      topFields,
      topWorks: worksByOrg.get(d.id) ?? [],
      lp,
      rank,
      tier: assignTier(rank),
      movement: computeMovement(prevRankById.get(d.id), rank),
    };
  });

  return { generatedAt: date, orgs };
}

export function shrinkGuard(prevCount: number | null, currCount: number): void {
  if (prevCount !== null && currCount < 0.8 * prevCount) {
    throw new Error(`Shrink guard tripped: ${currCount} orgs vs previous ${prevCount} — refusing to commit`);
  }
}

export function appendHistory(history: HistoryFile, snap: Snapshot): HistoryFile {
  const day = snap.generatedAt.slice(0, 10);
  const out: HistoryFile = { ...history };
  for (const org of snap.orgs) {
    const prevEntry = out[org.id] ?? { name: org.name, slug: org.slug, entries: [] };
    const entries = prevEntry.entries.filter(([d]) => d !== day);
    out[org.id] = { name: org.name, slug: org.slug, entries: [...entries, [day, org.rank, org.lp]] };
  }
  return out;
}
