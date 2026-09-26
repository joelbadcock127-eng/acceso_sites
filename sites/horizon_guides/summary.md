# Horizon Guides: Phase B summary (B13)

Preview built on branch `claude/sleepy-clarke-qaquos`, folder `sites/horizon_guides`. Cloudflare Pages project `horizon-guides-lg9a` (root `sites/horizon_guides`, build `pnpm install --frozen-lockfile && pnpm build`, output `dist`, NODE_VERSION 22) deploys it at https://horizon-guides-lg9a.pages.dev once the branch is connected. No Cloudflare credentials were available here, so the deploy itself is Johnny's step.

## What was built

- 14 pages: home, six experiences (day walks program, Winter Walking Weekend, Border Tracks, Spring Retreat, Navigation Retreat, private guiding), walks index with compare table, about, FAQ, contact, downloads, private and groups, booking terms.
- Program calendar as a new kit module and the main home feature: the 2026 program as dated rows with area, distance, hours, grade, price and status, month and grade filters, a request button per row, past rows collapsed under "Earlier this season".
- Notify me on Border Tracks ("2026 dates coming soon"), the Winter Weekend and the Navigation Retreat (both ran; next dates to be announced): price and booking hide, a short request form takes their place.
- Request to book (Group 2) on the day walks, Spring Retreat and private guiding, with the program dates in the date picker.
- Signature map (Boonah, six walk areas, Brisbane airport), species checklist from her own walk notes, guide profile, stats, trip notes PDFs for every experience and a packing list for Border Tracks, SMS tap to chat, park alerts link, 32 redirects from the old Joomla URLs.
- 25 of her own photos, resized to 2400px. Naturalist archetype, accent darkened one step for AA contrast.

## QA (all gates pass)

Lighthouse mobile 98 / 100 / 100 / 100, LCP 2.11s, CLS 0. Leak, placeholder, copy lint, fact trace, preview privacy, downloads (8 PDFs under 200 KB each), internal links, booking links, axe, console, five viewports, JS 46 KB gzipped.

Design review ran three rounds with an independent reviewing subagent. Fixed: mosaic grid, hero focal point for phones, credential wording, date labels, count spacing, duplicate photos, retired dates shown as "to be announced", mobile bar wrapping, coordinates sign. Left as is and worth Johnny's eye: the signature map labels crowd the coastline at 390 wide; the experience template, contact block and footer are the kit's shared components and read as the same structure as Bakers with different tokens; the compare table shows "not listed" where her pages give no figure; the booking terms are a transcription of the PDF with the PDF linked as the authoritative copy.

## Gap list for the launch interview

See `audit.md`. The important ones: a logo file, a portrait of Teresa, three to six reviews, the 2027 program (only three 2026 dates lie ahead), dates and prices for Border Tracks, the founding year (2008 or 2007), the mailing list provider, the two addresses, updated terms without the COVID clauses.

## Pitch pack

`sites/horizon_guides/pitch/` (not committed): before and after screenshots at desktop and mobile, a walkthrough video (WebM), score card 57 → 98, and `email.md` with the three hooks. `pitch.config.json` still needs the build price, care price and turnaround days.
