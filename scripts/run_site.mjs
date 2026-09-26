// pnpm build:site {slug} / pnpm dev:site {slug}: run Astro inside a site folder.
import { spawnSync } from 'node:child_process';
import { siteDir } from './lib/site.mjs';
const [cmd, slug] = process.argv.slice(2);
if (!cmd || !slug) { console.error('Usage: node scripts/run_site.mjs build|dev|preview {slug}'); process.exit(2); }
const r = spawnSync('pnpm', ['exec', 'astro', cmd, ...process.argv.slice(4)], { cwd: siteDir(slug), stdio: 'inherit', env: { ...process.env } });
process.exit(r.status ?? 1);
