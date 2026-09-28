# Willis's Walkabouts: Phase B summary (B13)

Built without a review stop on Johnny's instruction. Preview on branch `claude/sleepy-clarke-qaquos`, folder `sites/willis_walkabouts`. Cloudflare Pages project name in `sites.json`: `willis-walkabouts-s6nv` (root `sites/willis_walkabouts`, build `pnpm install --frozen-lockfile && pnpm build`, output `dist`, NODE_VERSION 22). Johnny creates the project and connects the branch.

## What was built

- 16 pages: home, eight trip pages (Bungles in the Wet, Kakadu Highlights No. 2, Green Kimberley, Karijini, Top End Family Walk, Kakadu Birdwatching, Kakadu Short Overnight Walks, Kakadu Day Walks), walks index with compare table, about with eleven guides, FAQ, contact, downloads, charter and groups, general information.
- The program calendar carries all 47 departures on the 2026 to 2027 list with region, rating, pack weight and price, filters, a request button per row, and the first 12 shown with a "Show all 47 trips" button.
- The walk ratings ladder, levels 0 to 5 in their own words, as the signature moment. Season calendar for the Wet, Dry and Build Up. Signature map with the seven regions and Darwin airport.
- 121 of their own gallery photos recovered from the site builder's lazy loading, plus nine guide portraits.
- Booking Group 2: request to book on every trip and every calendar row; their Formstack form and registration form stay the next step.

## QA (all gates pass)

Lighthouse mobile 97 / 100 / 100 / 100, LCP 1.9s, CLS 0.03. Live site: 61 / 82 / 100 / 69, LCP 4.8s, 58 of 60 pages without a meta description.

Design review: one independent round, then one fix round (name spelling to their own "Willis's", per trip meeting details, trust chips, ratings grid, photo swaps, labels, stale lines, trip finder dropped). Still open and kit level rather than site level: the split hero at phone width shows the photo below the text, the trip hero paragraph could use a stronger scrim over bright sky, the map labels crowd at 1440 and shrink at 390, the season grid clips at 390, and the footer, contact block and CTA band are the kit's shared shapes.

## Gap list for the launch interview

See `audit.md`. The important ones: which Bungles in the Wet price is right ($7995 on the page, $9995 on the list), prices for Kakadu Highlights No. 10 and Abner Range, whether 2027 prices rise, six reviews, print size portraits, a high resolution logo, the current mobile number, and the "What you get" page.

## Pitch pack

`sites/willis_walkabouts/pitch/` (not committed): before and after screenshots, walkthrough video, score card 61 to 97, `email.md` with the three hooks. `pitch.config.json` needs prices and turnaround.
