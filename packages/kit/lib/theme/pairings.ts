// Font pairings (A3). All Google Fonts or open licence, self hosted through
// fontsource so nothing loads from a third party at runtime. `lodge` is the
// Bakers default: Warbler Banner and Optima are Adobe fonts, so the open
// equivalents below carry the same feel (a soft high contrast serif over a
// humanist sans). A site may keep Adobe fonts with `adobeKitId` in theme.json.
export interface FontFace {
  family: string;
  /** fontsource CSS entry points to @import */
  imports: string[];
  fallback: string;
  /** Metric matched fallback so the page doesn't shift while fonts load */
  sizeAdjust?: string;
  weights: { regular: number; medium: number; bold: number };
}

export interface Pairing {
  id: string;
  name: string;
  feel: string;
  display: FontFace;
  body: FontFace;
  label?: FontFace;
}

const serifFallback = 'Georgia, "Times New Roman", serif';
const sansFallback = 'ui-sans-serif, system-ui, "Helvetica Neue", Arial, sans-serif';

export const pairings: Pairing[] = [
  {
    id: 'lodge',
    name: 'Newsreader and Alegreya Sans',
    feel: 'Warm editorial serif over a humanist sans. The Bakers default in open fonts.',
    display: { family: 'Newsreader Variable', imports: ['@fontsource-variable/newsreader/wght.css', '@fontsource-variable/newsreader/wght-italic.css'], fallback: serifFallback, sizeAdjust: '104%', weights: { regular: 400, medium: 500, bold: 600 } },
    body: { family: 'Alegreya Sans', imports: ['@fontsource/alegreya-sans/400.css', '@fontsource/alegreya-sans/500.css', '@fontsource/alegreya-sans/700.css', '@fontsource/alegreya-sans/400-italic.css'], fallback: sansFallback, sizeAdjust: '96%', weights: { regular: 400, medium: 500, bold: 700 } },
  },
  {
    id: 'expedition',
    name: 'Barlow Condensed and Source Sans 3',
    feel: 'Strong condensed display with a clean workhorse body. Remote, pack carrying trips.',
    display: { family: 'Barlow Condensed', imports: ['@fontsource/barlow-condensed/500.css', '@fontsource/barlow-condensed/600.css', '@fontsource/barlow-condensed/700.css'], fallback: '"Arial Narrow", Impact, sans-serif', sizeAdjust: '92%', weights: { regular: 500, medium: 600, bold: 700 } },
    body: { family: 'Source Sans 3 Variable', imports: ['@fontsource-variable/source-sans-3/wght.css'], fallback: sansFallback, sizeAdjust: '98%', weights: { regular: 400, medium: 500, bold: 700 } },
  },
  {
    id: 'naturalist',
    name: 'Fraunces and Work Sans',
    feel: 'A field guide: soft serif with a true italic, crisp labels underneath.',
    display: { family: 'Fraunces Variable', imports: ['@fontsource-variable/fraunces/wght.css', '@fontsource-variable/fraunces/wght-italic.css'], fallback: serifFallback, sizeAdjust: '100%', weights: { regular: 400, medium: 500, bold: 600 } },
    body: { family: 'Work Sans Variable', imports: ['@fontsource-variable/work-sans/wght.css'], fallback: sansFallback, sizeAdjust: '100%', weights: { regular: 400, medium: 500, bold: 600 } },
  },
  {
    id: 'country',
    name: 'DM Serif Display and DM Sans',
    feel: 'Quiet and neutral so the operator\'s own artwork and colour lead.',
    display: { family: 'DM Serif Display', imports: ['@fontsource/dm-serif-display/400.css', '@fontsource/dm-serif-display/400-italic.css'], fallback: serifFallback, sizeAdjust: '100%', weights: { regular: 400, medium: 400, bold: 400 } },
    body: { family: 'DM Sans Variable', imports: ['@fontsource-variable/dm-sans/wght.css'], fallback: sansFallback, sizeAdjust: '100%', weights: { regular: 400, medium: 500, bold: 700 } },
  },
  {
    id: 'coastal',
    name: 'Cormorant Garamond and Nunito Sans',
    feel: 'Light, airy serif with a rounded body. Coastal and island walks.',
    display: { family: 'Cormorant Garamond Variable', imports: ['@fontsource-variable/cormorant-garamond/wght.css', '@fontsource-variable/cormorant-garamond/wght-italic.css'], fallback: serifFallback, sizeAdjust: '110%', weights: { regular: 500, medium: 600, bold: 700 } },
    body: { family: 'Nunito Sans Variable', imports: ['@fontsource-variable/nunito-sans/wght.css'], fallback: sansFallback, sizeAdjust: '100%', weights: { regular: 400, medium: 600, bold: 700 } },
  },
  {
    id: 'alpine',
    name: 'Bricolage Grotesque and Figtree',
    feel: 'Contemporary grotesque with character. Alpine and high country.',
    display: { family: 'Bricolage Grotesque Variable', imports: ['@fontsource-variable/bricolage-grotesque/wght.css'], fallback: sansFallback, sizeAdjust: '100%', weights: { regular: 500, medium: 600, bold: 700 } },
    body: { family: 'Figtree Variable', imports: ['@fontsource-variable/figtree/wght.css'], fallback: sansFallback, sizeAdjust: '100%', weights: { regular: 400, medium: 500, bold: 700 } },
  },
  {
    id: 'outback',
    name: 'Young Serif and Mulish',
    feel: 'Sturdy, warm serif with a friendly body. Desert and outback country.',
    display: { family: 'Young Serif', imports: ['@fontsource/young-serif/400.css'], fallback: serifFallback, sizeAdjust: '100%', weights: { regular: 400, medium: 400, bold: 400 } },
    body: { family: 'Mulish Variable', imports: ['@fontsource-variable/mulish/wght.css'], fallback: sansFallback, sizeAdjust: '100%', weights: { regular: 400, medium: 500, bold: 700 } },
  },
  {
    id: 'rainforest',
    name: 'Libre Caslon Text and Karla',
    feel: 'Classic bookish serif with a plain spoken sans. Rainforest and wildlife guiding.',
    display: { family: 'Libre Caslon Text', imports: ['@fontsource/libre-caslon-text/400.css', '@fontsource/libre-caslon-text/700.css', '@fontsource/libre-caslon-text/400-italic.css'], fallback: serifFallback, sizeAdjust: '100%', weights: { regular: 400, medium: 400, bold: 700 } },
    body: { family: 'Karla Variable', imports: ['@fontsource-variable/karla/wght.css'], fallback: sansFallback, sizeAdjust: '100%', weights: { regular: 400, medium: 500, bold: 700 } },
  },
];

export function getPairing(id: string): Pairing {
  const p = pairings.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown font pairing "${id}". Known: ${pairings.map((x) => x.id).join(', ')}`);
  return p;
}
