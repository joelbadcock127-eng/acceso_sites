# Build plan: Bakers Walking Co (kit fidelity test)

The fidelity test (A10): Bakers rebuilt on the kit using only Bakers content files, to prove the kit captured the design. Every fact, quote and image is Bakers' own, taken from the BWC repo (read only), with the source page in each `sourceUrl`.

## Archetype and theme

`lodge`, Bakers' own Adobe Fonts (`warbler-banner`, `optima-nova-lt-pro`) through `adobeKitId`, colours measured from `webflow.css`, radius 0, ink buttons (Bakers' gold is a line colour, never a fill), full bleed video hero. All eight layout variants are the `lodge` defaults.

## Content decisions

| Item | Decision | Why |
|---|---|---|
| Experiences | 5: Narawntapu, Estate Walk, Bakers Traverse (day), Multi Day Getaway (multiday), Corporate (corporate) | Matches the Bakers experience pages |
| Booking | FareHarbor Group 1, item ids from the Bakers partials, Lightframe overlay | Keeps their platform |
| Testimonials | 8 verbatim quotes with the attribution Bakers shows | Rule 2 |
| Stats | The three home page figures with source notes | The multi day page's "8-12" and "90%" figures were left out: they conflict with the group sizes stated elsewhere on the site and need Johnny's confirmation |
| Press | The four "As featured in" logos | Shown on their site |
| Journal | The three most recent posts | Two older posts (Narawntapu wander, tourism future) can be migrated at launch |
| Legal | Privacy, refund and terms verbatim | The liability waiver (18 KB) needs a careful copy pass and is logged as a gap |
| Videos | Bakers' own four loops. The mp4 files are the originals (the landing loop is 5.3 MB, above the 3 MB target); the webm sources are trimmed to 12 seconds | The sandbox ffmpeg has no H.264 support. Compress the mp4s to under 3 MB before launch |
| Signature moment | Timeline: "From wilderness to legacy" from the founder page | The estate map is already the location block |
| Trip finder, route map, day on the trail, season calendar, conditions, park alerts | skip | Not on the Bakers site; the fidelity test compares like for like |
| Compare table, trust row, next departure, who it's for, mobile book bar | include | Kit improvements (A4), on by default |

## Redirects

`redirects.json` maps every old Bakers URL to its new one for the day the kit version replaces the Webflow export.

## Site level overrides

None.
