// Standalone AA contrast check for a site's theme.json (the build runs it too).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { siteDir, slugArg } from './lib/site.mjs';
const { themeSchema, checkContrast } = await import('../packages/kit/lib/theme/theme.ts').catch(async () => {
  // Node can't import TS directly without a loader; use jiti from the kit's deps.
  const { createJiti } = await import('../node_modules/.pnpm/node_modules/jiti/lib/jiti.mjs');
  return createJiti(import.meta.url)('../packages/kit/lib/theme/theme.ts');
});
const slug = slugArg();
const theme = themeSchema.parse(JSON.parse(readFileSync(join(siteDir(slug), 'theme.json'), 'utf8')));
const res = checkContrast(theme);
for (const r of res) console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${r.pair}: ${r.ratio} (min ${r.min})`);
process.exit(res.every((r) => r.ok) ? 0 : 1);
