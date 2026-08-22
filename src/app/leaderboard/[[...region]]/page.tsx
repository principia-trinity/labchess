import { notFound } from 'next/navigation';
import { getSnapshot } from '@/lib/data';
import { REGIONS, type LeaderboardRow, type Region } from '@/lib/types';
import { RegionTabs } from '@/components/RegionTabs';
import { TierDistribution } from '@/components/TierDistribution';
import { LeaderboardTable } from '@/components/LeaderboardTable';

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ region: [] }, ...REGIONS.map((r) => ({ region: [r] }))];
}

export default async function LeaderboardPage({ params }: { params: Promise<{ region?: string[] }> }) {
  const { region } = await params;
  const sel = (region?.[0] ?? 'global') as Region | 'global';
  if (region && !REGIONS.includes(region[0] as Region)) notFound();

  const snap = getSnapshot();
  const orgs = sel === 'global' ? snap.orgs : snap.orgs.filter((o) => o.region === sel);
  const rows: LeaderboardRow[] = orgs.map((o, i) => ({
    regionRank: i + 1, slug: o.slug, name: o.name, countryCode: o.countryCode,
    logoUrl: o.logoUrl, homepage: o.homepage, lp: o.lp, rank: o.rank, tier: o.tier,
    movement: o.movement, papers12mo: o.papers12mo, citations: o.citations,
    topField: o.topFields[0]?.name ?? null,
  }));

  return (
    <div className="flex flex-col gap-4 py-6">
      <h1 className="text-2xl font-extrabold">Leaderboard</h1>
      <RegionTabs base="/leaderboard" selected={sel} />
      <TierDistribution orgs={orgs} />
      <LeaderboardTable rows={rows} />
      <p className="text-xs text-[var(--text-dim)]">
        Updated {snap.generatedAt.slice(0, 10)} · data from OpenAlex · movement vs. previous weekly snapshot
      </p>
    </div>
  );
}
