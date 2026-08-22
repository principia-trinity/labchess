import fs from 'node:fs';
import path from 'node:path';
import { cache } from 'react';
import { HistoryFileSchema, SnapshotSchema, type HistoryFile, type Org, type Snapshot } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');

export const getSnapshot = cache((): Snapshot =>
  SnapshotSchema.parse(JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'orgs.json'), 'utf8'))),
);

export const getHistory = cache((): HistoryFile =>
  HistoryFileSchema.parse(JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'history.json'), 'utf8'))),
);

export type OrgLookup =
  | { kind: 'active'; org: Org }
  | { kind: 'fallen'; name: string; slug: string; id: string; entries: [string, number, number][] }
  | null;

export function getOrgBySlug(slug: string): OrgLookup {
  const org = getSnapshot().orgs.find((o) => o.slug === slug);
  if (org) return { kind: 'active', org };
  const history = getHistory();
  for (const [id, h] of Object.entries(history)) {
    if (h.slug === slug) return { kind: 'fallen', name: h.name, slug: h.slug, id, entries: h.entries };
  }
  return null;
}
