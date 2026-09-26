# Deploying a site to Cloudflare Pages

One Pages project per site. A project pointed at the repo root serves nothing (that is the 404 you get on `acceso-sites.pages.dev`), because the pages live in `sites/{slug}/dist`.

## Settings for a project (Workers and Pages, Create, Pages, Connect to Git, choose `acceso_sites`)

| Setting | Value |
|---|---|
| Production branch | `claude/sleepy-clarke-qaquos` for now, `main` once the branch is merged |
| Framework preset | None |
| Root directory | `sites/_demo_ridgeline` (or `sites/bakers`) |
| Build command | `pnpm install --frozen-lockfile && pnpm build` |
| Build output directory | `dist` |
| Environment variable | `NODE_VERSION` = `22` |

The root directory setting is under Settings, Build, Build configuration on an existing project. Leave "Build watch paths" empty for now (later: include `sites/{slug}/**` and `packages/kit/**`).

Deploy once, then open the `pages.dev` URL. The preview banner, `noindex` header and `robots.txt` disallow are already on because `preview.enabled` is true in `src/content/site.json`.

## Two projects to create for Phase A review

1. `ridgeline-demo`, root `sites/_demo_ridgeline`: the neutral test.
2. `bakers-kit`, root `sites/bakers`: the fidelity test. Adobe Fonts only load once `bakers-kit.pages.dev` is added to the allowed domains of kit `omv6qkl` at fonts.adobe.com.

## Later, per site

Environment variables (Settings, Variables and secrets): `WEB3FORMS_KEY`, `REQUESTS_PASSWORD`, `ADMIN_PASSWORD`, `GITHUB_TOKEN`, `CONTENT_REPO` (`joelbadcock127-eng/acceso_sites`), `CONTENT_BRANCH`, `SITE_SLUG`. Bind a D1 database as `DB` (Settings, Bindings) for the booking request log. `scripts/new_client.mjs` does all of this for new prospects when `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are set.
