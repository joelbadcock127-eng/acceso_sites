// B2: audit.mjs {slug}. Writes audit.md from intake/content.json plus a live
// Lighthouse mobile run on their home page. Each finding carries its evidence.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { siteDir, slugArg, readJson, log } from './lib/site.mjs';
const slug = slugArg();
const dir = siteDir(slug); const intake = readJson(join(dir, 'intake/content.json'));
if (!intake) { console.error('Run intake.mjs first'); process.exit(2); }
mkdirSync(join(dir, 'intake/evidence'), { recursive: true });
const findings = []; const year = new Date().getFullYear();
const add = (cat, text, evidence) => findings.push({ cat, text, evidence });
for (const p of intake.pages) {
  const txt = existsSync(join(dir, p.textFile)) ? readFileSync(join(dir, p.textFile), 'utf8') : '';
  // Past years only count when they sit in the page title or heading (a dated tour or program), not in body text.
  for (const y of (p.title + ' ' + p.h1.join(' ')).match(/\b20(1\d|2[0-5])\b/g) ?? []) if (Number(y) < year) { add('Stale content', `"${p.title}" is dated ${y}`, p.url); break; }
  if (/covid|coronavirus/i.test(txt)) add('Stale content', `COVID notice still on ${p.url}`, p.url);
  const cy = txt.match(/©\s*(20(1\d|2[0-5]))\b/); if (cy && p.url.replace(/\/$/, '') === intake.source.replace(/\/$/, '')) add('Stale content', `Copyright line still says ${cy[1]}`, p.url);
  if (!p.title) add('Search basics', `No title on ${p.url}`, p.url);
  if (!p.description) add('Search basics', `No meta description on ${p.url}`, p.url);
  if (!p.jsonld?.length && p.url === intake.source) add('Search basics', 'No structured data on the home page', p.url);
  if (!p.url.startsWith('https://')) add('Broken things', `No https on ${p.url}`, p.url);
}
const titles = intake.pages.map((p) => p.title); const dup = titles.filter((t, i) => t && titles.indexOf(t) !== i);
if (dup.length) add('Search basics', `Duplicate titles: "${dup[0]}"`, intake.source);
for (const f of intake.failed) if (!/Download is starting|ERR_TOO_MANY_RETRIES|ERR_CERT/.test(f)) add('Broken things', `Could not fetch ${f}`, f);
const allText = intake.pages.map((p) => existsSync(join(dir, p.textFile)) ? readFileSync(join(dir, p.textFile), 'utf8') : '').join('\n');
if (!/\$\s?\d/.test(allText)) add('Missing basics', 'No prices anywhere on the site', intake.source);
if (!/\b(0[2-9]|\+61|1300|1800)[\d\s]{7,}/.test(allText)) add('Missing basics', 'No phone number found', intake.source);
if (!/@[\w.-]+\.\w+/.test(allText)) add('Missing basics', 'No email address found', intake.source);
if (intake.booking.group !== 1) add('Booking friction', intake.booking.platform === 'email' ? 'Booking is by email only' : 'No online booking', intake.source);
if (intake.brand.socials.tripadvisor && !/tripadvisor/i.test(allText.slice(0, 5000))) add('Trust gaps', 'Tripadvisor profile linked but reviews not shown on the site', intake.brand.socials.tripadvisor);
try { const r = await fetch(new URL('/sitemap.xml', intake.source)); if (!r.ok) add('Search basics', 'No sitemap.xml', intake.source + '/sitemap.xml'); } catch {}
// Lighthouse mobile on their live home page
let lh = null;
try {
  const lighthouse = (await import('lighthouse')).default; const { launch } = await import('chrome-launcher');
  const chrome = await launch({ chromePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', chromeFlags: ['--headless=new', '--no-sandbox', ...(process.env.INTAKE_IGNORE_TLS ? ['--ignore-certificate-errors'] : [])] });
  const { lhr } = await lighthouse(intake.source, { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] });
  await chrome.kill();
  lh = { performance: Math.round(lhr.categories.performance.score * 100), accessibility: Math.round(lhr.categories.accessibility.score * 100), bestPractices: Math.round(lhr.categories['best-practices'].score * 100), seo: Math.round(lhr.categories.seo.score * 100), lcp: (lhr.audits['largest-contentful-paint'].numericValue / 1000).toFixed(1), cls: lhr.audits['cumulative-layout-shift'].numericValue.toFixed(3) };
  if (lh.performance < 50) add('Speed and mobile', `Mobile performance score ${lh.performance} out of 100`, intake.source);
  writeFileSync(join(dir, 'intake/evidence/lighthouse-live.json'), JSON.stringify(lh));
} catch (e) { log('Lighthouse skipped: ' + e.message); }
// Evidence screenshot of the live home page
try { const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 390, height: 844 }, ignoreHTTPSErrors: !!process.env.INTAKE_IGNORE_TLS }); await pg.goto(intake.source, { waitUntil: 'networkidle', timeout: 60000 }); await pg.screenshot({ path: join(dir, 'intake/evidence/live-home-390.png'), fullPage: true }); await b.close(); } catch {}
const groups = {}; for (const f of findings) (groups[f.cat] ??= []).push(f);
const hooks = findings.filter((f) => ['Stale content', 'Speed and mobile', 'Booking friction', 'Missing basics'].includes(f.cat)).slice(0, 3).map((f) => f.text);
const archetype = /lodge|accommodation|hut|glamping|pack.?free/i.test(allText) ? 'lodge' : /aboriginal|first nations|cultural|country|traditional owner/i.test(allText) ? 'country' : /bird|wildlife|nocturnal|species|rainforest/i.test(allText) ? 'naturalist' : 'expedition';
const md = `# Audit: ${intake.source}\n\nCrawled ${intake.crawledAt.slice(0, 10)}. ${intake.pages.length} pages, ${intake.images.length} images, ${intake.pdfs.length} PDFs.\n\n${Object.entries(groups).map(([cat, fs]) => `## ${cat}\n\n${fs.map((f) => `- ${f.text}. Evidence: ${f.evidence}`).join('\n')}\n`).join('\n')}\n## Speed and mobile (Lighthouse, mobile, live home page)\n\n${lh ? `| Performance | Accessibility | Best practices | SEO | LCP | CLS |\n|---|---|---|---|---|---|\n| ${lh.performance} | ${lh.accessibility} | ${lh.bestPractices} | ${lh.seo} | ${lh.lcp}s | ${lh.cls} |` : 'Lighthouse did not run.'}\n\n## Booking\n\nPlatform: ${intake.booking.platform}. Booking Group ${intake.booking.group}.${intake.booking.urls.length ? ` Booking URLs: ${intake.booking.urls.join(', ')}` : ''}\n\n## Three email hooks\n\n${hooks.map((h, i) => `${i + 1}. ${h}.`).join('\n') || '1. (write from the findings above)'}\n\n## Gap list (facts needed before launch)\n\n- High resolution logo\n- Any price, date, grade or group size the site doesn't state\n- Policies (cancellation, privacy, terms) in their own words\n\n## Archetype chosen\n\n**${archetype}**, from the product mix on their site. Johnny can override with "Use archetype {name}".\n\n## Signature features and downloads\n\nBuilt: (fill in after B8b). Skipped for lack of content: (fill in; goes into the launch interview and shot list).\n`;
writeFileSync(join(dir, 'audit.md'), md);
log(`audit.md written with ${findings.length} findings. Archetype: ${archetype}.`);
