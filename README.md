# labchess

A lolchess-style competitive ladder for AI research organizations. Every org
(labs, universities, companies) gets a rank, tier, and LP score derived from
its recent publication activity on OpenAlex — papers in the last 12 months,
citation impact, h-index, and top fields. It's a fully static Next.js site;
there's no backend, database, or API server at request time.

## Data pipeline

The leaderboard data lives in `data/*.json` and is checked into the repo, not
fetched at runtime. A weekly GitHub Action
(`.github/workflows/refresh-data.yml`, Mondays 06:00 UTC) runs `npm run
refresh`, which queries the OpenAlex API, recomputes ranks/tiers/LP, and
commits the updated JSON directly to `main`. Vercel picks up the push and
auto-redeploys. You can also trigger a refresh manually from the Actions tab
(`workflow_dispatch`).

OpenAlex asks API consumers to send a contact email in the "polite pool" for
better rate limits. Set it as a repo Actions variable:

```bash
gh variable set OPENALEX_MAILTO --body you@example.com -R principia-trinity/labchess
```

This is optional — the refresh works without it — but recommended to avoid
throttling on the weekly run.

## Local development

```bash
npm run dev      # dev server at localhost:3000
npm test         # vitest unit/integration tests
npm run build    # production build
npm run refresh  # pull fresh data from OpenAlex into data/*.json
npm run e2e      # playwright end-to-end tests
```

## Methodology

See `/about` on the running site, or `specs/labchess-spec.md` in this repo,
for how LP, tiers, and rank movement are calculated.
