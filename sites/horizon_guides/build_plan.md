# Build plan: Horizon Guides (B4b)

Archetype `naturalist`, Booking Group 2 (request to book). Preview capped at 12 pages. Home page carries 10 sections plus contact.

Approved by Johnny with changes: no year in the headline, program calendar as a kit module and the main home feature, hook 1 reworded to past dates, conditions this week dropped, Border Tracks shown as "2026 dates coming soon" with a notify me request.

## Experiences (from their own program, one page each)

| Page | Type | Source |
|---|---|---|
| Scenic Rim day walks (the season's program as one experience with each walk as a departure row, price $100 per person) | day | /tours/day-hikes/item/322 |
| Scenic Rim Winter Walking Weekend (8 to 10 August 2026, $1,695, shown as full and as the model for 2027) | multiday | /tours/bushwalking-holidays/horizon-guides-winter-walking-2026 |
| Border Tracks: Mt Lindesay to Richmond Gap (3 days, vehicle supported, shown as "2026 dates coming soon" with a notify me request; no price shown) | multiday | /tours/bushwalking-holidays/item/312 |
| Scenic Rim Spring Retreat: Art, Nature and Fine Food (7 to 9 November 2026, $1,420) | multiday | /events/art-courses/item/324 |
| 4 Day Navigation Retreat with Caro Ryan (16 to 19 July 2026, from $1,735, now past; shown as the model for the next course) | multiday | /events/navigation-courses/item/319 and its PDF |
| Private guiding (tailor made walks, quote) | private | /more/guiding |

Skipped: Tassie Tracks 2025 (ran November 2025), Great Ocean Walk, Caves to Cradle, Walks of the Prom, Tassie Tracks South, Best of the Great Ocean Walk, GOW to Gariwerd, Spring Creek Mountain Trail (no dates since 2016 to 2020). They go into the launch interview as "retire or relaunch".

## Home page sections (10)

Hero (still, slow zoom, walker on ridge img-030), thesis band, **program calendar (the main feature: this season's dated walks with grade, distance, hours, price and a request button per row)**, feature blocks (why walk with Teresa: interpretation, small groups, eco certified), offers list, stats, signature map (Boonah, the walk areas, Brisbane airport), signature moment (species checklist), testimonial, CTA, then contact. The FAQ moves to its own page and the season calendar is dropped from home because the program calendar carries the dates.

## Decisions

| Item | Decision | Why |
|---|---|---|
| Request to book form on every experience | include | Group 2. Replaces the PDF form and email; the walker picks the walk date from the program |
| Private and group quote | include | "Tailor-Made Guided Tours" is a stated service |
| Corporate and schools form | skip | Not mentioned anywhere on the site |
| Newsletter signup | include, connected to their existing list | They run a mailing list already (provider to confirm at launch) |
| Gift voucher request | skip | No vouchers offered |
| Brochure lead capture | skip | Local day walks, low lead time |
| Trip notes and packing list PDFs | include for the three multi day trips | Real walkers print these; replaces the 2020 itinerary PDF |
| Welcome pack | launch only | Needs the owner's pre walk information |
| Route map and elevation | skip | No GPX. Ask for watch tracks at launch |
| Day on the trail | skip | No timed itinerary for day walks; the winter weekend has one, but it's full |
| Season calendar | skip on home | The program calendar carries the dates; the season notes stay in site.json for the experiences page |
| Trip finder | experiences page only | Six experiences with distinct grades and days; kept off home to hold the section cap |
| Guide profile | include | Teresa's bio from the about page, credentials as stated |
| Gallery lightbox | include | 41 images scoring 4 or 5 |
| Signature map | include | Boonah base, walk areas (Mt Barney NP, Main Range NP, Lamington NP, Border Ranges, Ivory's Rock, White Rock), Brisbane airport |
| Operating areas map | skip | Interstate trips have no dates |
| Signature moment | species checklist | "What you might see": the species her own pages name (Albert's Lyrebird, Glossy Black Cockatoo, peregrine falcons, rock wallabies, orchids, fungi, koala, wombat). Fits the naturalist thesis |
| Place texture | include | Contours from real elevation around Mt Barney (needs Open Meteo; generic topo if blocked) |
| Conditions this week | skip | Dropped at review |
| Park alerts link | include | Queensland Parks alerts page |
| Getting there | include | Boonah, one hour from Brisbane, meeting points in the walk notes |
| Who it's for | include | The FAQ and walk notes already answer fitness, beginners, age, knees |
| Compare table | include | Six experiences |
| Reviews widget, Instagram | launch only | Facebook only; ask for reviews in the interview |
| WhatsApp or SMS tap to chat | include (SMS) | "call/text 0417 760 966" is how she invites contact |
| Journal | skip | Only three media items from 2013 and 2014 |
| Legal | terms verbatim from the 2026 PDF, COVID clauses included as written; no privacy policy exists (gap) | Never write policies |
| Custom 404 | include | One line in her voice |

## Layout variants (naturalist defaults, differ from Bakers on all eight)

hero `full`, positioning `band`, featureSplit `mosaicLeft`, offerCards `list`, statsRow `inline`, testimonials `single`, ctaBand `solid`, keyFacts `stacked`.

## Proposed new kit module

**Program calendar** (approved, built as `components/ProgramCalendar.astro` with the `program` collection): a season's walks as a dated list with area, grade, distance, hours, price and status per row, filterable by month and grade, each row with its own request button. Rows that have passed collapse into "Earlier this season" so the list never leads with stale dates. It renders on the home page (`plan.programCalendar`) and on any experience whose slug the rows name. **Notify me** (`components/forms/NotifyMe.astro`, form kind `notify`): for an experience with `datesComingSoon: true` the price and booking buttons hide and a short request form takes their place.

## Site level overrides

None.
