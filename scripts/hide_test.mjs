// A11: build the demo with the hide test route and assert every optional
// component rendered nothing with empty content.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { siteDir } from './lib/site.mjs';
const slug = process.argv[2] || '_demo_ridgeline';
const dir = siteDir(slug);
const r = spawnSync('pnpm', ['exec', 'astro', 'build'], { cwd: dir, stdio: 'inherit', env: { ...process.env, KIT_HIDE_TEST: '1' } });
if (r.status) process.exit(r.status);
const html = readFileSync(join(dir, 'dist/_kit/empty.html'), 'utf8');
const m = html.match(/<div id="hide-test">([\s\S]*?)<\/div>\s*<\/main>/);
const inner = (m ? m[1] : 'MISSING').replace(/<!--[\s\S]*?-->/g, '').trim();
if (inner.length) { console.error('Hide test FAILED. Rendered output inside #hide-test:\n' + inner.slice(0, 2000)); process.exit(1); }
console.log('Hide test passed: every optional component rendered nothing with empty content.');
