# Archetypes

Bakers is a hosted lodge experience, and not every prospect is. Each archetype is a starting theme plus a few component choices. The prospect's own logo and photos always override the archetype's colours. Intake picks one automatically from their product mix and records the reason in `audit.md`; Johnny overrides with "Use archetype {name}".

| Archetype | Fits | Feel | Emphasis |
|---|---|---|---|
| `lodge` (Bakers default) | Hosted multi day walks with accommodation, food, comfort | Warm neutrals, refined serif, video hero, lots of air | Accommodation, packages, experience, reviews |
| `expedition` | Remote pack carrying trips, Kimberley, Kakadu, alpine treks | Deep earth tones, strong condensed display face, subtle topographic line texture | Departures table, grade, logistics, safety, guide experience, what to bring |
| `naturalist` | Birding, wildlife, rainforest and nocturnal guiding | Field guide feel, lighter ground, crisp labels, a small italic accent | Species grid, guide credentials, half and full day options, private guiding |
| `country` | Aboriginal owned and cultural experiences | Led entirely by the operator's own artwork, colours and imagery. Storytelling first | Story, Acknowledgement (their wording), cultural protocol notes they provide, guides |

## Starting themes

Colours are starting points only. B4 replaces the accent with the prospect's logo colour and the neutrals with tones from their photography. Every set below passes the AA contrast gate.

### lodge

```json
{ "pairing": "lodge", "colors": { "ground": "#f8f5f0", "surface": "#ffffff", "ink": "#050403", "muted": "#5f5b55", "line": "rgba(5,4,3,0.15)", "accent": "#b0985b", "accentInk": "#050403", "overlay": "rgba(0,0,0,0.5)", "band": "#4a4948", "bandInk": "#f8f5f0" }, "radius": "0px", "heroStyle": "video", "texture": "none",
  "variants": { "hero": "full", "positioning": "centred", "featureSplit": "alternate", "offerCards": "three", "statsRow": "band", "testimonials": "slider", "ctaBand": "image", "keyFacts": "banner" } }
```

Component choices: `FeatureSplit` with video or four photo mosaics, `AmenityGrid`, `PackageCards`, `Testimonials` near booking, `CommitmentBand`.

### expedition

```json
{ "pairing": "expedition", "colors": { "ground": "#f3efe6", "surface": "#fbf9f4", "ink": "#1d2a24", "muted": "#55635c", "line": "rgba(29,42,36,0.16)", "accent": "#b5562a", "accentInk": "#fbf9f4", "overlay": "rgba(16,24,20,0.5)", "band": "#1d2a24", "bandInk": "#f3efe6" }, "radius": "2px", "heroStyle": "stillSlowZoom", "texture": "topo",
  "variants": { "hero": "split", "positioning": "left", "featureSplit": "stacked", "offerCards": "featurePlusTwo", "statsRow": "cards", "testimonials": "grid", "ctaBand": "split", "keyFacts": "pills" } }
```

Component choices: `DeparturesTable`, `GradeExplainer`, `RouteMap` and `ElevationProfile`, `PackingList`, `GettingThere`, `WhoItsFor`, `ConditionsThisWeek` where weather matters.

### naturalist

```json
{ "pairing": "naturalist", "colors": { "ground": "#fbfaf6", "surface": "#ffffff", "ink": "#22302a", "muted": "#5b6a62", "line": "rgba(34,48,42,0.14)", "accent": "#3f6b4f", "accentInk": "#ffffff", "overlay": "rgba(20,30,25,0.45)", "band": "#2f4a3c", "bandInk": "#fbfaf6" }, "radius": "4px", "heroStyle": "still", "texture": "grain",
  "variants": { "hero": "typeLed", "positioning": "band", "featureSplit": "mosaicLeft", "offerCards": "list", "statsRow": "inline", "testimonials": "single", "ctaBand": "solid", "keyFacts": "stacked" } }
```

Component choices: `SpeciesGrid`, `GuideCards` with credentials, `CalcomEmbed` for half and full days (Group 3), `SeasonCalendar`, the private guiding quote form.

### country

```json
{ "pairing": "country", "colors": { "ground": "#faf7f2", "surface": "#ffffff", "ink": "#2a211b", "muted": "#66584d", "line": "rgba(42,33,27,0.15)", "accent": "#8c3b1f", "accentInk": "#ffffff", "overlay": "rgba(30,20,15,0.5)", "band": "#2a211b", "bandInk": "#faf7f2" }, "radius": "0px", "heroStyle": "still", "texture": "none",
  "variants": { "hero": "full", "positioning": "left", "featureSplit": "alternate", "offerCards": "three", "statsRow": "inline", "testimonials": "grid", "ctaBand": "image", "keyFacts": "banner" } }
```

Component choices: `StoryBlock` first, Acknowledgement of Country in their exact wording in the footer and on About, `GuideCards`, `CommitmentBand` for a cultural pledge they state. Never generate or imitate Indigenous art, dot patterns or motifs; texture stays `none` unless it's their own artwork.

## Variants

Each archetype sets default layout variants (above). When two clients share an archetype, change at least three variants between them so no two client sites look alike side by side. The full list lives in `packages/kit/lib/theme/theme.ts` (`variantSchema`).

## Font pairings

Eight pairings live in `packages/kit/lib/theme/pairings.ts`: `lodge`, `expedition`, `naturalist`, `country`, `coastal`, `alpine`, `outback`, `rainforest`. All Google Fonts or open licence, self hosted. A site may keep Adobe Fonts through `adobeKitId` (Bakers does).
