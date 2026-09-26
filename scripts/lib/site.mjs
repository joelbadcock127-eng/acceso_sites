// Shared helpers for scripts: resolve a site by slug, read and update sites.json.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const REGISTRY = join(ROOT, 'sites.json');
export function siteDir(slug) { const d = join(ROOT, 'sites', slug); if (!existsSync(d)) throw new Error(`No site folder for "${slug}" (${d})`); return d; }
export function readRegistry() { return existsSync(REGISTRY) ? JSON.parse(readFileSync(REGISTRY, 'utf8')) : []; }
export function writeRegistry(list) { writeFileSync(REGISTRY, JSON.stringify(list, null, 2) + '\n'); }
export function updateRegistry(slug, patch) { const list = readRegistry(); const i = list.findIndex((s) => s.slug === slug); if (i < 0) list.push({ slug, ...patch }); else list[i] = { ...list[i], ...patch }; writeRegistry(list); return list.find((s) => s.slug === slug); }
export function readJson(p, fallback = null) { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return fallback; } }
export function log(...a) { console.log(...a); }
export function slugArg(argv = process.argv) { const s = argv[2]; if (!s) { console.error('Usage: node scripts/<script>.mjs {slug}'); process.exit(2); } return s; }
export function chromiumPath() { return process.env.CHROMIUM_PATH || undefined; }
