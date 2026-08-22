import fs from 'node:fs';
import path from 'node:path';
import { discoverOrgs, fetchInstitutions, fetchTopWorks, mapLimit } from '../src/lib/openalex';
import { appendHistory, buildSnapshot, shrinkGuard } from '../src/lib/refresh-core';
import { HistoryFileSchema, SnapshotSchema, type HistoryFile, type Snapshot, type Work } from '../src/lib/types';
import { ASIA, EUROPE, OTHER_MAJORS } from '../src/lib/regions';

const DATA_DIR = path.join(process.cwd(), 'data');
const MAX_ORGS = 1000;

function loadJSON<T>(file: string, schema: { parse: (x: unknown) => T }): T | null {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) return null;
  return schema.parse(JSON.parse(fs.readFileSync(p, 'utf8')));
}

async function main() {
  const now = new Date();
  const fromDate = new Date(now.getTime() - 365 * 86400_000).toISOString().slice(0, 10);
  const prev = loadJSON('orgs.json', SnapshotSchema);
  const history = loadJSON('history.json', HistoryFileSchema) ?? ({} as HistoryFile);

  console.log(`Discovering orgs (AI works since ${fromDate})...`);
  const discovered = await discoverOrgs(fromDate, [['US'], ['CN'], ['GB'], EUROPE, ASIA, OTHER_MAJORS, null]);
  console.log(`Discovered ${discovered.length} institutions; taking top ${MAX_ORGS}`);
  const top = discovered.slice(0, MAX_ORGS);

  console.log('Fetching institution details...');
  const institutions = await fetchInstitutions(top.map((d) => d.id));
  console.log(`Got ${institutions.length} institution records`);

  console.log('Fetching top works per org...');
  const works = await mapLimit(top, 6, async (d) => {
    try {
      return [d.id, await fetchTopWorks(d.id, fromDate)] as [string, Work[]];
    } catch (err) {
      console.error(`topWorks failed for ${d.id}: ${err}`);
      return [d.id, []] as [string, Work[]];
    }
  });

  const snap: Snapshot = buildSnapshot({
    date: now.toISOString(),
    discovered: top,
    institutions,
    worksByOrg: new Map(works),
    prev,
    maxOrgs: MAX_ORGS,
  });

  shrinkGuard(prev ? prev.orgs.length : null, snap.orgs.length);
  const noCoords = snap.orgs.filter((o) => o.lat === null).length;
  console.log(`Snapshot: ${snap.orgs.length} orgs (${noCoords} without coordinates, kept off-map)`);

  const newHistory = appendHistory(history, snap);
  SnapshotSchema.parse(snap); // belt-and-braces before write
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, 'orgs.json'), JSON.stringify(snap, null, 1));
  fs.writeFileSync(path.join(DATA_DIR, 'history.json'), JSON.stringify(newHistory, null, 1));
  console.log('Wrote data/orgs.json and data/history.json');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
