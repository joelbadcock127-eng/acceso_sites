// B12: pitch.mjs {slug}. Before and after images, a scroll video, a score
// card and the email draft, from audit.md and pitch/pitch.config.json.
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { serve } from './lib/serve.mjs';
import { siteDir, slugArg, readJson, readRegistry, log } from './lib/site.mjs';
const slug = slugArg();
const dir = siteDir(slug); const out = join(dir, 'pitch'); mkdirSync(out, { recursive: true });
const site = readJson(join(dir, 'src/content/site.json')); const reg = readRegistry().find((s) => s.slug === slug) ?? {};
const cfg = readJson(join(out, 'pitch.config.json'), { buildPrice: '', carePrice: '', turnaroundDays: '' });
const intake = readJson(join(dir, 'intake/content.json'));
const live = intake?.source ?? site.preview?.sourceDomain;
const { base, close } = await serve(join(dir, 'dist'));
const browser = await chromium.launch();
const best = readdirSync(join(dir, 'dist/experiences')).filter((f) => f.endsWith('.html'))[0]?.replace('.html', '');
const bestOld = intake?.pages.find((p) => /walk|tour|trek|experience/i.test(p.url) && p.url !== intake.source)?.url;
for (const [w, tag] of [[1440, 'desktop'], [390, 'mobile']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' }); const page = await ctx.newPage();
  const shot = async (u, name) => { try { await page.goto(u, { waitUntil: 'networkidle', timeout: 60000 }); await page.screenshot({ path: join(out, name), fullPage: true }); log('pitch ' + name); } catch (e) { log(`skip ${name}: ${e.message.split('\n')[0]}`); } };
  if (live) await shot(live.startsWith('http') ? live : 'https://' + live, `before-home-${tag}.png`);
  await shot(base + '/', `after-home-${tag}.png`);
  if (bestOld) await shot(bestOld, `before-experience-${tag}.png`);
  if (best) await shot(`${base}/experiences/${best}`, `after-experience-${tag}.png`);
  await ctx.close();
}
// Scroll video: 45 to 60 seconds through home and one experience page at 1440.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: out, size: { width: 1440, height: 900 } } }); const page = await ctx.newPage();
  const scroll = async (u, secs) => { await page.goto(u, { waitUntil: 'networkidle' }); const h = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight); const steps = secs * 30; for (let i = 0; i <= steps; i++) { await page.evaluate((y) => scrollTo(0, y), (h * i) / steps); await page.waitForTimeout(1000 / 30); } };
  await scroll(base + '/', 30); if (best) await scroll(`${base}/experiences/${best}`, 22);
  const v = page.video(); await ctx.close(); const p = await v.path(); renameSync(p, join(out, 'walkthrough.webm'));
  log('pitch walkthrough.webm (convert to MP4 with ffmpeg if the prospect needs it: ffmpeg -i walkthrough.webm -c:v libx264 -pix_fmt yuv420p walkthrough.mp4)');
}
await browser.close(); await close();
// Score card
const liveLh = readJson(join(dir, 'intake/evidence/lighthouse-live.json')); const qa = readJson(join(dir, 'qa/qa.json'))?.lighthouse;
writeFileSync(join(out, 'scorecard.md'), `# Score card: ${site.business.name}\n\n| | Performance | Accessibility | Best practices | SEO |\n|---|---|---|---|---|\n| Current site (mobile) | ${liveLh?.performance ?? '?'} | ${liveLh?.accessibility ?? '?'} | ${liveLh?.bestPractices ?? '?'} | ${liveLh?.seo ?? '?'} |\n| New preview (mobile) | ${qa?.performance ?? '?'} | ${qa?.accessibility ?? '?'} | ${qa?.['best-practices'] ?? '?'} | ${qa?.seo ?? '?'} |\n`);
// Email draft from audit.md hooks
const audit = existsSync(join(dir, 'audit.md')) ? readFileSync(join(dir, 'audit.md'), 'utf8') : '';
const hooks = [...audit.matchAll(/^\d\. (.+?)\.?$/gm)].map((m) => m[1]).slice(0, 3);
const group = site.booking?.group ?? 2; const platform = site.booking?.provider ?? '';
const bookingLine = group === 1 ? `with your ${platform} booking built properly into the site` : group === 2 ? 'with a simple request to book on every walk, so bookings land in your inbox with dates and group size, not a vague email' : 'with online booking for your guiding days that drops straight into your calendar';
const first = site.business.ownerNames?.[0]?.split(' ')[0] ?? '{FirstName}';
const domain = (live ?? '{domain}').replace(/^https?:\/\//, '').replace(/\/$/, '');
const email = `Subject options:
1. I rebuilt ${site.business.name}'s website (it's yours if you want it)
2. ${site.business.name}: a new site, already built

Hi ${first},

I run Bakers Walking Co, a small guided walking business in Tasmania, and I build sites for walking operators on the side.

I had a look at ${domain} and noticed ${hooks[0] ? hooks[0].charAt(0).toLowerCase() + hooks[0].slice(1) : '{hook 1}'}, and ${hooks[1] ? hooks[1].charAt(0).toLowerCase() + hooks[1].slice(1) : '{hook 2}'}. So I rebuilt it using your own photos, words and tours:

${reg.previewUrl ?? '{preview URL}'}
(60 second walkthrough: {video link})

It's yours for ${cfg.buildPrice || '{buildPrice}'}, live on your domain within ${cfg.turnaroundDays || '{turnaroundDays}'} days, ${bookingLine}. After that I can look after hosting and updates for ${cfg.carePrice || '{carePrice}'} a month so your dates and prices never go stale, or you can edit it yourself.

If it's not for you, no worries at all. I'll take the preview down.

Cheers,
Johnny
Acceso AI and Bakers Walking Co
{phone}

---
Day 4 nudge:
Hi ${first}, just checking you saw the preview of the new ${site.business.name} site: ${reg.previewUrl ?? '{preview URL}'}. Happy to walk you through it on a quick call.

Day 10 final:
Hi ${first}, I'm taking the ${site.business.name} preview down on Friday. Happy to keep it up if you want more time, just say the word.
`;
writeFileSync(join(out, 'email.md'), email);
if (!cfg.buildPrice) log('pitch.config.json has no prices yet: the email carries placeholders until Johnny fills it in.');
log(`Pitch pack in sites/${slug}/pitch/ (gitignored).`);
