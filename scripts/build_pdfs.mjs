// A4c: render every print route to PDF with Playwright, write to
// public/downloads, and record pages and size in each experience's frontmatter.
import { chromium } from 'playwright';
import { mkdirSync, readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { serve } from './lib/serve.mjs';
import { siteDir, slugArg, log } from './lib/site.mjs';
const slug = slugArg();
const dir = siteDir(slug); const dist = join(dir, 'dist');
if (!existsSync(dist) || process.argv.includes('--build')) { const r = spawnSync('pnpm', ['exec', 'astro', 'build'], { cwd: dir, stdio: 'inherit' }); if (r.status) process.exit(r.status); }
const outDir = join(dir, 'public', 'downloads'); mkdirSync(outDir, { recursive: true });
const { base, close } = await serve(dist);
const browser = await chromium.launch();
const page = await browser.newPage();
const expDir = join(dir, 'src/content/experiences');
const results = [];
for (const f of readdirSync(expDir).filter((x) => x.endsWith('.md'))) {
  const eslug = f.replace(/\.md$/, '');
  const jobs = [['trip-notes', `/experiences/${eslug}/trip-notes/print`], ['packing-list', `/experiences/${eslug}/packing-list/print`]];
  const downloads = [];
  for (const [kind, route] of jobs) {
    if (!existsSync(join(dist, route + '.html'))) continue;
    await page.goto(base + route, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const file = join(outDir, `${eslug}-${kind}.pdf`);
    await page.pdf({ path: file, format: 'A4', printBackground: true, preferCSSPageSize: true, margin: { top: '18mm', right: '16mm', bottom: '20mm', left: '16mm' }, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: `<div style="font-size:8px;color:#666;width:100%;text-align:center;font-family:sans-serif">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>` });
    const sizeKb = Math.round(statSync(file).size / 1024);
    const pages = countPages(readFileSync(file));
    if (sizeKb > 3072) log(`WARN ${file} is ${sizeKb} KB, over the 3 MB limit`);
    downloads.push({ kind, file: `/downloads/${eslug}-${kind}.pdf`, pages, sizeKb });
    log(`pdf ${eslug}-${kind}.pdf: ${pages} pages, ${sizeKb} KB`);
  }
  // Record in frontmatter (generated block, not hand edited)
  const p = join(expDir, f); let text = readFileSync(p, 'utf8');
  const block = downloads.length ? 'downloads:\n' + downloads.map((d) => `  - { kind: "${d.kind}", file: "${d.file}", pages: ${d.pages}, sizeKb: ${d.sizeKb} }`).join('\n') + '\n' : 'downloads: []\n';
  text = /^downloads:[\s\S]*?(?=^[a-zA-Z]+:|^---)/m.test(text) ? text.replace(/^downloads:[\s\S]*?(?=^[a-zA-Z]+:|^---)/m, block) : text.replace(/^---\n/, '---\n' + block);
  writeFileSync(p, text);
  results.push({ eslug, downloads });
}
if (existsSync(join(dist, 'welcome-pack/print.html'))) { await page.goto(base + '/welcome-pack/print', { waitUntil: 'networkidle' }); await page.pdf({ path: join(outDir, 'welcome-pack.pdf'), format: 'A4', printBackground: true }); log('pdf welcome-pack.pdf'); }
await browser.close(); await close();
// Also drop the PDFs into the current dist so a deploy from this build carries them.
if (existsSync(join(dist, 'downloads')) || existsSync(dist)) { mkdirSync(join(dist, 'downloads'), { recursive: true }); for (const f of readdirSync(outDir)) if (f.endsWith('.pdf')) writeFileSync(join(dist, 'downloads', f), readFileSync(join(outDir, f))); }
log(`Done. PDFs are in public/downloads (commit them) and copied into dist/downloads. Rebuild so the download cards show page counts and sizes.`);
function countPages(buf) { const m = buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g); return m ? m.length : 1; }
