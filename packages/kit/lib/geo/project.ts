// Tiny equirectangular projection helpers for the inline SVG maps. Good
// enough at state scale; the maps are illustrative, not navigational.
import states from './au_states.json';
export type Ring = [number, number][];
export interface StateShape { name: string; rings: Ring[]; bbox: [number, number, number, number] }
export const STATES = states as Record<string, StateShape>;

export function stateCode(input?: string): string | null {
  if (!input) return null;
  const s = input.trim().toUpperCase();
  if (STATES[s]) return s;
  const byName = Object.entries(STATES).find(([, v]) => v.name.toUpperCase() === s);
  return byName ? byName[0] : null;
}

export function makeProjector(bbox: [number, number, number, number], width: number, height: number, pad = 12) {
  const [minx, miny, maxx, maxy] = bbox;
  const midLat = (miny + maxy) / 2;
  const kx = Math.cos((midLat * Math.PI) / 180);
  const w = (maxx - minx) * kx; const h = maxy - miny;
  const scale = Math.min((width - pad * 2) / w, (height - pad * 2) / h);
  const ox = (width - w * scale) / 2; const oy = (height - h * scale) / 2;
  return (lng: number, lat: number): [number, number] => [ox + (lng - minx) * kx * scale, oy + (maxy - lat) * scale];
}

export function ringPath(ring: Ring, project: (lng: number, lat: number) => [number, number]) {
  return ring.map(([x, y], i) => { const [px, py] = project(x, y); return `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`; }).join('') + 'Z';
}
