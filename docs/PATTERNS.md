# Bakers patterns

Every distinct section on bakerswalkingco.com.au, catalogued from the repo (`website/src/partials/*.body.html`, `website/public/css/webflow.css`) and confirmed against a build of the site captured at 390px and 1440px (`docs/screens/bakers/`). Each entry names the kit component that carries it.

## Premium DNA

Bakers' premium feel comes mostly from restraint. These rules survive every rebrand:

1. **Generous whitespace.** Sections pad 7rem top and bottom at desktop (`padding-section-large`), 4rem at phone. Nothing touches.
2. **Few elements per section.** One heading, one short paragraph, one action. Feature blocks have exactly one link.
3. **Short copy.** Headlines of 2 to 6 words. Body blocks of one to three sentences. `max-width: 35rem` on paragraphs.
4. **Large imagery.** Full bleed hero video, square mosaics, 16:9 cards. Images are the section, not decoration.
5. **One clear action per section.** A single primary button, or a single "Learn more" link. Never two competing buttons.
6. **Type does the work.** A display serif at 3.75rem for section headings with wide letter spacing (0.0375rem) over a calm humanist sans body at 1rem / 1.6.
7. **Almost no shape.** Border radius 0 everywhere. One pixel dividers. No shadows. Gold (`#ddbe72`) appears only as thin lines and framing borders, never as fills or text.
8. **Warm neutral ground.** Off white (`#f8f5f0`) pages, white cards, near black ink (`#050403`). Dark bands use a warm grey (`#636260`) with white text.
9. **Motion you barely notice.** Fades and short rises on scroll (300 to 600 ms, ease and outQuart), a count up on the stats, and nothing else.

Kit motion rules (A2): only fades and short rises (12 to 24px, 0.6 to 0.9s, ease out); one hero moment per page; no parallax on text; everything readable at rest; everything off under reduced motion.

## Design tokens measured from the code

| Token | Bakers value | Where |
|---|---|---|
| Display face | `warbler-banner` (Adobe Fonts) | `--_typography---font-styles--heading` |
| Body face | `optima-nova-lt-pro` (Adobe Fonts) | `--_typography---font-styles--body` |
| Body size / line height | 1rem / 1.6 | `body` |
| h1 | 4.5rem, weight 400, line height 1.1, letter spacing 0.0525rem; 3.25rem under 991px; 2.5rem under 767px; 3rem under 479px | `.heading-style-h1` |
| h2 | 3.75rem, 400, 1.2, 0.0375rem; 2.75rem; 2.25rem; 2.75rem | `.heading-style-h2` |
| h3 | 3rem, 400, 1.2, 0.03rem; 2.25rem; 2rem | `.heading-style-h3` |
| h4 | 2.5rem, 400, 1.2, 0.025rem; 1.75rem; 1.5rem | `.heading-style-h4` |
| h5 / h6 | 2rem / 1.625rem, 400, 1.2, 0.02rem / 0.01625rem | `.heading-style-h5/6` |
| Text sizes | tiny .75rem, small 1rem, regular 1.125rem, medium 1.25rem, large 1.625rem | `.text-size-*` |
| Stat number | 5rem, weight 700, line height 1.3; 4rem; 3.5rem | `.stats3_number` |
| Paragraph colour | `#666372` | `--color-scheme-1--paragraph-ligth` |
| Ground | `#f8f5f0` (spring wood) | `--_primitives---colors--spring-wood` |
| Surface | `#ffffff` | `--color-scheme-1--background` |
| Ink | `#050403` (neutral darkest) | `--color-scheme-1--text` |
| Line | `#05040326` (neutral darkest at 15%) | `--color-scheme-1--border` |
| Accent | `#ddbe72` (apache gold), used for FAQ dividers, the commitment frame, and the mosaic grid gap | `--_primitives---colors--apache` |
| Dark band | `#636260` (spring wood darker) with white text; `#4a4948` (darkest) also defined | `--color-scheme-3`, `--color-scheme-2` |
| Overlay | `linear-gradient(#00000080, #00000080)` over hero and CTA video | `.header7_background-video-wrapper` |
| Section padding | large 7rem (6rem, 4rem), medium 5rem (4rem, 3rem), small 3rem (2rem) | `.padding-section-*` |
| Page gutter | 5% each side; 2% at 1280px and above | `.padding-global` |
| Containers | large 80rem, medium 64rem, small 48rem; text max widths 35rem (medium), 48rem (large), 30rem (small) | `.container-*`, `.max-width-*` |
| Grid gaps | 3rem to 5rem columns, 4rem rows | `.layout*_content` |
| Radius | 0 (small, medium, large all 0px) | `--_ui-styles---radius--*` |
| Border widths | 1px | `--_ui-styles---stroke--*` |
| Shadows | none | |
| Buttons | 1px border, ink fill, white text, padding .375rem .75rem, weight 500, transition .2s; hover inverts to transparent with ink text. `is-alternate` on dark: spring wood border and text. `is-link`: no fill, underline on hover | `.button*` |
| Tag | .875rem, weight 600, 5% ink fill, 1px border | `.tag` |
| Image ratios | mosaic and card 1:1; feature, journal and CTA 16:9; gallery 3:2; portrait 2:3; wide 2:1 | `aspect-ratio` rules |
| Breakpoints | 479, 767, 991, 1280, 1440, 1920 | media queries |
| Motion | SCROLL_INTO_VIEW fades and rises (durations 300, 400, 500, 600 ms; easings `ease`, `outQuart`, `inOutQuint`; small y offsets), DROPDOWN_OPEN, NAVBAR_OPEN, SLIDER_ACTIVE, a count up on stats | `webflow.schunk.*.js`, `countup.min.js` |

`theme.json` for `sites/bakers` carries these values; `packages/kit/styles/global.css` carries the scale and spacing as tokens.

## Global

| Pattern | What it's for | Content fields | Layout | Motion | Kit component |
|---|---|---|---|---|---|
| Header with mega menu | Two primary links, a "More" panel with three groups (Experiences, Information, Explore) and two featured cards each with an image and its own action (a featured walk with "Book Now", a gift voucher with "Buy Now"), and a persistent Book Now button | nav.primary, nav.groups, nav.featured, booking | 1440: logo left, links centre, buttons right, 4.5rem tall; panel is full width with a 26rem column grid left and two image cards right. 390: hamburger opens a stacked list | Dropdown open fade; navbar open | `SiteHeader`, `MegaMenu` |
| Logo mark in a thin frame | The word mark sits inside a thin rectangle drawn only at the top left and bottom right corners (hero overlay logo) | theme.logo | Header logo 3rem tall | none | `.frame` utility, `theme.logo.framed` |
| Footer | Location and contact, social links, three navigation columns, newsletter signup, legal links (Privacy, Refund, Terms, Liability Waiver), credit line | business, footer.columns, newsletter, footer.legal | 1440: logo column plus four columns. 390: stacked | none | `SiteFooter`, `NewsletterForm` |

Screenshots: `docs/screens/bakers/home-1440.jpg`, `home-390.jpg`.

## Home page, in order

| # | Pattern | What it's for | Content fields | Layout | Motion | Kit component |
|---|---|---|---|---|---|---|
| 1 | Full bleed hero | A muted looping video, a short confident headline, one line of support and a single primary action ("Experiences") | home.hero | 100svh (max 60rem), text left in an 80rem container; 390: same, text wraps | Video plays muted; overlay 50% black | `HeroMedia` (variant `full`) |
| 2 | Positioning statement | "Tasmania Without The Crowds", two sentences and a link | home.positioning | Centred, 35rem measure | Fade rise | `Positioning` (`centred`) |
| 3 | Press strip | "As Featured In" with four logos | press.json | Label left, logos right in a row; wraps at 390 | Fade | `PressStrip` (3 or more) |
| 4 | Alternating feature blocks | Three blocks: a video or four photo mosaic, heading, one paragraph, "Learn More" | home.features | Two column grid, 4rem gap, media alternates sides; 390 stacks media first | Fade rise per block | `FeatureSplit` (`alternate`) |
| 5 | Location block | Address, coordinates, drive times from Launceston and Devonport Airport, a stylised Tasmania map with a pin | business.location, driveTimes, nearestAirport | Two columns, facts left in a 2 column list, map right | Fade | `LocationBlock` + `RegionMap` |
| 6 | Offer cards | Three across: Day Walks, Multi Day, Corporate, each with a 16:9 image, heading, paragraph, "Learn More" | experiences (type) | 3 column grid, 3rem gap; 390 stacks | Fade | `OfferCards` (`three`) |
| 7 | Stats row | Three big figures on a dark image band: 22km, 2x, 120 | stats.json | 3 columns with a 1px left border each; 5rem numbers | Count up | `StatsRow` (`band`) |
| 8 | Testimonials | Quote, name, home town, with a photo, in a slider | testimonials.json | Two column slide (image, quote); 390 stacks | Slider | `Testimonials` (`slider`) |
| 9 | Our story | Heading and a large image | home.story | Centred heading over a wide image | Fade | `StoryBlock` |
| 10 | FAQ accordion | Five questions and a link to the full FAQ | faqs.json | Heading left, accordion right; gold 1px dividers | Height transition .5s | `FaqAccordion` |
| 11 | Journal | Three latest posts with category and read time | posts | 3 column cards, 16:9 images | Fade | `JournalTeaser` |
| 12 | Final call to action | "Step into the wild now" on a dark band with an image | home.cta | Centred text over image | Fade | `CtaBand` (`image`) |
| 13 | Commitment band | The wildlife pledge in a thin gold frame with the devil photo | business.commitment | Framed card with text left, image right | Fade | `CommitmentBand` |
| 14 | Contact | A form with an "interest" dropdown, plus email and social links | business, contact.interests | Two columns: details left, form right; 390 stacks | none | `ContactSection` |

Screenshots: `docs/screens/bakers/home-1440.jpg`, `home-390.jpg`.

## Experiences index

| Pattern | Content | Layout | Kit component |
|---|---|---|---|
| Hero with intro line and amenity icons | h1, intro, four line icons (sauna, bath, bed, firepit) | Centred over an image | `experiences/index.astro` hero |
| Cards grouped under Day Walks and Multi Day | Four image grid, difficulty badge, "Best for", distance, duration, group size, price per person, short description, "Learn More" | Two column card rows; 390 stacks | `experiences/index.astro` list |
| Region map contact block | Address, special requests, questions | 3 columns | `LocationBlock` |

Screenshots: `docs/screens/bakers/experiences-1440.jpg`, `experiences-390.jpg`.

## Experience detail, in order

| # | Pattern | Content | Kit component |
|---|---|---|---|
| 1 | Hero with Book Now and gift voucher | title, summary, hero image | `[slug].astro` hero + `BookButton` |
| 2 | Key facts banner | duration, distance, grade with a one line explainer, price from | `KeyFactsBanner` (`banner`) |
| 3 | Anchor subnav | Overview, Itinerary, Included, Gallery, Reviews, FAQs, Availability | `AnchorNav` |
| 4 | Quick package summary | group size, guides, pickup, "Book Now" | `[slug].astro` overview aside |
| 5 | Feature cards | four icon blocks (wildlife, acres, seasons, stars) | highlights list |
| 6 | Itinerary accordion | one item per day or time slot | `Itinerary` |
| 7 | Overview text | activity details | Markdown body |
| 8 | Included and not included | two columns | `IncludedExcluded` |
| 9 | Additional info | fitness, group size, season, getting here, accessibility, cancellation | `AdditionalInfo` |
| 10 | Accommodation amenity grid (multi day only) | sauna, sleeps 10, baths, firepit | `AmenityGrid` |
| 11 | Choose your adventure | join a group / private, each with price and booking link | `PackageCards` |
| 12 | Stats row | 22km, 8 to 12, 90%, 1,137 | `StatsRow` |
| 13 | Those who went | reviews with photos | `Testimonials` |
| 14 | Availability | FareHarbor calendar | `DeparturesTable` or the platform's embed |
| 15 | Questions | FAQ accordion | `FaqAccordion` |
| 16 | Closing call to action | "Ready to disappear" | `CtaBand` |

Day walks also carry a map and a photo gallery (`Gallery`, `RouteMap`).

Screenshots: `docs/screens/bakers/bakers-traverse-1440.jpg`, `multi-day-experience-1440.jpg`, and the 390 versions.

## Improvements the kit adds beyond Bakers (A4)

`MobileBookBar`, `ExperienceCompare`, `NextDeparture`, `TrustRow` and `WhoItsFor` answer the four questions every walker has before booking: which walk, when, can I trust you, can I do it. They're on by default and hide without content.

## Added during the Horizon Guides build (Phase B, first prospect)

| Pattern | Why | Kit piece |
|---|---|---|
| Program calendar | Operators who sell a season of dated walks rather than products. Dated rows with area, distance, hours, grade, price and status, month and grade filters, a request button per row, and rows that have passed collapsed under "Earlier this season" so the page never leads with stale dates | `ProgramCalendar`, the `program` collection (`src/content/program.json`), `plan.programCalendar`, `programHeading`, `programIntro`, `programSeason`. An experience whose slug the rows name shows its own rows as the Dates section |
| Notify me | An experience with no dates yet (`datesComingSoon: true`). Price and booking hide, a badge carries `datesComingNote`, and a short form (name, email, group size) takes their place. Form kind `notify` | `NotifyMe`, `[slug].astro`, `functions/form.js` |
| Hero focal point | `home.hero.focal` sets `object-position` so the subject of a landscape hero survives the portrait crop on phones | `HeroMedia`, schema |
| Offer list shows every experience | The `list` variant of `OfferCards` is a list, so it carries up to six; card variants keep three | `OfferCards` |
| Print routes without texture, JPEG hero | Chromium rasterises the page texture on every PDF page and re-encodes WebP and AVIF losslessly, which made trip notes 4 to 6 MB. Print routes now skip the texture (`bare`) and use `printImageUrl()` for a JPEG hero: 150 to 200 KB each | `Base.astro`, `lib/media.ts`, trip notes print route |
| Screenshots scroll first | Full page screenshots never triggered lazy images, so review shots showed grey tiles that the live page never shows. `settle(page)` scrolls end to end and waits for images | `scripts/lib/serve.mjs`, used by `shots`, `review` and `pitch` |
| Compare table empty cell | "—" failed the copy lint; empty cells now read "not listed" in muted text | `ExperienceCompare` |

## Added during the Willi's Walkabouts build (Phase B, second prospect)

| Pattern | Why | Kit piece |
|---|---|---|
| Program calendar pack badge and show all | Operators who list a whole year of expeditions (47 rows) need the pack weight beside the rating, and a home page that does not run to 18,000 pixels. Rows carry an optional `pack`; the calendar shows the first 12 future rows and a "Show all N trips" button, and any filter change reveals everything | `ProgramCalendar` (`limit` prop, default 12), `programSchema.pack` |
| Lazy loaded galleries | Site builders such as Duda put every gallery image in `data-src`. The first crawl saw 20 images on a site holding hundreds; a second pass over the raw HTML recovered 290. `intake_assets.mjs` already reads `data-src`, so check its output count against a grep of the raw HTML before trusting it | `intake/images2/` on this site; `scripts/intake_assets.mjs` |
| Trip notes PDFs as source | When the site's own pages carry stale dates, the current trip notes PDFs (linked from the trip list) carry the dates, prices, inclusions and a fuller itinerary. `pdf_text.mjs` takes file paths, not a slug | `scripts/pdf_text.mjs` |
