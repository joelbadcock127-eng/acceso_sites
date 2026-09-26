// new_client.mjs {slug} [--business "Name"] [--no-cloudflare]
// Creates sites/{slug} from the demo with the demo content cleared, adds the
// sites.json entry, and creates the Pages project and D1 database with Wrangler.
import { cpSync, rmSync, mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { ROOT, updateRegistry, readRegistry, slugArg, log } from './lib/site.mjs';
const slug = slugArg();
if (!/^[a-z0-9_]+$/.test(slug)) { console.error('Slug must be lower case letters, digits and underscores'); process.exit(2); }
const args = process.argv.slice(3);
const business = args.includes('--business') ? args[args.indexOf('--business') + 1] : slug.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const dir = join(ROOT, 'sites', slug);
if (existsSync(dir) || readRegistry().some((s) => s.slug === slug)) { console.error(`Site "${slug}" already exists`); process.exit(1); }
cpSync(join(ROOT, 'sites/_demo_ridgeline'), dir, { recursive: true, filter: (src) => !/node_modules|dist|\.astro|qa|src[\/\\]generated|src[\/\\]images[\/\\]demo-|public[\/\\]downloads/.test(src) });
// Clear the demo content, keep the shapes.
const content = join(dir, 'src/content');
for (const d of ['experiences', 'posts', 'legal', 'routes']) { rmSync(join(content, d), { recursive: true, force: true }); mkdirSync(join(content, d), { recursive: true }); writeFileSync(join(content, d, '.gitkeep'), ''); }
for (const f of ['testimonials', 'faqs', 'guides', 'press', 'stats', 'species']) writeFileSync(join(content, f + '.json'), '[]\n');
rmSync(join(content, 'signature.json'), { force: true });
writeFileSync(join(content, 'plan.json'), '{}\n');
const site = JSON.parse(readFileSync(join(content, 'site.json'), 'utf8'));
const cleared = { business: { name: business, ownerNames: [], socials: {}, acknowledgement: null, driveTimes: [] }, booking: { provider: 'request', group: 2, responseTime: '24 hours' }, nav: { primary: [{ label: 'Experiences', href: '/experiences' }, { label: 'About', href: '/about' }], groups: [], featured: [] }, footer: { columns: [], legal: [] }, seo: { defaultTitle: business, defaultDescription: `${business}: guided walks.` }, newsletter: null, preview: { enabled: true, preparedFor: business, sourceDomain: '' }, home: { hero: { headline: business }, features: [] }, contact: { interests: [] }, reviews: {}, instagram: {}, analytics: {}, trust: [], seasons: [], youtube: [] };
writeFileSync(join(content, 'site.json'), JSON.stringify(cleared, null, 2) + '\n');
void site;
const theme = JSON.parse(readFileSync(join(dir, 'theme.json'), 'utf8'));
theme.logo = { src: 'images/logo.svg', alt: business, framed: false, invertOnHero: false, height: '3rem', wordmark: true };
theme.texture = 'none';
writeFileSync(join(dir, 'theme.json'), JSON.stringify(theme, null, 2) + '\n');
for (const f of readdirSync(join(dir, 'src/images'))) if (f.startsWith('logo-')) rmSync(join(dir, 'src/images', f));
const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')); pkg.name = `site-${slug}`; writeFileSync(join(dir, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');
for (const f of ['build_plan.md', 'audit.md', 'copy_log.md', 'review.md']) writeFileSync(join(dir, f), `# ${f.replace('.md', '').replace('_', ' ')}: ${business}\n\n`);
writeFileSync(join(dir, 'redirects.json'), '{}\n');
mkdirSync(join(dir, 'intake'), { recursive: true }); mkdirSync(join(dir, 'pitch'), { recursive: true });
writeFileSync(join(dir, 'pitch/pitch.config.json'), JSON.stringify({ buildPrice: '', carePrice: '', turnaroundDays: '' }, null, 2) + '\n');

const suffix = randomBytes(3).toString('base64url').toLowerCase().replace(/[^a-z0-9]/g, 'x').slice(0, 5);
const project = `${slug.replace(/_/g, '-')}-${suffix}`;
let previewUrl = `https://${project}.pages.dev`;
const entry = { slug, business, status: 'prospect', pagesProject: project, previewUrl, domain: null, sentOn: null, deleteAfter: null, bookingGroup: 2, archetype: theme.archetype };
if (!args.includes('--no-cloudflare')) {
  if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ACCOUNT_ID) { log('CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID not set: skipping the Pages project and D1 database. Re-run with them set, or create by hand (docs/STACK_NOTES.md).'); }
  else {
    const w = (a) => { const r = spawnSync('pnpm', ['exec', 'wrangler', ...a], { cwd: ROOT, encoding: 'utf8' }); if (r.status) log(r.stderr || r.stdout); return r.stdout; };
    log(w(['pages', 'project', 'create', project, '--production-branch', 'main']));
    const d1 = w(['d1', 'create', `${project}-requests`]);
    const id = d1.match(/database_id\s*=\s*"([^"]+)"/)?.[1];
    if (id) { writeFileSync(join(dir, 'wrangler.toml'), `name = "${project}"\npages_build_output_dir = "dist"\ncompatibility_date = "2025-05-21"\n\n[[d1_databases]]\nbinding = "DB"\ndatabase_name = "${project}-requests"\ndatabase_id = "${id}"\n`); entry.d1 = id; }
    log(`Now connect the Pages project to the acceso_sites repo in the dashboard: root directory sites/${slug}, build "pnpm install --frozen-lockfile && pnpm build", output "dist", watch paths sites/${slug}/** and packages/kit/**.`);
  }
}
updateRegistry(slug, entry);
log(`Created sites/${slug} for ${business}. Preview URL: ${previewUrl}`);
