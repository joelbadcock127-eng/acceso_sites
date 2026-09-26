// The kit integration. A site's astro.config.mjs is three lines:
//   import { defineConfig } from 'astro/config';
//   import kit from 'kit';
//   export default defineConfig({ integrations: [kit()] });
//
// It reads the site's theme.json and site.json, fails the build if the theme
// misses AA contrast, injects every kit page route, adds Tailwind and the
// global stylesheet, and at the end of the build writes the Cloudflare files
// (_headers, robots.txt, sitemap.xml, _redirects) for preview or launch.
import type { AstroIntegration } from 'astro';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import tailwind from '@tailwindcss/vite';
import { themeSchema, buildThemeCss, checkContrast } from './lib/theme/theme';

const ROUTES: { pattern: string; entrypoint: string }[] = [
  { pattern: '/', entrypoint: 'kit/pages/index.astro' },
  { pattern: '/experiences', entrypoint: 'kit/pages/experiences/index.astro' },
  { pattern: '/experiences/[slug]', entrypoint: 'kit/pages/experiences/[slug].astro' },
  { pattern: '/experiences/[slug]/trip-notes/print', entrypoint: 'kit/pages/experiences/[slug]/trip-notes/print.astro' },
  { pattern: '/experiences/[slug]/packing-list/print', entrypoint: 'kit/pages/experiences/[slug]/packing-list/print.astro' },
  { pattern: '/welcome-pack/print', entrypoint: 'kit/pages/welcome-pack/print.astro' },
  { pattern: '/about', entrypoint: 'kit/pages/about.astro' },
  { pattern: '/faq', entrypoint: 'kit/pages/faq.astro' },
  { pattern: '/contact', entrypoint: 'kit/pages/contact.astro' },
  { pattern: '/journal', entrypoint: 'kit/pages/journal/index.astro' },
  { pattern: '/journal/[slug]', entrypoint: 'kit/pages/journal/[slug].astro' },
  { pattern: '/private-and-groups', entrypoint: 'kit/pages/private-and-groups.astro' },
  { pattern: '/gift-vouchers', entrypoint: 'kit/pages/gift-vouchers.astro' },
  { pattern: '/downloads', entrypoint: 'kit/pages/downloads.astro' },
  { pattern: '/legal/[slug]', entrypoint: 'kit/pages/legal/[slug].astro' },
  { pattern: '/404', entrypoint: 'kit/pages/404.astro' },
  { pattern: '/_kit/empty', entrypoint: 'kit/pages/_kit/empty.astro' },
];

export interface KitOptions {
  /** Skip the contrast gate (never for a real site; used by the hide test) */
  skipContrast?: boolean;
}

export default function kit(options: KitOptions = {}): AstroIntegration {
  let root = '';
  let preview = true;
  let siteUrl = '';
  return {
    name: 'acceso-kit',
    hooks: {
      'astro:config:setup': ({ config, injectRoute, injectScript, updateConfig, logger }) => {
        root = fileURLToPath(config.root);
        const themePath = join(root, 'theme.json');
        const sitePath = join(root, 'src/content/site.json');
        if (!existsSync(themePath)) throw new Error(`Missing ${themePath}`);
        const theme = themeSchema.parse(JSON.parse(readFileSync(themePath, 'utf8')));
        const site = existsSync(sitePath) ? JSON.parse(readFileSync(sitePath, 'utf8')) : {};
        preview = site?.preview?.enabled !== false;
        siteUrl = site?.seo?.siteUrl ?? '';

        // Contrast gate (A3). Fails the build rather than shipping unreadable text.
        const results = checkContrast(theme);
        const failed = results.filter((r) => !r.ok);
        for (const r of results) logger.info(`${r.advisory ? 'note' : r.ok ? 'ok  ' : 'FAIL'} ${r.pair}: ${r.ratio} (min ${r.min})`);
        if (failed.length && !options.skipContrast) {
          throw new Error(`theme.json fails AA contrast: ${failed.map((f) => `${f.pair} ${f.ratio} < ${f.min}`).join('; ')}`);
        }

        // Generate the token stylesheet into the site, so the editor can see it and builds are reproducible.
        const gen = join(root, 'src/generated');
        mkdirSync(gen, { recursive: true });
        writeFileSync(join(gen, 'theme.css'), buildThemeCss(theme));
        writeFileSync(join(gen, 'theme.json'), JSON.stringify(theme, null, 2));

        // A page exists only if its content exists (A5). Decide from the content files.
        const content = join(root, 'src/content');
        const readJson = (f: string) => { const p = join(content, f); return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null; };
        const count = (dir: string) => { const p = join(content, dir); return existsSync(p) ? readdirSync(p).filter((f) => f.endsWith('.md')).length : 0; };
        const faqs = readJson('faqs.json') ?? []; const guides = readJson('guides.json') ?? [];
        const wants: Record<string, boolean> = {
          '/faq': faqs.length >= 3,
          '/about': !!(site.about || guides.length || site.business?.commitment || site.home?.story),
          '/journal': count('posts') >= 3, '/journal/[slug]': count('posts') >= 3,
          '/private-and-groups': !!site.privateGroups,
          '/gift-vouchers': !!(site.giftVouchers || site.booking?.giftUrl),
          '/downloads': count('experiences') > 0,
          '/legal/[slug]': count('legal') > 0,
          '/welcome-pack/print': existsSync(join(content, 'welcome.md')),
          '/_kit/empty': process.env.KIT_HIDE_TEST === '1',
        };
        for (const r of ROUTES) { if (wants[r.pattern] === false) continue; injectRoute({ ...r, prerender: true }); }
        // Site level override pages (last resort, logged in build_plan.md) live in the site's src/pages and win over kit routes.
        if (!existsSync(join(content, 'plan.json'))) writeFileSync(join(content, 'plan.json'), '{}\n');

        updateConfig({
          site: siteUrl || config.site || 'https://preview.invalid',
          trailingSlash: 'never',
          build: { format: 'file' },
          vite: {
            plugins: [tailwind()],
            resolve: { preserveSymlinks: false },
            ssr: { noExternal: ['kit'] },
          },
          image: { domains: [] },
        });
        injectScript('page-ssr', `import 'kit/styles/global.css'; import '/src/generated/theme.css';`);
      },
      'astro:build:done': ({ dir, pages, logger }) => {
        const out = fileURLToPath(dir);
        const headers: string[] = ['/*', '  X-Content-Type-Options: nosniff', '  Referrer-Policy: strict-origin-when-cross-origin', '  Permissions-Policy: camera=(), microphone=(), geolocation=()'];
        if (preview) headers.push('  X-Robots-Tag: noindex, nofollow');
        headers.push('', '/_astro/*', '  Cache-Control: public, max-age=31536000, immutable', '', '/images/*', '  Cache-Control: public, max-age=31536000, immutable', '', '/downloads/*', '  Cache-Control: public, max-age=3600');
        writeFileSync(join(out, '_headers'), headers.join('\n') + '\n');

        const robots = preview
          ? 'User-agent: *\nDisallow: /\n'
          : `User-agent: *\nAllow: /\nDisallow: /_kit/\nDisallow: /requests\nDisallow: /admin\nSitemap: ${siteUrl}/sitemap.xml\n`;
        writeFileSync(join(out, 'robots.txt'), robots);

        // Sitemap: generated always, disallowed while in preview (B9).
        const urls = pages.map((p) => '/' + p.pathname.replace(/\/$/, '')).filter((p) => !p.startsWith('/_kit') && !p.includes('/print') && p !== '/404');
        const base = siteUrl || '';
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${base}${u === '/' ? '/' : u}</loc></url>`).join('\n')}\n</urlset>\n`;
        writeFileSync(join(out, 'sitemap.xml'), xml);

        // Redirects: only at launch, from redirects.json (B5).
        const redirectsPath = join(root, 'redirects.json');
        if (!preview && existsSync(redirectsPath)) {
          const map = JSON.parse(readFileSync(redirectsPath, 'utf8')) as Record<string, string>;
          const lines = Object.entries(map).filter(([from, to]) => from !== to).map(([from, to]) => `${from} ${to} 301`);
          writeFileSync(join(out, '_redirects'), lines.join('\n') + '\n');
          logger.info(`Wrote ${lines.length} redirects`);
        }
        // Astro writes 404.html for the /404 route; Cloudflare Pages serves it for missing paths.
        logger.info(`Kit build done: ${urls.length} pages, preview=${preview}`);
        void readdirSync;
      },
    },
  };
}
