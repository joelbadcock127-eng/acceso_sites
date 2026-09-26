// B10 automated gates. Exits non zero on any failure. Run after `astro build`.
import { chromium } from 'playwright';
import { readdirSync, readFileSync, statSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { serve } from './lib/serve.mjs';
import { siteDir, slugArg, readJson, log } from './lib/site.mjs';
import { listPages } from './shots.mjs';

const slug = slugArg();
const dir = siteDir(slug); const dist = join(dir, 'dist');
if (!existsSync(dist)) { console.error('No dist/. Build the site first.'); process.exit(2); }
const site = readJson(join(dir, 'src/content/site.json'));
const preview = site?.preview?.enabled !== false;
const qaDir = join(dir, 'qa'); mkdirSync(qaDir, { recursive: true });
const failures = []; const warnings = [];
const fail = (gate, msg) => { failures.push(`${gate}: ${msg}`); log(`FAIL ${gate}: ${msg}`); };
const pass = (gate, msg = '') => log(`ok   ${gate} ${msg}`);
const skipLighthouse = process.argv.includes('--no-lighthouse');

const pages = listPages(dist);
const htmlFiles = walk(dist).filter((f) => f.endsWith('.html'));

// Leak check (section 1 rule 3). Skipped only for sites/bakers.
if (slug !== 'bakers') {
  const leak = /Bakers|Narawntapu|Monaco|Devonport|bakerswalkingco|cdn\.prod\.website-files\.com|69[0-9a-f]{22}_/;
  const cssLeak = /Bakers|Narawntapu|Devonport|bakerswalkingco|cdn\.prod\.website-files\.com|69[0-9a-f]{22}_/; // Monaco is also a font name in Tailwind's mono stack
  const hits = walk(dist).filter((f) => /\.(html|css|js|json|xml|txt|svg)$/.test(f)).flatMap((f) => { const t = readFileSync(f, 'utf8'); const m = t.match(f.endsWith('.css') ? cssLeak : leak); return m ? [`${f.replace(dist, '')}: "${m[0]}"`] : []; });
  hits.length ? fail('leak', hits.slice(0, 5).join('; ')) : pass('leak');
}
// Placeholder check
{
  const re = /\[\[|TODO|lorem ipsum|\bTBC\b|example\.com|example\.invalid/i;
  const hits = htmlFiles.flatMap((f) => { const m = visibleText(readFileSync(f, 'utf8')).match(re); return m ? [`${f.replace(dist, '')}: "${m[0]}"`] : []; });
  hits.length ? fail('placeholders', hits.slice(0, 5).join('; ')) : pass('placeholders');
}
// Copy lint: no hyphens or dashes as punctuation in visible copy (section 6). URLs, code and the legal name are exempt.
// sites/bakers carries Bakers' own copy verbatim for the fidelity test, so the lint is informational there.
{
  const legal = site?.business?.legalName ?? '';
  const hits = [];
  for (const f of htmlFiles) {
    if (f.includes('/_kit/') || f.includes('/legal/')) continue;
    const text = visibleText(readFileSync(f, 'utf8')).replace(new RegExp(escapeRe(legal), 'g'), '');
    const m = text.match(/[^\s]*(\s[-–—]\s|[–—]|\b[a-zA-Z]+-[a-zA-Z]+\b)[^\s]*/);
    if (m && !/^(https?:|\/)|\.[a-z]{2,}(\/|$)/.test(m[0]) && !/^\d/.test(m[0])) hits.push(`${f.replace(dist, '')}: "${m[0].slice(0, 60)}"`);
  }
  hits.length ? (slug === 'bakers' ? warnings.push(`copy-lint (verbatim Bakers copy): ${hits.length} hits`) : fail('copy-lint', hits.slice(0, 8).join('; '))) : pass('copy-lint');
}
// Fact trace: every stat, price, testimonial and credential has a sourceUrl or sourceFact.
{
  const c = join(dir, 'src/content'); const missing = [];
  for (const [file, key] of [['stats.json', 'sourceFact'], ['testimonials.json', 'sourceUrl'], ['guides.json', 'sourceUrl'], ['press.json', 'sourceUrl'], ['species.json', 'sourceUrl']]) for (const [i, row] of (readJson(join(c, file), []) ?? []).entries()) if (!row[key]) missing.push(`${file}[${i}]`);
  for (const f of readdirSync(join(c, 'experiences')).filter((x) => x.endsWith('.md'))) if (!/^sourceUrl:\s*\S/m.test(readFileSync(join(c, 'experiences', f), 'utf8'))) missing.push(`experiences/${f}`);
  for (const t of site?.trust ?? []) if (!t.sourceUrl) missing.push(`trust: ${t.label}`);
  if (site?.reviews?.ratingLine && !site.reviews.ratingSourceUrl) missing.push('reviews.ratingLine without ratingSourceUrl');
  missing.length ? fail('fact-trace', missing.join(', ')) : pass('fact-trace');
}
// Preview privacy
if (preview) {
  const home = readFileSync(join(dist, 'index.html'), 'utf8');
  const headers = existsSync(join(dist, '_headers')) ? readFileSync(join(dist, '_headers'), 'utf8') : '';
  const robots = existsSync(join(dist, 'robots.txt')) ? readFileSync(join(dist, 'robots.txt'), 'utf8') : '';
  const ok = /name="robots" content="noindex, nofollow"/.test(home) && /X-Robots-Tag: noindex/.test(headers) && /Disallow: \/\s*$/m.test(robots) && /preview-banner/.test(home);
  ok ? pass('preview-privacy') : fail('preview-privacy', 'noindex meta, X-Robots-Tag, robots.txt disallow and banner must all be present');
} else pass('preview-privacy', '(launch mode)');
// Downloads
{
  const pdfs = existsSync(join(dist, 'downloads')) ? readdirSync(join(dist, 'downloads')).filter((f) => f.endsWith('.pdf')) : [];
  const bad = pdfs.filter((f) => statSync(join(dist, 'downloads', f)).size > 3 * 1024 * 1024);
  bad.length ? fail('downloads', `${bad.join(', ')} over 3 MB`) : pass('downloads', `${pdfs.length} PDFs`);
}

// Browser gates
const { base, close } = await serve(dist);
const browser = await chromium.launch();
const results = { pages: {} };
const internal = new Set(); const consoleErrors = [];
const widths = [360, 390, 768, 1280, 1920];
const ctx = await browser.newContext({ reducedMotion: 'reduce' });
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error' && !/net::ERR_CERT|net::ERR_PROXY|net::ERR_TUNNEL/.test(m.text())) consoleErrors.push(`${page.url().replace(base, '')}: ${m.text().slice(0, 120)}`); });
page.on('pageerror', (e) => consoleErrors.push(`${page.url().replace(base, '')}: ${e.message.slice(0, 120)}`));
const axeSrc = readFileSync(join(process.cwd(), 'node_modules/axe-core/axe.min.js'), 'utf8');
const axeViolations = []; const hscroll = []; const bookLinks = new Set();
for (const p of pages) {
  await page.setViewportSize({ width: 1280, height: 900 });
  const res = await page.goto(base + p, { waitUntil: 'load', timeout: 60000 }); await page.waitForTimeout(600);
  if (!res || res.status() >= 400) { fail('pages', `${p} returned ${res?.status()}`); continue; }
  for (const href of await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')))) { if (href.startsWith('/') && !href.startsWith('//')) internal.add(href.split('#')[0].split('?')[0]); }
  for (const href of await page.$$eval('[data-book]', (as) => as.map((a) => a.getAttribute('href')))) bookLinks.add(href);
  if (!p.includes('/print')) {
    await page.evaluate(axeSrc);
    const axe = await page.evaluate(async () => await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa', 'best-practice'] }));
    for (const v of axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact))) axeViolations.push(`${p}: ${v.id} (${v.nodes.length})`);
    for (const w of widths) { await page.setViewportSize({ width: w, height: 900 }); const sw = await page.evaluate(() => document.documentElement.scrollWidth); if (sw > w + 1) hscroll.push(`${p} @${w}: ${sw}px`); }
  }
}
// Internal links
{
  const broken = [...internal].filter((h) => { const p = h === '/' ? '/index.html' : h; return !(existsSync(join(dist, p)) || existsSync(join(dist, p + '.html')) || existsSync(join(dist, p, 'index.html'))); });
  broken.length ? fail('internal-links', broken.join(', ')) : pass('internal-links', `${internal.size} checked`);
}
// Booking links resolve
{
  const bad = [];
  for (const h of bookLinks) { if (!h || h === '#') bad.push('(empty)'); else if (h.startsWith('http')) { try { const r = await fetch(h, { method: 'GET', redirect: 'follow' }); if (r.status >= 400) bad.push(`${h} → ${r.status}`); } catch (e) { bad.push(`${h} → ${e.message}`); } } }
  bad.length ? fail('booking-links', bad.join('; ')) : pass('booking-links', `${bookLinks.size} targets`);
}
axeViolations.length ? fail('axe', axeViolations.slice(0, 8).join('; ')) : pass('axe');
consoleErrors.length ? fail('console', [...new Set(consoleErrors)].slice(0, 5).join('; ')) : pass('console');
hscroll.length ? fail('viewports', hscroll.slice(0, 8).join('; ')) : pass('viewports', widths.join('/'));
// JS payload on the home page (gzipped, excluding the lazy map chunk)
{
  await page.setViewportSize({ width: 1280, height: 900 });
  const sizes = [];
  page.on('response', () => {});
  const seen = new Set();
  const handler = async (r) => { const u = r.url(); if (u.startsWith(base) && /\.js(\?|$)/.test(u) && !seen.has(u)) { seen.add(u); try { sizes.push([u.replace(base, ''), gzipSync(await r.body()).length]); } catch {} } };
  page.on('response', handler);
  await page.goto(base + '/', { waitUntil: 'load' }); await page.waitForTimeout(800); page.off('response', handler);
  const total = sizes.filter(([u]) => !/maplibre/i.test(u)).reduce((a, [, n]) => a + n, 0);
  total > 150 * 1024 ? fail('js-payload', `${Math.round(total / 1024)} KB gzipped`) : pass('js-payload', `${Math.round(total / 1024)} KB gzipped`);
  results.js = sizes;
}
// Maps: attribution, static fallback, lazy
{
  const withMap = htmlFiles.filter((f) => readFileSync(f, 'utf8').includes('data-route-map'));
  const bad = withMap.filter((f) => { const t = readFileSync(f, 'utf8'); return !(t.includes('data-route-static') && t.includes('data-route-attrib') && !t.includes('maplibre-gl.css')); });
  bad.length ? fail('maps', bad.map((f) => f.replace(dist, '')).join(', ')) : pass('maps', `${withMap.length} route maps`);
}
await browser.close();

// Lighthouse mobile
if (!skipLighthouse) {
  try {
    const lighthouse = (await import('lighthouse')).default;
    const { launch } = await import('chrome-launcher');
    const chrome = await launch({ chromePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', chromeFlags: ['--headless=new', '--no-sandbox'] });
    const lhr = (await lighthouse(base + '/', { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] })).lhr;
    await chrome.kill();
    const sc = Object.fromEntries(Object.entries(lhr.categories).map(([k, v]) => [k, Math.round(v.score * 100)]));
    const lcp = lhr.audits['largest-contentful-paint'].numericValue / 1000, cls = lhr.audits['cumulative-layout-shift'].numericValue;
    // SEO is scored with noindex ignored while in preview.
    const seoAudits = Object.values(lhr.audits).filter((a) => lhr.categories.seo.auditRefs.some((r) => r.id === a.id) && a.score !== null && !['is-crawlable', 'robots-txt'].includes(a.id));
    const seo = preview ? Math.round((seoAudits.filter((a) => a.score === 1).length / seoAudits.length) * 100) : sc.seo;
    results.lighthouse = { ...sc, seo, lcp: +lcp.toFixed(2), cls: +cls.toFixed(3) };
    const minima = { performance: 90, accessibility: 95, 'best-practices': 95 };
    for (const [k, min] of Object.entries(minima)) sc[k] < min ? fail('lighthouse', `${k} ${sc[k]} < ${min}`) : pass('lighthouse', `${k} ${sc[k]}`);
    seo < 95 ? fail('lighthouse', `seo ${seo} < 95`) : pass('lighthouse', `seo ${seo}`);
    lcp > 2.5 ? fail('cwv', `LCP ${lcp.toFixed(2)}s`) : pass('cwv', `LCP ${lcp.toFixed(2)}s`);
    cls > 0.1 ? fail('cwv', `CLS ${cls.toFixed(3)}`) : pass('cwv', `CLS ${cls.toFixed(3)}`);
  } catch (e) { warnings.push(`lighthouse could not run: ${e.message}`); log(`WARN lighthouse could not run: ${e.message}`); }
}
await close();
writeFileSync(join(qaDir, 'qa.json'), JSON.stringify({ slug, date: new Date().toISOString(), failures, warnings, ...results }, null, 2));
log(`\n${failures.length ? failures.length + ' gate(s) failed' : 'All gates passed'}. Report: sites/${slug}/qa/qa.json`);
process.exit(failures.length ? 1 : 0);

function walk(d) { return readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; }); }
function visibleText(html) { return html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' '); }
function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
