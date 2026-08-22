import { notFound } from 'next/navigation';
import { getHistory, getOrgBySlug, getSnapshot } from '@/lib/data';
import { REGION_LABELS } from '@/lib/regions';
import { flagEmoji } from '@/lib/flags';
import { TierBadge } from '@/components/TierBadge';
import { OrgLogo } from '@/components/OrgLogo';
import { Movement } from '@/components/Movement';
import { HistoryChart } from '@/components/HistoryChart';

export const dynamicParams = false;

export function generateStaticParams() {
  const active = getSnapshot().orgs.map((o) => ({ slug: o.slug }));
  const activeSlugs = new Set(active.map((a) => a.slug));
  const fallen = Object.values(getHistory())
    .filter((h) => !activeSlugs.has(h.slug))
    .map((h) => ({ slug: h.slug }));
  return [...active, ...fallen];
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] p-3">
      <div className="text-xs text-[var(--text-dim)]">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}

export default async function OrgPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hit = getOrgBySlug(slug);
  if (!hit) notFound();

  if (hit.kind === 'fallen') {
    return (
      <div className="flex flex-col gap-4 py-8">
        <h1 className="text-2xl font-extrabold">{hit.name}</h1>
        <p className="text-[var(--text-dim)]">Fell off the ladder — last-known stats below.</p>
        <HistoryChart entries={hit.entries} />
      </div>
    );
  }

  const { org } = hit;
  const entries = getHistory()[org.id]?.entries ?? [];
  const regionOrgs = getSnapshot().orgs.filter((o) => o.region === org.region);
  const regionRank = regionOrgs.findIndex((o) => o.id === org.id) + 1;

  return (
    <div className="flex flex-col gap-5 py-8">
      <header className="flex flex-wrap items-center gap-4">
        <OrgLogo name={org.name} logoUrl={org.logoUrl} homepage={org.homepage} size={64} />
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold">
            {org.name} <span aria-hidden>{flagEmoji(org.countryCode)}</span>
          </h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-[var(--text-dim)]">
            <TierBadge tier={org.tier} size="lg" />
            <span>Global #{org.rank}</span>
            <span>{REGION_LABELS[org.region]} #{regionRank}</span>
            <Movement value={org.movement} />
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-3xl font-extrabold text-[var(--accent)]">{org.lp.toLocaleString()} LP</div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="AI papers (12mo)" value={org.papers12mo.toLocaleString()} />
        <Stat label="Citations (all-time)" value={org.citations.toLocaleString()} />
        <Stat label="h-index" value={org.hIndex.toLocaleString()} />
        <Stat label="2yr mean citedness" value={org.meanCitedness.toFixed(2)} />
      </div>

      {entries.length > 0 && <HistoryChart entries={entries} />}

      {org.topFields.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-bold text-[var(--text-dim)]">Top fields</h2>
          <div className="flex flex-col gap-1.5">
            {org.topFields.map((f) => (
              <div key={f.name} className="flex items-center gap-2 text-sm">
                <span className="w-56 truncate">{f.name}</span>
                <div className="h-2 rounded bg-[var(--accent)]/70" style={{ width: `${Math.min(100, (f.count / (org.topFields[0].count || 1)) * 240)}px` }} />
                <span className="text-xs text-[var(--text-dim)]">{f.count}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {org.topWorks.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-bold text-[var(--text-dim)]">Top recent AI papers</h2>
          <ol className="flex flex-col gap-1.5">
            {org.topWorks.map((w) => (
              <li key={w.id} className="rounded-md border border-[var(--border)] bg-[var(--bg-row)] px-3 py-2 text-sm">
                <a href={w.url ?? w.id} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-[var(--accent)]">
                  {w.title}
                </a>
                <span className="ml-2 text-xs text-[var(--text-dim)]">{w.year} · {w.citations.toLocaleString()} citations</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
