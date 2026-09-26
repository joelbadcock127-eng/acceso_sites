// intake_assets.mjs {slug}: second pass over intake/raw/*.html. Downloads every
// content image (full size variants, not thumbnails) and every PDF or file
// download link, one request per second, and drops images under 400px wide.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { siteDir, slugArg, readJson, log } from './lib/site.mjs';
const slug = slugArg();
const dir = siteDir(slug); const raw = join(dir, 'intake/raw'); const imgDir = join(dir, 'intake/images'); const pdfDir = join(dir, 'intake/pdfs');
mkdirSync(imgDir, { recursive: true }); mkdirSync(pdfDir, { recursive: true });
const content = readJson(join(dir, 'intake/content.json'), { images: [], pdfs: [] });
const origin = new URL(content.source ?? 'https://' + slug).origin;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const imgs = new Map(); const files = new Set();
for (const f of readdirSync(raw).filter((x) => x.endsWith('.html'))) {
  const html = readFileSync(join(raw, f), 'utf8');
  for (const m of html.matchAll(/(?:src|href|data-src)=["']([^"']+\.(?:jpe?g|png|webp)(?:\?[^"']*)?)["']/gi)) {
    let u = new URL(m[1], origin).href; if (!u.startsWith(origin)) continue;
    if (/[-_](XS|S|M|L|Generic|thumb|thumbnail|\d{2,3}x\d{2,3})\.(jpe?g|png|webp)$/i.test(u)) u = u.replace(/[-_](XS|S|M|L|Generic)\.(jpe?g|png|webp)$/i, '_XL.$2'); // Joomla K2 sizes
    if (/logo|icon|sprite|badge|pixel|button/i.test(u)) continue;
    const alt = html.match(new RegExp(`<img[^>]*src=["']${m[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*alt=["']([^"']*)["']`, 'i'))?.[1] ?? '';
    if (!imgs.has(u)) imgs.set(u, { url: u, alt, page: f.replace(/\.html$/, '') });
  }
  for (const m of html.matchAll(/href=["']([^"']+(?:\.pdf|\/download\/[^"']+))["']/gi)) { const u = new URL(m[1], origin).href; if (u.startsWith(origin)) files.add(u); }
}
log(`${imgs.size} images and ${files.size} files to fetch`);
let n = readdirSync(imgDir).filter((f) => /^img-\d+/.test(f)).length; const kept = content.images ?? [];
for (const im of imgs.values()) {
  if (kept.some((k) => k.url === im.url)) continue;
  try {
    const r = await fetch(im.url); if (!r.ok) { await sleep(1000); continue; }
    const buf = Buffer.from(await r.arrayBuffer()); const meta = await sharp(buf).metadata().catch(() => null);
    if (!meta || meta.width < 400) { await sleep(1000); continue; }
    const file = `img-${String(++n).padStart(3, '0')}.${meta.format === 'jpeg' ? 'jpg' : meta.format}`;
    writeFileSync(join(imgDir, file), buf); kept.push({ ...im, width: meta.width, height: meta.height, file }); log(`image ${file} ${meta.width}x${meta.height} ${im.url.slice(origin.length)}`);
  } catch (e) { log(`skip ${im.url}: ${e.message}`); }
  await sleep(1000);
}
const pdfs = content.pdfs ?? [];
for (const u of files) {
  if (pdfs.some((p) => p.url === u)) continue;
  try {
    const r = await fetch(u); if (!r.ok) { await sleep(1000); continue; }
    const cd = r.headers.get('content-disposition') || ''; const name = decodeURIComponent(cd.match(/filename\*?=(?:UTF-8'')?"?([^";]+)/i)?.[1] ?? u.split('/').pop().split('?')[0]).replace(/[^\w.() -]+/g, '_');
    const file = /\.[a-z0-9]{2,4}$/i.test(name) ? name : name + '.pdf';
    writeFileSync(join(pdfDir, file), Buffer.from(await r.arrayBuffer())); pdfs.push({ url: u, file }); log(`file ${file}`);
  } catch (e) { log(`skip ${u}: ${e.message}`); }
  await sleep(1000);
}
content.images = kept; content.pdfs = pdfs;
writeFileSync(join(dir, 'intake/content.json'), JSON.stringify(content, null, 2));
writeFileSync(join(imgDir, 'index.json'), JSON.stringify(kept, null, 2));
log(`Done: ${kept.length} images, ${pdfs.length} files in intake/.`);
