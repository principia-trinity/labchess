import { getSnapshot } from '@/lib/data';

export default function AboutPage() {
  const snap = getSnapshot();
  return (
    <article className="prose-invert mx-auto flex max-w-2xl flex-col gap-4 py-10 text-sm leading-relaxed">
      <h1 className="text-2xl font-extrabold">About labchess</h1>
      <p>
        labchess ranks {snap.orgs.length.toLocaleString()} AI research organizations the way game stats
        sites rank players: a ladder, tiers, and weekly movement. It is a fan-style stats project, not
        an official ranking. Aesthetic inspiration: lolchess.gg and the alphaXiv organizations map.
      </p>
      <h2 className="text-lg font-bold">Scoring (LP)</h2>
      <p>
        <code>LP = papers12mo × (1 + min(meanCitedness, 20) / 10)</code>, rounded. <em>papers12mo</em> is
        the organization's count of research articles whose OpenAlex primary topic falls in the Artificial Intelligence subfield, published in the trailing 365 days, attributed through institution lineage.
        <em> meanCitedness</em> is the institution's 2-year mean citedness from OpenAlex summary stats.
        Recent output moves the ladder; citation quality multiplies it.
      </p>
      <h2 className="text-lg font-bold">Tiers</h2>
      <p>
        By global rank: Challenger 1–10 · Grandmaster 11–50 · Master 51–150 · Diamond 151–350 ·
        Platinum 351–600 · Gold 601–850 · Silver 851+. Region tabs re-rank the display but the badge is global.
      </p>
      <h2 className="text-lg font-bold">Data</h2>
      <p>
        All data comes from the free <a className="text-[var(--accent)] hover:underline" href="https://openalex.org">OpenAlex</a> API,
        refreshed weekly by an automated job. Logos are provided by OpenAlex (Wikipedia) with favicon
        fallbacks. Last refresh: {snap.generatedAt.slice(0, 10)}. Rankings depend on OpenAlex's
        affiliation and concept tagging, which is imperfect — treat placements as entertainment, not evaluation.
      </p>
    </article>
  );
}
