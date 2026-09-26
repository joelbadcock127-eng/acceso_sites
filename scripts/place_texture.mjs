// place_texture.mjs {slug} {lat} {lng} [--km 12]: a subtle topographic contour
// background from real elevation (Open Meteo) around their mountain or gorge.
// Writes public/textures/place.svg and sets theme.texture = "place".
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { siteDir, log } from './lib/site.mjs';
const [slug, lat, lng] = process.argv.slice(2);
if (!slug || !lat || !lng) { console.error('Usage: node scripts/place_texture.mjs {slug} {lat} {lng} [--km 12]'); process.exit(2); }
const km = Number(process.argv.includes('--km') ? process.argv[process.argv.indexOf('--km') + 1] : 12);
const N = 40; const dLat = km / 111 / 2; const dLng = km / (111 * Math.cos((Number(lat) * Math.PI) / 180)) / 2;
const grid = [];
for (let y = 0; y < N; y++) { const lats = [], lngs = []; for (let x = 0; x < N; x++) { lats.push(Number(lat) - dLat + (2 * dLat * y) / (N - 1)); lngs.push(Number(lng) - dLng + (2 * dLng * x) / (N - 1)); } const r = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lats.join(',')}&longitude=${lngs.join(',')}`); grid.push((await r.json()).elevation); }
const min = Math.min(...grid.flat()), max = Math.max(...grid.flat()); const levels = 12; const W = 1200, H = 1200; const cell = W / (N - 1);
// Marching squares
let paths = '';
for (let l = 1; l < levels; l++) {
  const iso = min + ((max - min) * l) / levels; let d = '';
  for (let y = 0; y < N - 1; y++) for (let x = 0; x < N - 1; x++) {
    const v = [grid[y][x], grid[y][x + 1], grid[y + 1][x + 1], grid[y + 1][x]]; const idx = v.map((z) => (z >= iso ? 1 : 0)).reduce((a, b, i) => a | (b << i), 0); if (idx === 0 || idx === 15) continue;
    const lerp = (a, b, va, vb) => a + ((iso - va) / (vb - va || 1)) * (b - a);
    const px = x * cell, py = y * cell; const e = [[lerp(px, px + cell, v[0], v[1]), py], [px + cell, lerp(py, py + cell, v[1], v[2])], [lerp(px, px + cell, v[3], v[2]), py + cell], [px, lerp(py, py + cell, v[0], v[3])]];
    const segs = { 1: [3, 0], 2: [0, 1], 3: [3, 1], 4: [1, 2], 5: [3, 0, 1, 2], 6: [0, 2], 7: [3, 2], 8: [2, 3], 9: [0, 2], 10: [0, 1, 2, 3], 11: [1, 2], 12: [1, 3], 13: [0, 1], 14: [3, 0] }[idx];
    for (let s = 0; s < segs.length; s += 2) d += `M${e[segs[s]][0].toFixed(1)} ${e[segs[s]][1].toFixed(1)}L${e[segs[s + 1]][0].toFixed(1)} ${e[segs[s + 1]][1].toFixed(1)}`;
  }
  paths += `<path d="${d}" stroke-opacity="${l % 4 === 0 ? 0.11 : 0.06}"/>`;
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><g fill="none" stroke="#000" stroke-width="1">${paths}</g></svg>`;
const dir = siteDir(slug); mkdirSync(join(dir, 'public/textures'), { recursive: true }); writeFileSync(join(dir, 'public/textures/place.svg'), svg);
const theme = JSON.parse(readFileSync(join(dir, 'theme.json'), 'utf8')); theme.texture = 'place'; theme.textureFile = '/textures/place.svg'; writeFileSync(join(dir, 'theme.json'), JSON.stringify(theme, null, 2) + '\n');
log(`Wrote public/textures/place.svg from ${N * N} elevation samples (${min} to ${max} m) and set theme.texture = "place".`);
