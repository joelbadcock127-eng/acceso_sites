// eject.mjs {slug}: bundle one site plus the exact kit it uses into a standalone repo folder.
import { cpSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { ROOT, siteDir, slugArg, log } from './lib/site.mjs';
const slug = slugArg();
const src = siteDir(slug);
const out = join(ROOT, 'ejected', slug); mkdirSync(out, { recursive: true });
const skip = (p) => !/node_modules|[\/\\]dist|\.astro|[\/\\]qa|[\/\\]intake|[\/\\]pitch|src[\/\\]generated/.test(p);
cpSync(join(ROOT, 'packages/kit'), join(out, 'packages/kit'), { recursive: true, filter: skip });
cpSync(src, join(out, 'site'), { recursive: true, filter: skip });
let sha = 'unknown'; try { sha = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim(); } catch {}
const pkg = JSON.parse(readFileSync(join(src, 'package.json'), 'utf8'));
writeFileSync(join(out, 'package.json'), JSON.stringify({ name: `${slug}-site`, private: true, type: 'module', packageManager: 'pnpm@10.33.0', scripts: { build: 'pnpm --filter ./site build', dev: 'pnpm --filter ./site dev' } }, null, 2) + '\n');
writeFileSync(join(out, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n  - site\n');
writeFileSync(join(out, '.npmrc'), readFileSync(join(ROOT, '.npmrc'), 'utf8'));
writeFileSync(join(out, '.gitignore'), 'node_modules/\ndist/\n.astro/\nsite/src/generated/\n');
writeFileSync(join(out, 'README.md'), `# ${pkg.name}\n\nStandalone copy of the site, ejected from acceso_sites at kit commit ${sha}.\n\nThe client owns the content in site/. Acceso keeps the kit's code in packages/kit and licenses it for this site, per the agreement.\n\n\`\`\`bash\npnpm install\npnpm build   # output in site/dist\n\`\`\`\n\nDeploy site/dist to any static host with Pages Functions support (Cloudflare Pages: root directory site, build \`pnpm install && pnpm build\`, output dist).\n`);
if (existsSync(join(out, 'site/functions'))) log('Functions included.');
log(`Ejected to ejected/${slug}. Kit commit ${sha}.`);
