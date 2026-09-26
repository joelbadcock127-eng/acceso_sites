# Stack notes

Written at the start of Phase A after reading the Bakers repo (`joelbadcock127-eng/BWC`, read only).

## What Bakers actually runs

| Concern | Bakers today | Evidence |
|---|---|---|
| Framework | Astro 5 (`astro ^5.12`), static output, one thin `.astro` wrapper per page | `website/package.json`, `website/src/pages/*.astro` |
| Markup | A Webflow export. Every page body is a verbatim Webflow partial (`src/partials/{page}.body.html`); head extras in `{page}.head.html` | `website/README.md`, `website/src/partials/` |
| CSS | The compiled Webflow stylesheet, 261 KB, with Webflow CSS variables for colour, type and radius | `website/public/css/webflow.css` |
| Animation | The vendored Webflow runtime and interaction bundles (jQuery, ix2). Scroll into view fades and rises, dropdown and navbar opens, sliders, count up on the stats | `website/public/js/webflow.*.js`, `countup.min.js` |
| Fonts | Adobe Fonts (Typekit kit `omv6qkl`): `warbler-banner` for headings, `optima-nova-lt-pro` for body | `--_typography---font-styles--*` in `webflow.css`, `index.head.html` |
| CMS | None. Content lives in the HTML partials | `website/README.md` |
| Editing | A password protected `/admin` page lists every text and image field on a page, previews edits live, and **saves by committing the partial to GitHub through the Contents API**. The site rebuilds and the change is live in about a minute. Local dev falls back to writing the file on disk | `website/src/lib/admin.js`, `website/src/pages/admin.astro`, `website/src/pages/api/*.js` |
| Forms | Formspree (contact, corporate, newsletter), with a `_gotcha` honeypot and a fetch intercept for inline success states | `Layout.astro`, `website/README.md` |
| Booking | FareHarbor. Book buttons link to `fareharbor.com/embeds/book/bakerswalkingco/items/{id}/?full-items=yes` and the Lightframe script opens booking as an overlay. Items: Narawntapu 712940, Estate Walk 677140, Traverse 712971, multi day join a group 658546, private group 658557, gift voucher 685661 | partials, `fareharbor.com/embeds/api/v1/` |
| Analytics | GA4 `G-9B9WZ8FQD6` | `public/js/ga-loader.js` |
| Hosting | Vercel (production from `main`, root `website`), with a Cloudflare Workers adapter as an alternative (`DEPLOY_TARGET=cloudflare`) | `astro.config.mjs`, `wrangler.jsonc`, `vercel.json` |
| Images | Webflow CDN originals copied into `public/assets` (901 files, 339 MB), served as is with Webflow's responsive `-p-` variants | `website/public/assets` |

**Verdict:** Bakers is a Webflow export. Its markup, CSS and animation runtime can't be reused cleanly as a kit (every page is one 100 KB blob of Webflow classes and jQuery interactions). Per section 2 of the manual, the kit uses the **default stack** and mirrors what Bakers does at the level that matters: Astro static output, the editing method, FareHarbor Lightframe, and the design values measured from the Webflow CSS (see `PATTERNS.md`).

## What the kit uses

| Concern | Choice | Notes |
|---|---|---|
| Framework | Astro 5 (`^5.12`, same major as Bakers), static output, `build.format: 'file'`, `trailingSlash: 'never'` | Astro 7 is current; matching Bakers keeps Johnny's tooling in one place. Upgrading is a kit only change |
| Styling | Tailwind 4 through `@tailwindcss/vite`. Every brand value is a CSS variable from `theme.json`. Components use tokens only (`bg-ground`, `text-ink`, `var(--accent)`) | `packages/kit/styles/global.css`, `lib/theme/theme.ts` |
| Motion | GSAP 3 with ScrollTrigger in one small client module. Only fades and short rises, off under reduced motion | `packages/kit/client/motion.ts` |
| Content | Astro content collections (JSON and Markdown in `sites/{slug}/src/content`) with a Zod schema. No copy in components | `packages/kit/content.config.ts`, `lib/content/schema.ts` |
| Editing | The Bakers method, mirrored: `/admin` (a Pages Function), password protected, lists every text and image field of a content file, and **saves by committing the file to `sites/{slug}/src/content/...` through the GitHub Contents API**, which triggers the Pages build. Audit fields (`sourceUrl`, `sourceFact`) and wiring (`booking`, `preview`) are locked | `packages/kit/functions/admin.js` |
| Forms | Web3Forms, called from a shared Pages Function (`/api/form`) that checks the honeypot and Turnstile, writes booking requests to D1, emails the owner a summary and the sender an automatic reply. Disabled in preview | `packages/kit/functions/form.js`, `client/forms.ts` |
| Images | `astro:assets` `<Picture>` from `sites/{slug}/src/images`, output AVIF plus WebP with responsive widths | `packages/kit/components/Img.astro` |
| Hosting | Cloudflare Pages, one project per site, root `sites/{slug}`, build `pnpm install --frozen-lockfile && pnpm build`, output `dist`, watch paths `sites/{slug}/**` and `packages/kit/**` | `scripts/new_client.mjs` |
| Server bits | Pages Functions from the kit (`functions/[[path]].js` in each site re-exports the kit router): form handling, the request log in D1, the `/requests` owner page, the `/admin` editor | `packages/kit/functions/` |
| Tooling | Node scripts plus Playwright (crawl, screenshots, scroll video, PDFs), Lighthouse and axe for QA | `scripts/` |

## Open decision 2: does the Bakers editing method survive a monorepo?

Yes. The Bakers editor commits a file path to a repo and branch through the GitHub API; the path is just a string. In the kit the path is `sites/{slug}/src/content/{file}`, the repo is `acceso_sites`, and each Pages project carries its own `SITE_SLUG`, `GITHUB_TOKEN` (fine grained, Contents read and write on `acceso_sites` only), `CONTENT_REPO` and `CONTENT_BRANCH`. Nothing assumes one repo per site, so separate repos are not needed.

One difference from Bakers: the editor edits typed content files rather than HTML, so a field like `experiences/razorback-traverse.md > priceFrom.amount` is a number and can't break layout. The Markdown body of a page is edited as one text area.

## Fonts

Bakers' fonts are Adobe Fonts and stay that way on `sites/bakers` through `theme.json > adobeKitId`. Every other site self hosts open licence fonts through fontsource, subset per weight, with `font-display: swap` and a metric matched fallback so text doesn't shift.

## Environment variables per Pages project

| Variable | Used by |
|---|---|
| `WEB3FORMS_KEY` | `/api/form` |
| `TURNSTILE_SECRET`, `PUBLIC_TURNSTILE_SITE_KEY` | spam protection (optional) |
| `REQUESTS_PASSWORD` | `/requests` |
| `ADMIN_PASSWORD`, `GITHUB_TOKEN`, `CONTENT_REPO`, `CONTENT_BRANCH`, `SITE_SLUG` | `/admin` |
| `OWNER_FIRST_NAME`, `RESPONSE_TIME`, `PAYMENT_LINKS` (JSON) | request to book emails |
| D1 binding `DB` | booking request log |

Secrets never enter the repo.

## Preview and launch switches

`src/content/site.json > preview.enabled` drives everything: the `noindex` meta, the `X-Robots-Tag` header in `_headers`, `robots.txt` disallow, the preview banner, and disabled forms. Turning it off writes the launch `robots.txt`, `sitemap.xml` and the 301s from `redirects.json` into `_redirects`.
