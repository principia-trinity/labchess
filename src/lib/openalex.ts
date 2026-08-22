import type { Work } from './types';

const BASE = 'https://api.openalex.org';
export const AI_CONCEPT = 'C154945302';

function mailto(): string {
  const m = process.env.OPENALEX_MAILTO;
  return m ? `&mailto=${encodeURIComponent(m)}` : '';
}

export async function fetchJSON(url: string, tries = 4): Promise<any> {
  for (let attempt = 0; ; attempt++) {
    const res: { ok: boolean; status: number; json: () => Promise<any> } = await fetch(url).catch((err) => {
      // network errors are retryable like 5xx
      return { ok: false, status: 599, json: async () => { throw err; } };
    });
    if (res.ok) return res.json();
    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt >= tries - 1) throw new Error(`HTTP ${res.status} for ${url}`);
    await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
  }
}

export interface Discovered { id: string; papers12mo: number; }

export async function discoverOrgs(fromDate: string, slices: (string[] | null)[]): Promise<Discovered[]> {
  const byId = new Map<string, number>();
  for (const slice of slices) {
    const cc = slice ? `,institutions.country_code:${slice.join('|')}` : '';
    const url = `${BASE}/works?filter=concepts.id:${AI_CONCEPT},from_publication_date:${fromDate}${cc}&group_by=authorships.institutions.lineage&per_page=200${mailto()}`;
    const json = await fetchJSON(url);
    for (const g of json.group_by ?? []) {
      const id = String(g.key).split('/').pop() ?? '';
      if (!id.startsWith('I')) continue;
      byId.set(id, Math.max(byId.get(id) ?? 0, g.count));
    }
  }
  return [...byId.entries()]
    .map(([id, papers12mo]) => ({ id, papers12mo }))
    .sort((a, b) => b.papers12mo - a.papers12mo || a.id.localeCompare(b.id));
}

export async function fetchInstitutions(ids: string[]): Promise<any[]> {
  const out: any[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const url = `${BASE}/institutions?filter=ids.openalex:${batch.join('|')}&per_page=50${mailto()}`;
    const json = await fetchJSON(url);
    out.push(...(json.results ?? []));
  }
  return out;
}

export async function fetchTopWorks(orgId: string, fromDate: string): Promise<Work[]> {
  const url = `${BASE}/works?filter=authorships.institutions.lineage:${orgId},concepts.id:${AI_CONCEPT},from_publication_date:${fromDate}&sort=cited_by_count:desc&per_page=10&select=id,title,publication_year,cited_by_count,doi${mailto()}`;
  const json = await fetchJSON(url);
  return (json.results ?? []).map((w: any): Work => ({
    id: w.id,
    title: w.title ?? 'Untitled',
    year: w.publication_year ?? 0,
    citations: w.cited_by_count ?? 0,
    url: w.doi ?? w.id ?? null,
  }));
}

export async function mapLimit<T, R>(items: T[], limit: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i]);
      }
    }),
  );
  return results;
}
