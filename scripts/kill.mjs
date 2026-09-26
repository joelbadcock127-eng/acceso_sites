// kill.mjs {slug}: delete the Pages project, D1 database, R2 intake folder and site folder; mark killed.
import { rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, readRegistry, updateRegistry, slugArg, log } from './lib/site.mjs';
const slug = slugArg();
if (slug.startsWith('_demo') || slug === 'bakers') { console.error('Refusing to kill the demo or Bakers'); process.exit(1); }
const entry = readRegistry().find((s) => s.slug === slug);
if (!entry) { console.error('Not in sites.json'); process.exit(1); }
if (entry.status === 'live') { console.error('Refusing to kill a live site. Set its status first if you really mean it.'); process.exit(1); }
const w = (a) => { const r = spawnSync('pnpm', ['exec', 'wrangler', ...a], { cwd: ROOT, encoding: 'utf8' }); log((r.stdout || r.stderr).trim()); };
if (process.env.CLOUDFLARE_API_TOKEN) {
  if (entry.pagesProject) w(['pages', 'project', 'delete', entry.pagesProject, '--yes']);
  if (entry.d1) w(['d1', 'delete', `${entry.pagesProject}-requests`, '--skip-confirmation']);
  w(['r2', 'object', 'delete', `acceso-intake/${slug}/`, '--recursive']);
} else log('CLOUDFLARE_API_TOKEN not set: delete the Pages project, D1 database and R2 folder by hand.');
const dir = join(ROOT, 'sites', slug);
if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
updateRegistry(slug, { status: 'killed', killedOn: new Date().toISOString().slice(0, 10), previewUrl: null });
log(`Killed ${slug}.`);
