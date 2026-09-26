# Design review: Bakers Walking Co (fidelity test, A10)

Side by side at 390px and 1440px: the Webflow site (`docs/screens/bakers/`) against the kit rebuild (`docs/screens/kit/bakers-*`).

## What matches

- Section order, spacing rhythm and container widths on the home page: hero, positioning in the thin double gold frame, press strip, three alternating feature blocks with video, location block with their Tasmania map, three offer cards, the dark stats band, testimonials, story, FAQ, journal, closing CTA, the gold framed commitment band, and the contact form with the interest dropdown.
- Colours (off white ground, near black ink, gold lines, warm grey bands), radius 0, one pixel dividers, ink buttons that invert on hover.
- The experience page: hero with Book Now and gift voucher, key facts banner, the anchor nav in its gold frame, price and "Best for" overview, itinerary accordion, included and not included, additional info, accommodation amenities, "Choose your adventure" package cards with FareHarbor item links, "Those who went", questions, closing CTA.
- The mega menu: three groups plus the Day Walk and Gift Voucher cards.

## What differs, on purpose

- Fonts render as the fallback serif and sans in headless screenshots because Adobe Fonts need the domain allowed on the kit; on the live site `warbler-banner` and `optima-nova-lt-pro` load through `adobeKitId`.
- The kit adds the trust row under every primary button, a "Runs year round" badge, the compare table on the experiences index, "This suits you if" lists, a mobile book bar, print friendly trip notes and a downloads page. These are the A4 improvements and are on by default.
- The stats on the multi day page ("8-12", "90%") were not carried across because they conflict with group sizes elsewhere on the site.

## Verdict

At 1440px a visitor would place both as the same brand; the differences are the kit's additions, not losses. At 390px the rebuild reads more clearly than the Webflow site (the Webflow hero headline wraps to four lines and its anchor nav overflows). Johnny should check the fonts on a real device once the Pages project is up.
