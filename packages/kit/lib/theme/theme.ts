// theme.json → CSS variables (A2, A3). Every colour, font and shape a site
// uses comes from here. Components never hard code a value.
import { z } from 'zod';
import { getPairing } from './pairings';

export const variantSchema = z.object({
  hero: z.enum(['full', 'split', 'typeLed']).default('full'),
  positioning: z.enum(['centred', 'left', 'band']).default('centred'),
  featureSplit: z.enum(['alternate', 'stacked', 'mosaicLeft']).default('alternate'),
  offerCards: z.enum(['three', 'featurePlusTwo', 'list']).default('three'),
  statsRow: z.enum(['band', 'inline', 'cards']).default('band'),
  testimonials: z.enum(['slider', 'grid', 'single']).default('slider'),
  ctaBand: z.enum(['image', 'solid', 'split']).default('image'),
  keyFacts: z.enum(['banner', 'pills', 'stacked']).default('banner'),
});

export const themeSchema = z.object({
  archetype: z.enum(['lodge', 'expedition', 'naturalist', 'country']).default('lodge'),
  pairing: z.string().default('lodge'),
  colors: z.object({
    ground: z.string(),
    surface: z.string(),
    ink: z.string(),
    muted: z.string(),
    line: z.string(),
    accent: z.string(),
    accentInk: z.string(),
    overlay: z.string(),
    /** Optional dark band colour for hero, stats and CTA bands. Defaults to ink */
    band: z.string().optional(),
    bandInk: z.string().optional(),
  }),
  fonts: z.object({ display: z.string().optional(), body: z.string().optional(), label: z.string().optional() }).default({}),
  /** Keep Adobe Fonts (for example Bakers' own kit). Loaded from use.typekit.net */
  adobeKitId: z.string().optional(),
  radius: z.string().default('0px'),
  logo: z.object({
    src: z.string(),
    alt: z.string().default(''),
    framed: z.boolean().default(false),
    invertOnHero: z.boolean().default(false),
    height: z.string().default('3rem'),
    /** Word mark fallback if there's no usable logo file */
    wordmark: z.boolean().default(false),
  }),
  favicon: z.string().default('/favicon.svg'),
  /** Primary button fill: the accent, or the ink (Bakers uses black buttons and keeps its gold for lines) */
  buttons: z.enum(['accent', 'ink']).default('accent'),
  heroStyle: z.enum(['video', 'still', 'stillSlowZoom', 'typeLed']).default('still'),
  texture: z.enum(['none', 'topo', 'grain', 'place']).default('none'),
  /** Generated contour SVG for `place` texture (scripts/place_texture.mjs) */
  textureFile: z.string().optional(),
  variants: variantSchema.default({}),
  /** Optional overrides of the type scale, in rem, for the display face */
  scale: z.object({ h1: z.string().optional(), h2: z.string().optional(), h3: z.string().optional() }).default({}),
});

export type Theme = z.infer<typeof themeSchema>;

// ---------------------------------------------------------------- contrast
function parseColor(c: string): [number, number, number, number] | null {
  c = c.trim();
  let m = c.match(/^#([0-9a-f]{3,8})$/i);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = h.split('').map((x) => x + x).join('');
    const n = parseInt(h.slice(0, 6), 16);
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, a];
  }
  m = c.match(/^rgba?\(([^)]+)\)$/i);
  if (m) {
    const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  }
  return null;
}
function luminance([r, g, b]: number[]) {
  const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
export function contrast(a: string, b: string): number {
  const ca = parseColor(a); const cb = parseColor(b);
  if (!ca || !cb) return 0;
  const la = luminance(ca); const lb = luminance(cb);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export interface ContrastResult { pair: string; ratio: number; min: number; ok: boolean; advisory?: boolean }

/** AA: 4.5 for body text, 3 for large text and UI. Fails the build when any pair misses. */
export function checkContrast(theme: Theme): ContrastResult[] {
  const c = theme.colors;
  const band = c.band ?? c.ink; const bandInk = c.bandInk ?? c.surface;
  const pairs: [string, string, string, number][] = [
    ['ink on ground', c.ink, c.ground, 4.5],
    ['ink on surface', c.ink, c.surface, 4.5],
    ['muted on ground', c.muted, c.ground, 4.5],
    ['muted on surface', c.muted, c.surface, 4.5],
    ['accentInk on accent (buttons)', c.accentInk, c.accent, 4.5],
    ['bandInk on band', bandInk, band, 4.5],
  ];
  const results = pairs.map(([pair, a, b, min]) => { const ratio = contrast(a, b); return { pair, ratio: Math.round(ratio * 100) / 100, min, ok: ratio >= min, advisory: false }; });
  // Advisory only: the accent is never used for body text or button labels, but a low ratio means it can't carry icons or large text either.
  const acc = contrast(c.accent, c.ground);
  results.push({ pair: 'accent on ground (advisory: lines and fills only below 3)', ratio: Math.round(acc * 100) / 100, min: 3, ok: true, advisory: acc < 3 });
  return results;
}

// ---------------------------------------------------------------- css
export function buildThemeCss(theme: Theme): string {
  const pairing = getPairing(theme.pairing);
  const c = theme.colors;
  const useAdobe = !!theme.adobeKitId;
  const display = theme.fonts.display ? `"${theme.fonts.display}", ${pairing.display.fallback}` : `"${pairing.display.family}", "${pairing.display.family} Fallback", ${pairing.display.fallback}`;
  const body = theme.fonts.body ? `"${theme.fonts.body}", ${pairing.body.fallback}` : `"${pairing.body.family}", "${pairing.body.family} Fallback", ${pairing.body.fallback}`;
  const label = theme.fonts.label ? `"${theme.fonts.label}", ${pairing.body.fallback}` : body;
  const imports = useAdobe ? [] : [...pairing.display.imports, ...pairing.body.imports].map((i) => `@import "${i}";`);
  const fallbackFaces = useAdobe ? '' : `
@font-face { font-family: "${pairing.display.family} Fallback"; src: local("Georgia"), local("Times New Roman"); size-adjust: ${pairing.display.sizeAdjust ?? '100%'}; ascent-override: 95%; descent-override: 25%; }
@font-face { font-family: "${pairing.body.family} Fallback"; src: local("Arial"), local("Helvetica Neue"); size-adjust: ${pairing.body.sizeAdjust ?? '100%'}; ascent-override: 92%; descent-override: 22%; }`;
  return `/* Generated from theme.json by the kit. Do not edit; edit theme.json. */
${imports.join('\n')}
${fallbackFaces}
:root {
  --ground: ${c.ground};
  --surface: ${c.surface};
  --ink: ${c.ink};
  --muted: ${c.muted};
  --line: ${c.line};
  --accent: ${c.accent};
  --accent-ink: ${c.accentInk};
  --overlay: ${c.overlay};
  --band: ${c.band ?? c.ink};
  --band-ink: ${c.bandInk ?? c.surface};
  --font-display: ${display};
  --font-body: ${body};
  --font-label: ${label};
  --weight-display: ${pairing.display.weights.regular};
  --weight-display-bold: ${pairing.display.weights.bold};
  --weight-body: ${pairing.body.weights.regular};
  --weight-medium: ${pairing.body.weights.medium};
  --weight-bold: ${pairing.body.weights.bold};
  --radius: ${theme.radius};
  --logo-height: ${theme.logo.height};
  --btn-bg: ${theme.buttons === 'ink' ? c.ink : c.accent};
  --btn-ink: ${theme.buttons === 'ink' ? c.surface : c.accentInk};
  --size-h1: ${theme.scale.h1 ?? 'clamp(2.5rem, 1.6rem + 3.2vw, 4.5rem)'};
  --size-h2: ${theme.scale.h2 ?? 'clamp(2.25rem, 1.5rem + 2.4vw, 3.75rem)'};
  --size-h3: ${theme.scale.h3 ?? 'clamp(1.75rem, 1.3rem + 1.6vw, 3rem)'};
}
`;
}
