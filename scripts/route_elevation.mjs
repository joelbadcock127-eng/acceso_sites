// route_elevation.mjs {slug} {experience-slug} {file.gpx} [--days 3]
// GPX in, src/content/routes/{experience}.json out, with elevations sampled from
// Open Meteo where the GPX has none, total ascent, highest point and distance.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { siteDir, log } from './lib/site.mjs';
const [slug, exp, gpx] = process.argv.slice(2);
if (!slug || !exp || !gpx) { console.error('Usage: node scripts/route_elevation.mjs {slug} {experience-slug} {file.gpx} [--days N] [--attribution "..."]'); process.exit(2); }
const args = process.argv.slice(5); const days = args.includes('--days') ? Number(args[args.indexOf('--days') + 1]) : 1; const attribution = args.includes('--attribution') ? args[args.indexOf('--attribution') + 1] : 'Route supplied by the operator';
const xml = readFileSync(gpx, 'utf8');
let pts = [...xml.matchAll(/<(?:trkpt|rtept)\s+lat="([-\d.]+)"\s+lon="([-\d.]+)"[^>]*>(?:[\s\S]*?<ele>([-\d.]+)<\/ele>)?[\s\S]*?<\/(?:trkpt|rtept)>|<(?:trkpt|rtept)\s+lat="([-\d.]+)"\s+lon="([-\d.]+)"[^>]*\/>/g)].map((m) => [Number(m[2] ?? m[5]), Number(m[1] ?? m[4]), m[3] ? Number(m[3]) : undefined]);
if (pts.length < 2) { console.error('No track points found'); process.exit(1); }
// Thin to about 400 points so the page stays light
const step = Math.max(1, Math.floor(pts.length / 400)); pts = pts.filter((_, i) => i % step === 0 || i === pts.length - 1);
if (pts.some((p) => p[2] === undefined)) {
  for (let i = 0; i < pts.length; i += 100) { const chunk = pts.slice(i, i + 100); const r = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${chunk.map((p) => p[1]).join(',')}&longitude=${chunk.map((p) => p[0]).join(',')}`); const j = await r.json(); j.elevation.forEach((e, k) => { pts[i + k][2] = Math.round(e); }); }
  log('Elevations sampled from Open Meteo');
}
const R = 6371; let dist = 0, asc = 0, hi = -Infinity;
for (let i = 1; i < pts.length; i++) { const [a, b] = [pts[i - 1], pts[i]]; const dLat = (b[1] - a[1]) * Math.PI / 180, dLng = (b[0] - a[0]) * Math.PI / 180; const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * Math.PI / 180) * Math.cos(b[1] * Math.PI / 180) * Math.sin(dLng / 2) ** 2; dist += 2 * R * Math.asin(Math.sqrt(h)); const dz = b[2] - a[2]; if (dz > 0) asc += dz; hi = Math.max(hi, b[2]); }
const dayOf = pts.map((_, i) => Math.min(days, Math.floor((i / pts.length) * days) + 1));
const lngs = pts.map((p) => p[0]), lats = pts.map((p) => p[1]);
const outDir = join(siteDir(slug), 'src/content/routes'); mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, `${exp}.json`), JSON.stringify({ points: pts.map((p) => [+p[0].toFixed(5), +p[1].toFixed(5), p[2]]), days: days > 1 ? dayOf : [], ascentM: Math.round(asc), highestM: Math.round(hi), distanceKm: +dist.toFixed(1), attribution, bbox: [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)] }));
log(`Wrote src/content/routes/${exp}.json: ${pts.length} points, ${dist.toFixed(1)} km, ${Math.round(asc)} m ascent, high point ${Math.round(hi)} m. Set route.dataFile: content/routes/${exp}.json in the experience frontmatter (or leave it: the slug is matched automatically).`);
