# Audit: horizonguides.com.au

Crawled 26 September 2026: 35 pages, 126 images, 16 PDFs. Raw pages, images and evidence are in `intake/` (not committed). Booking platform: none. **Booking Group 2** (reservations by email with a PDF form; payment by direct deposit or cash).

## Stale content

- The home page slider and "Our Tours" list lead with "Scenic Rim Winter Walking Weekend 2026 FULLY BOOKED" (8 to 10 August, already run) and "SPRING Bushwalks 2025". Evidence: `intake/evidence/live-home-390.png`, https://horizonguides.com.au/
- The 2026 day walk program page still carries the May to October list, including walks now in the past and a cancelled Winter Solstice camp marked "***** CANCELLED*****". Evidence: https://horizonguides.com.au/tours/day-hikes/item/322-horizon-guides-bush-spring-walks-2026
- Two full 2025 day walk programs remain published beside the 2026 one. Evidence: https://horizonguides.com.au/tours/day-hikes/item/317-horizon-guides-bush-spring-walks-2025 and /item/314-horizon-guides-bush-walks-2025
- Tassie Tracks 2025 (17 to 27 November 2025) is still listed with a "reserve by 15th September" discount. Evidence: https://horizonguides.com.au/tours/bushwalking-holidays/item/316-tassie-tracks-bruny-island-wild-southwest-2025
- Six bushwalking holidays have no dates: Border Tracks ("2026 Dates coming soon", "Cost: $TBA", summary says "Dates: 2024 TBA"), Spring Creek Mountain Trail ("no current dates", itinerary PDF from June 2020), GOW to Gariwerd ("new dates TBA"), Great Ocean Walk (2016), Tassie Tracks Caves to Cradle (2015), Walks of the Prom, Tassie Tracks South, Best of the Great Ocean Walk. Evidence: https://horizonguides.com.au/tours/bushwalking-holidays
- "In The Media" stops in 2014. Evidence: https://horizonguides.com.au/in-the-media
- The footer reads "Copyright © 2014 Horizon Guides". Evidence: every page
- An "Accommodation" page says only "Coming Soon". Evidence: https://horizonguides.com.au/item/273-accommodation
- The booking terms PDF still carries three COVID clauses and is headed "1st January 2025". Evidence: `intake/pdfs/322_Horizon-Guides-Booking-T-Cs-2026.pdf`

## Booking friction

- No online booking anywhere. To join a walk you download a PDF reservation form, fill it in, and email it; payment is by direct deposit or cash 14 days before. Evidence: https://horizonguides.com.au/bookings, https://horizonguides.com.au/tours/day-hikes/item/322-horizon-guides-bush-spring-walks-2026
- The Bookings page has no form on it, only a paragraph and a spam question. Evidence: https://horizonguides.com.au/bookings
- Every walk of the season lives in one long text page; there is no page per walk, no price beside a button, and "Book NOW by sending us an email". Evidence: same page

## Broken things

- The nav still links to Joomla paths that 404 (`/horizong/index.php?option=com_contact...`). Evidence: `intake/content.json` failed list
- The "Scenic Rim Links" page exists twice (`/scenic-rim-links` and `/item/270-links`). Evidence: crawl
- Home page title is "Home", and the site name in the browser tab is "Bluap" (the template's name) on some pages. Evidence: `intake/content.json` page titles

## Missing basics

- No prices on the tour listing pages; prices only appear deep inside the program text. Evidence: https://horizonguides.com.au/tours
- No map or meeting point on any walk; meeting places are in the prose of each walk. Evidence: day walk page
- No structured data, no sitemap.xml, duplicate "Home" titles, missing meta descriptions on six pages. Evidence: crawl
- Only one testimonial on the whole site (Heather, May 2025) plus one quote on the navigation course page. Evidence: home page, navigation retreat page
- Guide credentials (Wilderness First Aid, Eco Certified, Green Travel Leader, accredited with three states' park services) are mentioned in paragraphs but never shown near a booking action. Evidence: about and day hike pages

## Speed and mobile (Lighthouse, mobile, live home page)

| Performance | Accessibility | Best practices | SEO | LCP | CLS |
|---|---|---|---|---|---|
| 57 | 76 | 96 | 100 | 17.0s | 0.143 |

Evidence: `intake/evidence/lighthouse-live.json`. The 390px screenshot shows a 4,968px long home page with a 1070x450 banner slider, a full length testimonial in an orange block, and the mailing list form as the only action.

## Trust gaps

- Eco Certified, Green Travel Leader (10 years), Licensed Tour Operator 2024 to 2025 and Outdoors Queensland badges are shown only at the bottom of the home page. Evidence: home page
- Since 2008 (about page says 2007), with Queensland Weekender and Channel 7 coverage, yet none of it is near the walks. Evidence: about, in the media

## Three email hooks

1. Your home page still leads with walks from August and the 2025 spring program, so a first time visitor reads it as last season's site.
2. Your mobile speed score is 57 out of 100, and the home page takes 17 seconds to show its main image on a phone.
3. To book a walk, someone has to download a PDF form, fill it in and email it back.

## Gap list (facts needed before launch)

- A logo file (the site has only a small raster in the header)
- Dates and prices for Border Tracks, Spring Creek Mountain Trail and the Grampians trip, or confirmation they're retired
- Which 2026 day walks are still open, and the 2027 program when it exists
- Reviews: six she'd like new walkers to read (Facebook or Google links)
- High resolution portrait of Teresa
- Whether the private Tailor Made guiding has a price per day or half day
- Updated booking terms without the COVID clauses
- Permission to state the Eco Certified and Green Travel Leader accreditations with their logos
- Founding year: the home page says 2008, the about page 2007 (the preview uses 2008 and keeps it out of the headline)
- The landline: the contact page shows "07 54634 114", which is one digit out of place (the preview shows the mobile only)
- Which mailing list provider she uses, so the newsletter form can post to it (the preview has no newsletter form)
- The 2027 program, or the remaining 2026 dates still open, before launch: only three 2026 dates lie ahead (Ships Stern 18 October, the Aussie Bird Count weekend, the Spring Retreat)
- Whether the Aussie Bird Count weekend has a price
- The booking terms page was transcribed from the PDF and needs a proofread against it; the PDF itself is linked at the top of the page as the authoritative copy
- Two addresses: the footer says 7 Church Street, Boonah and the booking terms say 494 Mt French Rd, Boonah. The preview uses Church Street for contact and leaves Mt French Rd in the terms
- Confirm the Queensland Parks alerts link (parks.desi.qld.gov.au/park-alerts) is the page she wants walkers to check

## Archetype chosen

**naturalist**, overriding the script's guess of `lodge`: Horizon Guides is eco interpreted bushwalking led by one guide's knowledge of flora, fauna, geology and history, with small groups, day hikes and a few hosted weekends. Field guide feel, crisp labels, species and guide credentials up front.

## Signature features and downloads

Built: program calendar (new kit module, the main home feature), notify me on Border Tracks, signature map, species checklist, guide profile, compare table, who it's for, getting there, park alerts link, SMS tap to chat, trip notes PDFs for every experience and a packing list for Border Tracks, booking terms page. See `build_plan.md`. Skipped for lack of content: route maps (no GPX), day on the trail (no timed itineraries for day walks), press strip (media coverage is 2013 to 2014 and not on their own pages as logos).
