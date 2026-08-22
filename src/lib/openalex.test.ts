import { afterEach, describe, expect, test, vi } from 'vitest';
import { discoverOrgs, fetchInstitutions, fetchJSON, fetchTopWorks, mapLimit } from '@/lib/openalex';

function mockFetchOnce(sequence: Array<{ status: number; body?: any }>) {
  let i = 0;
  vi.stubGlobal('fetch', vi.fn(async () => {
    const r = sequence[Math.min(i++, sequence.length - 1)];
    return { ok: r.status < 400, status: r.status, json: async () => r.body ?? {} } as Response;
  }));
}

afterEach(() => vi.unstubAllGlobals());

describe('fetchJSON', () => {
  test('retries 429 then succeeds', async () => {
    vi.useFakeTimers();
    mockFetchOnce([{ status: 429 }, { status: 200, body: { ok: 1 } }]);
    const p = fetchJSON('https://x');
    await vi.runAllTimersAsync();
    expect(await p).toEqual({ ok: 1 });
    vi.useRealTimers();
  });
  test('throws immediately on 404', async () => {
    mockFetchOnce([{ status: 404 }]);
    await expect(fetchJSON('https://x')).rejects.toThrow('HTTP 404');
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe('discoverOrgs', () => {
  test('merges slices with max count, sorts desc', async () => {
    const bucket = (id: string, count: number) => ({ key: `https://openalex.org/${id}`, key_display_name: id, count });
    const bodies = [
      { group_by: [bucket('I1', 100), bucket('I2', 30)] },   // slice us: I2 undercounted collab
      { group_by: [bucket('I2', 500)] },                     // slice cn: I2 true count
      { group_by: [bucket('I3', 50)] },                      // global catch-all
    ];
    let call = 0;
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, json: async () => bodies[call++] }) as Response));
    const out = await discoverOrgs('2025-08-22', [['US'], ['CN'], null]);
    expect(out).toEqual([
      { id: 'I2', papers12mo: 500 },
      { id: 'I1', papers12mo: 100 },
      { id: 'I3', papers12mo: 50 },
    ]);
  });
});

describe('fetchInstitutions', () => {
  test('batches ids 50 per request', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ results: [{ id: 'x' }] }) }) as Response));
    const ids = Array.from({ length: 120 }, (_, i) => `I${i}`);
    const out = await fetchInstitutions(ids);
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(out).toHaveLength(3);
  });
});

describe('fetchTopWorks', () => {
  test('maps works to Work shape', async () => {
    mockFetchOnce([{ status: 200, body: { results: [
      { id: 'https://openalex.org/W1', title: 'T', publication_year: 2026, cited_by_count: 9, doi: 'https://doi.org/10/z' },
      { id: 'https://openalex.org/W2', title: null, publication_year: null, cited_by_count: null, doi: null },
    ] } }]);
    const out = await fetchTopWorks('I1', '2025-08-22');
    expect(out[0]).toEqual({ id: 'https://openalex.org/W1', title: 'T', year: 2026, citations: 9, url: 'https://doi.org/10/z' });
    expect(out[1]).toEqual({ id: 'https://openalex.org/W2', title: 'Untitled', year: 0, citations: 0, url: 'https://openalex.org/W2' });
  });
});

describe('mapLimit', () => {
  test('preserves order and bounds concurrency', async () => {
    let inFlight = 0, peak = 0;
    const out = await mapLimit([1, 2, 3, 4, 5], 2, async (n) => {
      inFlight++; peak = Math.max(peak, inFlight);
      await new Promise((r) => setTimeout(r, 5));
      inFlight--;
      return n * 10;
    });
    expect(out).toEqual([10, 20, 30, 40, 50]);
    expect(peak).toBeLessThanOrEqual(2);
  });
});
