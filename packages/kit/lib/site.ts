// Content access helpers used by every page and component. Nothing here
// invents a value: if a collection is empty, callers get an empty list and the
// component hides itself (A4).
import { getCollection, getEntry } from 'astro:content';
import type { Site, Experience } from './content/schema';

export async function getSite(): Promise<Site> {
  const e = await getEntry('site', 'main');
  if (!e) throw new Error('src/content/site.json is missing');
  return e.data as Site;
}

export async function getExperiences() {
  const all = await getCollection('experiences');
  return all
    .map((e) => ({ ...e, slug: e.data.slug ?? e.id.replace(/\.md$/, ''), data: e.data as Experience }))
    .sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
}

export type ExperienceEntry = Awaited<ReturnType<typeof getExperiences>>[number];

export async function safeCollection<T extends Parameters<typeof getCollection>[0]>(name: T) {
  try { return await getCollection(name); } catch { return [] as Awaited<ReturnType<typeof getCollection<T>>>; }
}

export function isPreview(site: Site) { return site.preview?.enabled !== false; }

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));

export function formatPrice(p?: Experience['priceFrom']) {
  if (!p) return null;
  const amount = Number.isInteger(p.amount) ? `$${p.amount.toLocaleString('en-AU')}` : `$${p.amount.toFixed(2)}`;
  return `${p.isFrom ? 'From ' : ''}${amount} per ${p.per}`;
}

export function formatPriceShort(p?: Experience['priceFrom']) {
  if (!p) return null;
  return `${p.isFrom ? 'From ' : ''}$${Number.isInteger(p.amount) ? p.amount.toLocaleString('en-AU') : p.amount.toFixed(2)}`;
}

export function formatDate(iso: string) {
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
  if (isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MONTHS[d.getMonth()]}${d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : ''}`;
}

export function futureDepartures(exp: Experience, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return exp.departures.filter((d) => new Date(d.start + 'T00:00:00') >= today).sort((a, b) => a.start.localeCompare(b.start));
}

/** "Next departure 12 October" or "Runs April to October", from their dates or season only */
export function nextDepartureLine(exp: Experience, now = new Date()): string | null {
  const next = futureDepartures(exp, now)[0];
  if (next) return `Next departure ${formatDate(next.start)}`;
  if (exp.season) return `Runs ${exp.season}`;
  return null;
}

export function groupSizeLine(g?: Experience['groupSize']) {
  if (!g) return null;
  if (g.min && g.max) return `${g.min} to ${g.max} walkers`;
  if (g.max) return `Maximum ${g.max} walkers`;
  if (g.min) return `From ${g.min} walkers`;
  return null;
}

/** Counts facts present for KeyFactsBanner (needs 3 or more) */
export function keyFacts(exp: Experience) {
  const facts: { k: string; v: string; sub?: string }[] = [];
  if (exp.durationLabel) facts.push({ k: 'Duration', v: exp.durationLabel });
  if (exp.distanceKm) facts.push({ k: 'Distance', v: `${exp.distanceKm} km` });
  if (exp.grade) facts.push({ k: 'Grade', v: exp.grade.label, sub: exp.grade.explainer });
  const gs = groupSizeLine(exp.groupSize);
  if (gs) facts.push({ k: 'Group size', v: gs });
  const price = formatPriceShort(exp.priceFrom);
  if (price) facts.push({ k: 'Price', v: `${price} per ${exp.priceFrom!.per}` });
  return facts;
}

export function plainText(md: string) {
  return md.replace(/[#*_>`]/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\s+/g, ' ').trim();
}

export function truncate(s: string, n = 160) {
  const t = plainText(s);
  return t.length <= n ? t : t.slice(0, n - 1).replace(/\s+\S*$/, '') + '…';
}

export function absoluteUrl(site: Site, path: string) {
  const base = site.seo.siteUrl?.replace(/\/$/, '') ?? '';
  return path.startsWith('http') ? path : `${base}${path}`;
}
