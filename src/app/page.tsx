import { getSnapshot } from '@/lib/data';
import type { MapOrg } from '@/lib/types';
import { MapView } from '@/components/MapView';
import { TopTenSidebar } from '@/components/TopTenSidebar';

export default function Home() {
  const snap = getSnapshot();
  const orgs: MapOrg[] = snap.orgs.map((o) => ({
    slug: o.slug, name: o.name, countryCode: o.countryCode, region: o.region,
    lat: o.lat, lng: o.lng, logoUrl: o.logoUrl, homepage: o.homepage,
    lp: o.lp, rank: o.rank, tier: o.tier, papers12mo: o.papers12mo, citations: o.citations,
  }));
  return (
    <div className="grid gap-4 py-6 lg:grid-cols-[1fr_280px]">
      <div>
        <h1 className="mb-1 text-2xl font-extrabold">The AI Research Ladder</h1>
        <p className="mb-4 text-sm text-[var(--text-dim)]">
          {orgs.length.toLocaleString()} organizations ranked by citation-weighted AI output. Updated {snap.generatedAt.slice(0, 10)}.
        </p>
        <MapView orgs={orgs} />
      </div>
      <TopTenSidebar orgs={orgs} />
    </div>
  );
}
