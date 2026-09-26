// Screenshots of every built page at the QA viewports (B12 uses the home and
// best experience pages; qa.mjs uses all of them for the horizontal scroll check).
import { chromium } from 'playwright';
import { mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { serve } from './lib/serve.mjs';
import { siteDir, slugArg, log } from './lib/site.mjs';
const slug = slugArg();
const dir = siteDir(slug); const dist = join(dir, 'dist');
const out = join(dir, 'qa', 'shots'); mkdirSync(out, { recursive: true });
const widths = (process.argv[3] || '390,1440').split(',').map(Number);
const pages = listPages(dist).filter((p) => !p.includes('/print') && !p.startsWith('/_kit'));
const { base, close } = await serve(dist);
const browser = await chromium.launch();
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  for (const p of pages) {
    await page.goto(base + p, { waitUntil: 'load', timeout: 60000 }); await page.waitForTimeout(600);
    const name = (p === '/' ? 'home' : p.slice(1).replace(/\//g, '__')) + `-${w}.png`;
    await page.screenshot({ path: join(out, name), fullPage: true });
    log(`shot ${name}`);
  }
  await ctx.close();
}
await browser.close(); await close();
export function listPages(dist, prefix = '') {
  const out = [];
  for (const f of readdirSync(join(dist, prefix))) {
    const rel = prefix + '/' + f;
    if (statSync(join(dist, rel)).isDirectory()) out.push(...listPages(dist, rel));
    else if (f.endsWith('.html') && f !== '404.html') out.push(rel === '/index.html' ? '/' : rel.replace(/\/index\.html$/, '').replace(/\.html$/, ''));
  }
  return out;
}
