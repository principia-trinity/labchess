# labchess Specification

*Working name: **labchess** — a lolchess.gg-style stats site for AI research organizations, with an alphaXiv-style geographic bubble map as the flagship view.*

Date: 2026-08-22

## Overview

labchess ranks the world's AI research organizations on a live ladder the way
lolchess.gg ranks Teamfight Tactics players. Organizations earn "LP" from
citation-weighted recent research output, get tier badges (Challenger through
Silver), move up and down a leaderboard weekly, and appear as logo bubbles on
a dark geographic map (in the style of alphaxiv.org/organizations/map). Data
comes exclusively from the OpenAlex public API, refreshed weekly by a GitHub
Action that commits JSON snapshots to the repo; Vercel redeploys the fully
static Next.js site on each data commit.

## Problem Statement

Research-organization rankings exist (CSRankings, Nature Index) but read like
spreadsheets. Game stats sites (lolchess.gg, op.gg) made dense competitive
data *fun*: tier badges, rank movement, ladders, profiles. alphaXiv's
organizations map showed the geographic-bubble presentation works for
research orgs but offers no ranking depth. labchess fuses the two: a
genuinely informative AI-research ladder with the addictive UX of a game
stats site.

## User Stories

1. **Visitor lands on `/`** — sees the map for the selected region (Global
   default), org logos as tier-ringed bubbles sized by LP, can pan/zoom,
   hover for a stat card, click through to a profile. A top-10 ladder
   sidebar shows the current Challengers. Acceptance: map renders ≥ 100
   bubbles for Global without overlap chaos; hover card shows rank, tier,
   LP, papers, citations.
2. **Visitor opens `/leaderboard`** — sees tier-distribution chart, region
   tabs, and the full ranked table with movement arrows since last refresh.
   Search filters rows client-side. Acceptance: table renders all orgs in
   the selected region; movement column matches snapshot diff; search by
   partial name works.
3. **Visitor opens `/org/[slug]`** — sees profile header (logo, tier badge,
   global + regional rank, LP), a rank/LP history graph growing weekly, a
   stats grid, top recent AI papers with outbound links, and a field
   breakdown. Acceptance: history graph renders with ≥ 1 data point; papers
   list shows up to 10 recent works.
4. **Maintainer does nothing** — the weekly GitHub Action refreshes data,
   commits, and the site redeploys. If the refresh fails or looks wrong,
   no commit happens and the site keeps serving the last good snapshot.

## Technical Requirements

### Functional

- **Pages**: `/` (map + top-10 sidebar), `/leaderboard`, `/org/[slug]`,
  `/about` (methodology: LP formula, tier cutoffs, data source).
- **Regions**: Global, US, China, Europe, UK, Rest of Asia. Region tabs on
  map and leaderboard. Assignment from OpenAlex `country_code`.
- **LP formula** (documented on `/about`):
  `LP = papers_12mo × (1 + min(2yr_mean_citedness, 20) / 10)`, rounded.
  `papers_12mo` = OpenAlex count of works of `type:article` whose
  `primary_topic.subfield` is Artificial Intelligence (`subfields/1702`),
  published in the last 365 days, attributed via institution lineage.
  (Amended 2026-08-22: the original `concepts.id:C154945302` filter counted
  auto-tagged datasets/specimen records, putting ministries and a fusion
  institute on top of the ladder. Topics + type:article verified sane.)
  `2yr_mean_citedness` from the institution's `summary_stats`.
- **Tiers by global rank** (fits the ~1000-org ladder): Challenger 1–10,
  Grandmaster 11–50, Master 51–150, Diamond 151–350, Platinum 351–600,
  Gold 601–850, Silver 851+. Region tabs re-rank display order but keep
  the global tier badge.
- **Movement**: current global rank vs. previous snapshot's global rank
  (▲ n / ▼ n / — / NEW).
- **Org discovery**: each refresh, group last-12-months AI articles
  (`primary_topic.subfield.id:1702,type:article`) by
  `authorships.institutions.lineage` → take top ~1000 institutions by
  count; fetch institution details (name, geo lat/long, country, homepage,
  `image_url`, summary stats) for each; then compute LP.
- **History**: per-org array of `(date, rank, lp)` appended weekly to
  `data/history.json`.
- **Top papers on profiles**: fetched at build time from OpenAlex works API
  (top 10 recent AI works per org by citations), cached in the data
  snapshot to keep builds deterministic.
- **Logos**: OpenAlex `image_url` (Wikipedia-hosted); fallback to Google
  favicon service (`https://www.google.com/s2/favicons?domain=...&sz=64`)
  from the org homepage; final fallback to an initial-letter disc.

### Non-Functional

- Fully static output (Next.js App Router, `generateStaticParams` for org
  pages). No runtime API routes, no database, no runtime secrets.
- OpenAlex etiquette: `mailto` param set, ≤ 10 req/s, retries with
  exponential backoff. Weekly refresh ≈ 2–3k requests — well within limits.
- Build must fail on invalid data (Zod validation at build time).
- Lighthouse-reasonable: map page interactive < 3s on desktop broadband;
  leaderboard table virtualized only if > 1500 rows (not expected).
- No Riot Games / lolchess / alphaXiv copyrighted assets. Tier crests are
  original simple SVGs. Aesthetic inspiration only.

### Constraints

- Data source is OpenAlex **only**. alphaXiv is a visual/product reference;
  its data is embedded in JS bundles with no public API (verified
  2026-08-22), so scraping is excluded as brittle and ToS-risky.
- Hosting: Vercel (user's existing toolchain). Repo pushed to the
  `yurekami` GitHub account.
- Refresh cadence: weekly (OpenAlex citation/works data doesn't move
  meaningfully faster).
- Stack: Next.js + TypeScript + Tailwind; d3-geo + world-atlas TopoJSON for
  maps; recharts for charts; vitest + Playwright for tests.

## UI/UX Decisions

- **Dark game aesthetic by default** (starfield map background like
  alphaXiv; dense stat tables like lolchess). Light mode out of scope v1.
- **Tier color system** drives everything: badge crests, bubble rings,
  distribution chart bars, profile accents. Colors: Challenger gold/cyan,
  GM red, Master purple, Diamond blue, Platinum teal, Gold yellow,
  Silver gray. (Tier names follow the LoL ladder convention — names are
  not copyrightable; crest artwork is original.)
- **Map projections per region**: `geoAlbersUsa` for US; fitted
  `geoMercator`/`geoConicConformal` per other region; world view for
  Global. Pan/zoom via d3-zoom; one-time force-collision pass so bubbles
  don't overlap at default zoom.
- **Leaderboard row** (lolchess-faithful): rank · movement · logo · name ·
  country flag · tier badge · LP · papers(12mo) · citations · top field.
- **Error recovery**: org page for an unknown slug → 404 with a search box.
  Missing logo → fallback chain (never a broken image icon).
- **Accessibility tier**: semantic tables, alt text on logos, keyboard
  focus on interactive map bubbles; full screen-reader map parity is out
  of scope v1 (leaderboard is the accessible equivalent view).

## Edge Cases & Error Handling

- **OpenAlex outage / rate limit during refresh**: retries with backoff;
  on persistent failure the Action exits non-zero, commits nothing; site
  keeps serving last snapshot.
- **Suspiciously shrunken fetch** (< 80% of previous org count): abort
  without committing (guards against silent API-side truncation).
- **Org missing coordinates**: excluded from map, kept on leaderboard;
  logged in Action output.
- **Org renamed / merged in OpenAlex**: identity keys on OpenAlex
  institution ID, so slug and history follow the ID; display name updates.
- **New org enters ladder**: movement shows NEW; history starts that week.
- **Org drops out of top ~1000**: retained in history.json but absent from
  orgs.json; profile page persists (from history) with a "fell off the
  ladder" state. Simplification: profile shows last-known stats.
- **Two orgs collide on slug**: slug = kebab(name) + ID suffix on
  collision.
- **Bad data commit**: Zod validation runs at build; a broken JSON fails
  the Vercel build, previous deployment stays live.

## Tradeoffs Made

- **Git-as-database over Postgres**: zero runtime infra and free versioned
  history, at the ceiling of "no user accounts / no sub-weekly data".
  Chosen deliberately; upgrade path is Neon Postgres + Vercel Cron if
  accounts/favorites ever land.
- **Recent-momentum LP over all-time prestige**: ranks actually move,
  movement arrows mean something; cost is that historic giants with slow
  recent output rank lower than intuition expects. Formula is public on
  /about to preempt "this ranking is wrong" complaints.
- **Global-rank tiers with regional re-ranking**: simpler than per-region
  ladders and keeps one canonical tier per org; cost is no "Challenger of
  China" concept in v1.
- **Static top-papers snapshot over live fetch**: deterministic builds and
  no client API calls; cost is papers up to a week stale.

## Out of Scope (v1)

- User accounts, favorites, comparisons, notifications.
- Researcher-level pages (org-level only; alphaXiv does researchers — we
  don't).
- Seasons/season-reset mechanics (the "Blend" ladder option was declined).
- Light theme.
- Scraping alphaXiv.
- Mobile-first map interactions (map is desktop-first; leaderboard is
  responsive).

## Open Questions

- Final product name + domain (working name "labchess"; user may rename
  before launch).
- Exact region membership list for "Europe" vs "Rest of Asia" (decide at
  implementation from OpenAlex country codes; not user-visible risk).
