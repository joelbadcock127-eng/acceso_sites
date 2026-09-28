# Build plan: Willis's Walkabouts (B4b)

Archetype `expedition`, Booking Group 2 (request to book, with their Formstack booking form linked as the next step). Preview: 15 pages. Home page carries 10 sections plus contact.

Built without a review stop, on Johnny's instruction ("skip all checks by me just build it").

## Experiences (eight of the 47 dated departures, one page each)

| Page | Type | Dates and list price | Source |
|---|---|---|---|
| Kakadu Highlights No. 2 (wet season, two sections) | multiday | 7 to 20 March 2027, $4995 | /kh02 and kh02-27.pdf |
| Bungles in the Wet (helicopter in, Piccaninny Gorge) | multiday | 14 to 27 February 2027, $9995 on the list ($7995 on the page: gap) | /bungles-in-the-wet-2025 and bb-wet27.pdf |
| Green Kimberley (three sections, Ord River canoe) | multiday | 10 to 30 January 2027, $8995 | /green-kimberley and GreenKim26.pdf |
| Pilbara: Karijini National Park | multiday | 4 to 17 April 2027, $6595; 6 to 19 June 2027, $6795 | /karijini-national-park-april and pilbara1-27.pdf |
| Top End Family Walk No. 1 | multiday | 4 to 10 or 11 to 17 April 2027, $3095 | family-1a-27.pdf and the trip list |
| Kakadu and Top End Birdwatching and Nature Special | multiday | 4 to 17 October 2026, $4395 | /kakadubird and kak-bird26.pdf |
| Kakadu Short Overnight Walks (the easiest overnight trip) | multiday | 29 August to 5 September 2027, $3395 | /kakadushort2023 and the trip list |
| Kakadu Day Walks (accommodated, day pack only) | day | 30 August to 3 September 2027, $2295 | /kakadu-day-walks and 2026KakaduDay.pdf |

Every other departure on the 2026 to 2027 list is a row in the program calendar, linked to its page where one exists. Skipped as pages: the international trips (French Polynesia, Patagonia, South Africa, Peru, New Caledonia) because their pages hold no itinerary, only a guide name and a price; the 2020 to 2025 pages.

## Home page sections (10)

Split hero (Piccaninny Falls in the wet), positioning, **program calendar (the main feature: all 47 departures with region, rating, pack weight and price, month and rating filters, a request button per row)**, feature blocks (where the four wheel drives stop; carry everything, swim everywhere; guides who have walked it for decades), offers (feature plus two), trip finder, stats, signature map (Darwin and the seven regions), signature moment (the five walk ratings in their own words), season calendar (Wet, Dry, Build Up), story (Russell, 1974 to today), CTA, then contact.

## Decisions

| Item | Decision | Why |
|---|---|---|
| Request to book on every trip | include | Group 2. Their Formstack form and the registration and liability release are linked as the next step, so nothing about their process changes |
| Private and group quote | include | "Charter/personalised trips" on the home page; group discounts stated |
| Corporate and schools form | skip | Not offered |
| Newsletter signup | launch only | They run one ("Join our newsletter"); provider to confirm |
| Gift vouchers | skip | Not offered |
| Trip notes and packing list PDFs | trip notes for every page; packing list only where the page states gear (Bungles: pack liner, poncho, footwear; Karijini: heavy gaiters) | Their own trip notes PDFs are also linked as downloads, since walkers must read them |
| Welcome pack | launch only | Their Bushwalking Guide PDF is the welcome pack in all but name |
| Route map and elevation | skip | No GPX; the areas are deliberately unmapped in their copy |
| Day on the trail | skip | No timed itineraries; days are "bush camps carrying full packs" |
| Season calendar | include | Wet (December to April), Dry (April to September), Build Up (September to December), in their words from the climate page |
| Trip finder and compare table | include | Eight trips with distinct ratings, pack weights and days |
| Guide profiles | include, eleven guides | The guides page is their strongest trust page |
| Gallery lightbox | include where a page has four or more photos | 290 gallery images recovered from the site builder's lazy loading |
| Signature map | include | Darwin base, Kakadu, Litchfield, Nitmiluk, Kununurra and the Kimberley, Purnululu, Karijini, Alice Springs, Darwin airport |
| Signature moment | walk ratings | "What the ratings mean": levels 0 to 5 from their level of difficulty page. It answers the question every reader of an expedition site has first |
| Conditions this week | skip | Not requested |
| Park alerts | include | Parks Australia Kakadu access report |
| Getting there | include | Trips leave from Darwin, Kununurra, Alice Springs or Tom Price; pre trip meeting the evening before; pick up from your accommodation |
| Who it's for | include | Their fitness and attitude paragraphs are already written |
| Reviews widget, Instagram | launch only | Nothing on their own site |
| SMS tap to chat | include | Mobile listed with "outside Australia" format |
| Journal | skip | "What's New" is a change log, not a journal |
| Legal | General Information (discounts, booking procedure, cancellation and refund, liability, insurance) verbatim from GenInfo-Level.pdf | Their only terms document |
| Custom 404 | include | One line in their voice |

## Layout variants (expedition defaults, differ from Bakers and Horizon Guides on all eight)

hero `split`, positioning `left`, featureSplit `stacked`, offerCards `featurePlusTwo`, statsRow `cards`, testimonials `grid` (hidden, no content), ctaBand `split`, keyFacts `pills`.

## Kit modules reused

Program calendar and notify me from the Horizon Guides build. The program calendar gets one addition here: rows may carry a `pack` field (pack weight) shown beside the grade, and a `region` in `area`.

## Site level overrides

None.
