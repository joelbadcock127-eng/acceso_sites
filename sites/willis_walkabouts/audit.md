# Audit: bushwalkingholidays.com.au (Willi's Walkabouts)

Crawled 28 September 2026: 60 pages (the budget; the site has more), 20 images from the crawl plus 290 lazy loaded gallery images from a second pass, 92 PDFs. Raw pages, images and evidence are in `intake/` (not committed). Booking platform: none. **Booking Group 2**: a Formstack booking form and a PDF registration and liability release, $150 deposit, balance by direct deposit.

The business itself is in good shape: Russell Willis has run off track bushwalking in Kakadu, the Kimberley, the Pilbara and the Red Centre since 1986, the 2026 to 2027 program was updated on 9 September 2026 and "What's New" was updated on 27 September 2026. The website is what lets it down.

## Stale content

- The site has two "All trips by date" pages. The one still linked from the menu and Google (`/all-trips-by-date--original`) is the 2020 to 2021 list with 2020 prices. The current list lives at `/experiencesb96c989b`. Evidence: both URLs
- The current list still carries French Polynesia "15 Nov to 5 Dec 2025". Evidence: https://www.bushwalkingholidays.com.au/experiencesb96c989b
- Kakadu Highlights No. 10 (18 to 31 October 2026, three weeks away) shows "$TBA" for every price. Evidence: same page
- An "Availability" page headed "AVAILABILITYEditProblem" carries a 2020 list, "After the chaos caused by the Covid lockdown" and a block titled "Sample showing editing problems in columns 3 and 4". Evidence: https://www.bushwalkingholidays.com.au/availabilityeditproblem
- Trip pages show their old dates: Bungles in the Wet "2025" in the URL, Centralian Highlights "April 13 to May 3 2025", Kakadu Highlights No. 7 "Aug 23 to Sep 5 2025", Mitchell Plateau No. 3 "August 7 to 20 2022", Karijini "April 2020" in the page title, Russell's Light Wet Special "12 to 21 March 2021", Gulf Country "June 9 to 29 2024". Evidence: those pages
- Every page ends "2019 All rights Reserved". Evidence: every page
- "What's New" says the site went live on 10 August 2020 and lists 60 changes since; it is the only place the newest trips (Canning Stock Route 2027, Kakadu Expeditions) are announced. Evidence: https://www.bushwalkingholidays.com.au/whats-new

## Booking friction

- To book: read the trip notes PDF, read the 34 page Bushwalking Guide PDF, fill in a Formstack form, then fill in and return a registration and liability release, then pay a $150 deposit by direct deposit. Nothing on the trip page tells you whether the date still has space. Evidence: `intake/pdfs/GenInfo-Level.txt`, https://williswalkabouts.formstack.com/forms/willis_walkabouts_booking_form
- Discounts are worked out by hand: 20 percent four months ahead, 15 at three, 10 at two, then 5 for past clients, 5 for members of five bodies, 5 or 10 for groups, minus $110 per extra section, "consecutively, not the same as a single 30 percent". Evidence: `intake/pdfs/GenInfo-Level.txt`
- Trip pages say "Discounts available" but never show a discounted price. Evidence: every trip page
- Prices are printed as "A$4995" on the trip page and "$4995" on the list, and the Bungles in the Wet page says $7995 while the list says $9995. Evidence: https://www.bushwalkingholidays.com.au/bungles-in-the-wet-2025 and the trip list

## Broken things

- The trip list, the availability page and the international page are three hand built tables that disagree with each other and with the trip pages. Evidence: crawl
- 58 of 60 pages have no meta description; the home page has no structured data; SEO score 69. Evidence: `intake/evidence/lighthouse-live.json`
- The images on trip pages are lazy loaded by the site builder, so a first crawl saw 20 images on a site that holds hundreds. Evidence: `intake/content.json` versus `intake/images2/`

## Missing basics

- No page per trip that a walker can share: the trip pages exist but the list links go to "Find out more" with no price on the page for some and "$TBA" for others. Evidence: trip list
- No reviews or testimonials anywhere on the site; two client trip reports are linked on other people's websites. Evidence: https://www.bushwalkingholidays.com.au/kakadubird
- Accessibility 82 on mobile. Evidence: Lighthouse

## Speed and mobile (Lighthouse, mobile, live home page)

| Performance | Accessibility | Best practices | SEO | LCP | CLS |
|---|---|---|---|---|---|
| 61 | 82 | 100 | 69 | 4.8s | 0.040 |

## Trust gaps

- 40 years, the Darwin Bushwalking Club, Sustainable Tourism accreditation, satellite phone and EPIRB on every expedition, eleven named guides with Wilderness First Aid: all present, none of it near a booking action. Evidence: guides page, wet season page, home page badge
- Tripadvisor, Facebook, Instagram and YouTube are linked in the footer; nothing from them appears on the site. Evidence: footer

## Three email hooks

1. Your menu's "All trips by date" still opens the 2020 list, and the current one shows "$TBA" for the trip that leaves in three weeks.
2. Your mobile speed score is 61 out of 100 and the home page takes 4.8 seconds to show its main image on a phone; 58 of 60 pages have no description for Google to show.
3. To book a trip a walker reads two PDFs, fills in a Formstack form and a liability release, then works out their own discount from a table.

## Gap list (facts needed before launch)

- A high resolution logo (the site serves a 175 pixel PNG)
- Which price is right for Bungles in the Wet 2027: $7995 on the page or $9995 on the list
- Prices for Kakadu Highlights No. 10 (October 2026) and Abner Range (July 2027)
- Whether the 2027 list prices will rise ("None of the trips below have had the price updated for 2027")
- Reviews: six from Tripadvisor or the client trip reports, in the walkers' own words, with permission
- A portrait of Russell Willis and Cassie Newnes at print size
- The "What you get" page (what is included) is referenced from the PDF but returns no page; the preview uses the inclusions from the kh02 2027 trip notes
- The current mobile number: the footer says 0435 636 999, the contact page 0428 829 757
- The Bushwalking Essentials video link and the newsletter provider
- Permission to reproduce the Sustainable Tourism accreditation badge

## Archetype chosen

**expedition**, overriding the script's guess of `lodge`: multi day, pack carrying, off track expeditions of one to six weeks in remote country, sold as a dated program with walk ratings and pack weights. Topo texture, split hero, pills for key facts, departures and grade explainer up front.

## Signature features and downloads

Built: program calendar with the whole 2026 to 2027 list (the main home feature, 47 departures), eight trip pages, walk rating explainer as the signature moment (their five levels in their words), signature map (Darwin base, seven regions, Darwin airport), guide profiles for the eleven guides, season calendar (Wet, Dry, Build Up), trip finder and compare table, trip notes PDFs, who it's for, getting there, park alerts, SMS tap to chat, general information as the terms page. Skipped for lack of content: route maps (no GPX), day on the trail (no timed day walks), reviews (none on their site), gallery lightbox where a trip page had fewer than four photos.
