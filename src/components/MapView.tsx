'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { geoAlbersUsa, geoMercator, geoNaturalEarth1, geoPath, type GeoProjection } from 'd3-geo';
import { zoom, type ZoomTransform, zoomIdentity } from 'd3-zoom';
import { select } from 'd3-selection';
import { forceCollide, forceSimulation, forceX, forceY } from 'd3-force';
import { feature } from 'topojson-client';
import worldData from 'world-atlas/countries-110m.json';
import type { MapOrg, Region } from '@/lib/types';
import { REGION_LABELS } from '@/lib/regions';
import { TIER_META } from '@/lib/tiers';
import { flagEmoji } from '@/lib/flags';
import { TierBadge } from './TierBadge';

const W = 940, H = 620, MAP_CAP = 150; // ponytail: cap bubbles per view for legibility
const US_NUMERIC = '840';

// [lng, lat] bounding boxes per region view (global/other use the whole sphere)
const BOUNDS: Partial<Record<Region, [[number, number], [number, number]]>> = {
  china: [[73, 18], [135, 54]],
  uk: [[-8.6, 49.8], [1.8, 61]],
  europe: [[-11, 34], [33, 61]],
  asia: [[33, -12], [150, 55]],
};

const countries = feature(worldData as any, (worldData as any).objects.countries) as any;
const usFeature = countries.features.find((f: any) => f.id === US_NUMERIC);

function bboxPolygon([[x0, y0], [x1, y1]]: [[number, number], [number, number]]) {
  // Winding order matters to d3-geo's spherical-polygon area test: the naive
  // (x0,y0)->(x1,y0)->(x1,y1)->(x0,y1) ring reads as "everything except this
  // rectangle" (fitExtent then zooms to fit the whole sphere). Reversed
  // middle two points fixes the winding so it reads as the small rectangle.
  return { type: 'Polygon' as const, coordinates: [[[x0, y0], [x0, y1], [x1, y1], [x1, y0], [x0, y0]]] };
}

function makeProjection(region: Region | 'global'): GeoProjection {
  if (region === 'us') return geoAlbersUsa().fitSize([W, H], usFeature);
  const bounds = BOUNDS[region as Region];
  if (bounds) return geoMercator().fitExtent([[20, 20], [W - 20, H - 20]], bboxPolygon(bounds) as any);
  return geoNaturalEarth1().fitSize([W, H], { type: 'Sphere' } as any);
}

interface Bubble { org: MapOrg; x: number; y: number; r: number; }

function layoutBubbles(orgs: MapOrg[], projection: GeoProjection): Bubble[] {
  const placed = orgs
    .filter((o) => o.lat !== null && o.lng !== null)
    .map((o) => ({ org: o, p: projection([o.lng!, o.lat!]) }))
    .filter((x): x is { org: MapOrg; p: [number, number] } => x.p !== null);
  if (placed.length === 0) return [];
  const maxLp = Math.max(...placed.map((x) => x.org.lp));
  const nodes = placed.map((x) => ({
    org: x.org, x: x.p[0], y: x.p[1], tx: x.p[0], ty: x.p[1],
    r: 7 + 17 * Math.sqrt(x.org.lp / maxLp),
  }));
  const sim = forceSimulation(nodes as any)
    .force('x', forceX((d: any) => d.tx).strength(0.4))
    .force('y', forceY((d: any) => d.ty).strength(0.4))
    .force('collide', forceCollide((d: any) => d.r + 0.5))
    .stop();
  for (let i = 0; i < 80; i++) sim.tick();
  return nodes.map((n: any) => ({ org: n.org, x: n.x, y: n.y, r: n.r }));
}

export function MapView({ orgs }: { orgs: MapOrg[] }) {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const [region, setRegion] = useState<Region | 'global'>('global');
  const [transform, setTransform] = useState<ZoomTransform>(zoomIdentity);
  const [hover, setHover] = useState<Bubble | null>(null);

  const projection = useMemo(() => makeProjection(region), [region]);
  const path = useMemo(() => geoPath(projection), [projection]);
  const bubbles = useMemo(() => {
    const inRegion = region === 'global' ? orgs : orgs.filter((o) => o.region === region);
    return layoutBubbles([...inRegion].sort((a, b) => b.lp - a.lp).slice(0, MAP_CAP), projection);
  }, [orgs, region, projection]);

  useEffect(() => {
    const svg = select(svgRef.current!);
    const z = zoom<SVGSVGElement, unknown>().scaleExtent([1, 8]).on('zoom', (e) => setTransform(e.transform));
    svg.call(z as any);
    svg.call((z as any).transform, zoomIdentity); // reset on region change
    return () => { svg.on('.zoom', null); };
  }, [region]);

  const tabs: (Region | 'global')[] = ['global', 'us', 'china', 'europe', 'uk', 'asia', 'other'];

  return (
    <div className="relative">
      <div className="mb-3 flex flex-wrap gap-1 rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] p-1">
        {tabs.map((r) => (
          <button
            key={r}
            onClick={() => { setRegion(r); setHover(null); }}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
              r === region ? 'bg-[var(--accent)] text-black' : 'text-[var(--text-dim)] hover:text-[var(--text)]'
            }`}
          >
            {REGION_LABELS[r]}
          </button>
        ))}
      </div>

      <div className="starfield overflow-hidden rounded-xl border border-[var(--border)]">
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full cursor-grab" role="img" aria-label="Map of AI research organizations">
          <g transform={transform.toString()}>
            {countries.features.map((f: any, i: number) => (
              <path key={i} d={path(f) ?? undefined} fill="#161c27" stroke="#232b38" strokeWidth={0.5 / transform.k} />
            ))}
            {bubbles.map((b) => (
              <g
                key={b.org.slug}
                transform={`translate(${b.x},${b.y})`}
                className="cursor-pointer"
                tabIndex={0}
                onMouseEnter={() => setHover(b)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(b)}
                onBlur={() => setHover(null)}
                onClick={() => router.push(`/org/${b.org.slug}`)}
                onKeyDown={(e) => e.key === 'Enter' && router.push(`/org/${b.org.slug}`)}
              >
                <circle r={b.r} fill="#fff" stroke={TIER_META[b.org.tier].color} strokeWidth={2 / Math.sqrt(transform.k)} />
                <clipPath id={`clip-${b.org.slug}`}><circle r={b.r - 1.5} /></clipPath>
                {b.org.logoUrl ? (
                  <image
                    href={b.org.logoUrl}
                    x={-b.r} y={-b.r} width={b.r * 2} height={b.r * 2}
                    clipPath={`url(#clip-${b.org.slug})`}
                    preserveAspectRatio="xMidYMid slice"
                  />
                ) : (
                  <text textAnchor="middle" dy={b.r * 0.35} fontSize={b.r} fontWeight={800} fill="#0a0e14">
                    {b.org.name.charAt(0)}
                  </text>
                )}
              </g>
            ))}
          </g>
        </svg>
      </div>

      {hover && (
        <div
          className="pointer-events-none absolute z-30 w-60 rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] p-3 shadow-xl"
          style={{
            left: `${Math.min(92, Math.max(2, (transform.applyX(hover.x) / W) * 100))}%`,
            top: `${Math.min(80, Math.max(2, (transform.applyY(hover.y) / H) * 100 + 8))}%`,
          }}
        >
          <div className="mb-1 flex items-center gap-2 font-bold">
            <span className="truncate">{hover.org.name}</span>
            <span aria-hidden>{flagEmoji(hover.org.countryCode)}</span>
          </div>
          <TierBadge tier={hover.org.tier} />
          <div className="mt-1.5 grid grid-cols-2 gap-x-2 text-xs text-[var(--text-dim)]">
            <span>Rank #{hover.org.rank}</span>
            <span className="text-right font-bold text-[var(--accent)]">{hover.org.lp.toLocaleString()} LP</span>
            <span>Papers {hover.org.papers12mo.toLocaleString()}</span>
            <span className="text-right">Cites {hover.org.citations.toLocaleString()}</span>
          </div>
        </div>
      )}
      <p className="mt-2 text-xs text-[var(--text-dim)]">Drag to pan · scroll to zoom · top {MAP_CAP} orgs per view · click a bubble for the profile</p>
    </div>
  );
}
