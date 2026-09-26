// B10 design review capture: home and best experience page at 390 and 1440,
// next to the Bakers equivalents, for a separate reviewing subagent.
import { chromium } from 'playwright';
import { mkdirSync, existsSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { serve, settle } from './lib/serve.mjs';
import { siteDir, slugArg, ROOT, log } from './lib/site.mjs';
const slug = slugArg();
const round = process.argv[3] || '1';
const dir = siteDir(slug); const out = join(dir, 'qa', 'review', `round-${round}`); mkdirSync(out, { recursive: true });
const bakersDist = join(ROOT, 'sites/bakers/dist');
const browser = await chromium.launch();
async function capture(dist, label) {
  if (!existsSync(dist)) { log(`skip ${label}: no dist`); return; }
  const { base, close } = await serve(dist);
  const exp = readdirSync(join(dist, 'experiences')).filter((f) => f.endsWith('.html')).map((f) => '/experiences/' + f.replace('.html', ''));
  const best = process.argv[4] ? '/experiences/' + process.argv[4] : exp[0];
  for (const w of [390, 1440]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' }); const page = await ctx.newPage();
    for (const [name, p] of [['home', '/'], ['experience', best]]) { if (!p) continue; await page.goto(base + p, { waitUntil: 'load', timeout: 60000 }); await settle(page); await page.screenshot({ path: join(out, `${label}-${name}-${w}.png`), fullPage: true }); log(`review ${label}-${name}-${w}.png`); }
    await ctx.close();
  }
  await close();
}
await capture(join(dir, 'dist'), slug);
if (slug !== 'bakers') await capture(bakersDist, 'bakers');
await browser.close();
const RUBRIC = `# Design review rubric (B10)

Score each criterion 1 to 5 with one sentence of evidence and one specific fix for anything under 5. Be harsh. Every criterion must reach 4.

| Criterion | A 5 looks like |
|---|---|
| First five seconds | On a phone, without scrolling, a stranger knows who this is, where it is, what they do and how to book |
| Thesis | The hero says something only this operator could say |
| Imagery | Every image earns its size. No weak, blurry or repeated photos. The sequence tells a story |
| Typography and rhythm | Clear hierarchy, generous space, consistent spacing, nothing cramped |
| Trust | Real reviews, real people, real credentials near the point of booking |
| Path to booking | Every page has an obvious next step, booking two taps away or less |
| Mobile | Reads beautifully at 390px. The book bar helps rather than annoys |
| Their brand | The owner would recognise it as theirs. Not a Bakers clone or a template |
| Copy | Short, specific, in their voice, no filler |
| Restraint | Every section and feature earns its place |
| Memorability | You'd remember one thing after closing the tab |

Save scores in the site's review.md under a heading for this round.
`;
writeFileSync(join(out, 'RUBRIC.md'), RUBRIC);
log(`Screenshots and rubric in sites/${slug}/qa/review/round-${round}/. Hand them, with audit.md, to a subagent that did not build the site.`);
