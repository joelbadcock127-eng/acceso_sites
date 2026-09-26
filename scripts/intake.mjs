// B1: intake.mjs {url} {slug}. Polite crawl (1 request per second, max 60
// pages, no admin paths), raw HTML and text, images over 400px, PDFs, booking
// platform detection, brand colours and fonts, all into sites/{slug}/intake/.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { siteDir, log } from './lib/site.mjs';
const [url, slug] = process.argv.slice(2);
if (!url || !slug) { console.error('Usage: node scripts/intake.mjs {url} {slug}'); process.exit(2); }
const dir = siteDir(slug); const out = join(dir, 'intake');
for (const d of ['raw', 'images', 'pdfs', 'evidence', 'social']) mkdirSync(join(out, d), { recursive: true });
const origin = new URL(url).origin;
const MAX = 60; const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const skip = /\/(wp-admin|wp-login|admin|login|cart|checkout|account|feed|xmlrpc|wp-json)\b|\.(jpg|jpeg|png|gif|webp|svg|css|js|zip|mp4)(\?|$)/i;
const queue = [url]; const seen = new Set(); const pages = []; const failed = [];
// Sitemap first, if there is one
try { const sm = await (await fetch(origin + '/sitemap.xml')).text(); for (const m of sm.matchAll(/<loc>([^<]+)<\/loc>/g)) if (m[1].startsWith(origin) && !skip.test(m[1])) queue.push(m[1]); } catch {}
const browser = await chromium.launch(); const page = await browser.newPage({ userAgent: 'AccesoIntake/1.0 (+site preview for the owner; one request per second)' });
const images = new Map(); const pdfs = new Set(); const booking = { platform: null, urls: new Set(), scripts: new Set() };
let brand = { colors: {}, fonts: new Set(), logo: null, socials: {} };
while (queue.length && pages.length < MAX) {
  const u = queue.shift().split('#')[0]; if (seen.has(u) || !u.startsWith(origin) || skip.test(u)) continue; seen.add(u);
  try {
    const res = await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 30000 });
    if (!res || res.status() >= 400) { failed.push(`${u} (${res?.status()})`); continue; }
    const html = await page.content();
    const text = await page.evaluate(() => document.body.innerText);
    const name = (new URL(u).pathname.replace(/\/$/, '') || '/index').replace(/^\//, '').replace(/\//g, '__');
    writeFileSync(join(out, 'raw', name + '.html'), html); writeFileSync(join(out, 'raw', name + '.txt'), text);
    const meta = await page.evaluate(() => ({ title: document.title, description: document.querySelector('meta[name="description"]')?.content ?? '', h1: [...document.querySelectorAll('h1')].map((h) => h.innerText.trim()), canonical: document.querySelector('link[rel="canonical"]')?.href ?? '', jsonld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent) }));
    pages.push({ url: u, status: res.status(), ...meta, textFile: `intake/raw/${name}.txt` });
    const links = await page.$$eval('a[href]', (as) => as.map((a) => a.href));
    for (const l of links) { if (l.startsWith(origin) && !seen.has(l)) queue.push(l); if (/\.pdf(\?|$)/i.test(l)) pdfs.add(l); if (/fareharbor\.com|rezdy\.com|bookeo\.com|checkfront\.com|peek\.com|respax|formstack|cal\.com/i.test(l)) booking.urls.add(l); if (/facebook\.com|instagram\.com|youtube\.com|tripadvisor\.com|g\.page|google\.com\/maps/i.test(l)) { const k = l.match(/facebook|instagram|youtube|tripadvisor|google/i)[0].toLowerCase(); brand.socials[k] ??= l; } }
    for (const s of await page.$$eval('script[src]', (ss) => ss.map((s) => s.src))) if (/fareharbor|rezdy|bookeo|checkfront|peek|respax|woocommerce|cal\.com/i.test(s)) booking.scripts.add(s);
    const imgs = await page.$$eval('img', (is) => is.map((i) => ({ src: i.currentSrc || i.src, alt: i.alt, w: i.naturalWidth, h: i.naturalHeight, srcset: i.srcset })));
    for (const im of imgs) { if (!im.src || im.w < 400 || /pixel|icon|logo|badge|sprite/i.test(im.src + im.alt)) { if (/logo/i.test(im.src + im.alt) && !brand.logo) brand.logo = im.src; continue; } const best = im.srcset ? im.srcset.split(',').map((s) => s.trim().split(' ')).sort((a, b) => parseInt(b[1]) - parseInt(a[1]))[0][0] : im.src; images.set(best, { url: best, alt: im.alt, width: im.w, height: im.h, page: u }); }
    const css = await page.evaluate(() => { const fonts = new Set(); const colors = {}; for (const el of document.querySelectorAll('h1,h2,h3,a.button,.btn,button,body,header,footer,nav')) { const s = getComputedStyle(el); fonts.add(s.fontFamily.split(',')[0].replace(/["']/g, '').trim()); for (const c of [s.color, s.backgroundColor]) if (c && !c.includes('0, 0, 0, 0')) colors[c] = (colors[c] || 0) + 1; } return { fonts: [...fonts], colors }; });
    css.fonts.forEach((f) => brand.fonts.add(f)); for (const [c, n] of Object.entries(css.colors)) brand.colors[c] = (brand.colors[c] || 0) + n;
    if (html.includes('woocommerce')) booking.platform ??= 'woocommerce';
    log(`crawled ${u}`);
  } catch (e) { failed.push(`${u} (${e.message.split('\n')[0]})`); }
  await sleep(1000);
}
// Download images and PDFs, politely
let n = 0;
for (const im of images.values()) { try { const r = await fetch(im.url); if (!r.ok) continue; const ext = (r.headers.get('content-type') || '').split('/')[1]?.split(';')[0] || 'jpg'; const f = `img-${String(++n).padStart(3, '0')}.${ext.replace('jpeg', 'jpg')}`; writeFileSync(join(out, 'images', f), Buffer.from(await r.arrayBuffer())); im.file = f; } catch {} await sleep(1000); }
const pdfList = [];
for (const p of pdfs) { try { const r = await fetch(p); if (!r.ok) continue; const f = decodeURIComponent(p.split('/').pop().split('?')[0]); writeFileSync(join(out, 'pdfs', f), Buffer.from(await r.arrayBuffer())); pdfList.push({ url: p, file: f }); } catch {} await sleep(1000); }
await browser.close();
const all = [...booking.urls, ...booking.scripts].join(' ');
booking.platform = /fareharbor/i.test(all) ? 'fareharbor' : /rezdy/i.test(all) ? 'rezdy' : /bookeo/i.test(all) ? 'bookeo' : /checkfront/i.test(all) ? 'checkfront' : /peek\.com/i.test(all) ? 'peek' : /cal\.com/i.test(all) ? 'calcom' : booking.platform ?? (pages.some((p) => /mailto:/.test(p.textFile)) ? 'email' : 'none');
const group = ['fareharbor', 'rezdy', 'bookeo', 'checkfront', 'peek', 'woocommerce'].includes(booking.platform) ? 1 : 2;
const content = { source: url, crawledAt: new Date().toISOString(), pages, failed, images: [...images.values()], pdfs: pdfList, booking: { platform: booking.platform, group, urls: [...booking.urls], scripts: [...booking.scripts] }, brand: { ...brand, fonts: [...brand.fonts], colors: Object.entries(brand.colors).sort((a, b) => b[1] - a[1]).slice(0, 12) }, gpx: pages.filter((p) => /gpx|kml/i.test(p.textFile)).map((p) => p.url) };
writeFileSync(join(out, 'content.json'), JSON.stringify(content, null, 2));
writeFileSync(join(out, 'images', 'index.json'), JSON.stringify([...images.values()], null, 2));
log(`\nIntake done: ${pages.length} pages, ${images.size} images, ${pdfList.length} PDFs, booking platform "${booking.platform}" (Group ${group}), ${failed.length} failed. Now fill src/content from intake/content.json and log every fact's URL. Group 3 is a judgement call: use it when they mostly sell private days.`);
if (!existsSync(join(out, 'social', 'captions.md'))) writeFileSync(join(out, 'social', 'captions.md'), '# Social captions\n\nPaste 15 to 30 captions here with URL and date, or use scripts/social_intake.html.\n');
