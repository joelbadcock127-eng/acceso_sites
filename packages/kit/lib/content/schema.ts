// Content schema for every site. Defined once here (A6) and reached by the
// /admin editor, which edits these JSON and Markdown files field by field.
// Every fact that reaches a page must come from one of these files.
import { z } from 'zod';

/** YAML parses bare dates as Date objects; keep them as ISO strings */
const isoDate = z.union([z.string(), z.date()]).transform((v) => (typeof v === 'string' ? v : v.toISOString().slice(0, 10)));

export const linkSchema = z.object({ label: z.string(), href: z.string() });

export const navGroupSchema = z.object({
  label: z.string(),
  links: z.array(linkSchema),
});

export const featuredCardSchema = z.object({
  title: z.string(),
  image: z.string(),
  alt: z.string().default(''),
  cta: z.string(),
  href: z.string().optional(),
  bookingTarget: z.object({ itemId: z.string().optional(), url: z.string().optional() }).optional(),
  kind: z.enum(['book', 'gift', 'link']).default('link'),
});

export const bookingSchema = z.object({
  provider: z.enum(['fareharbor', 'rezdy', 'bookeo', 'checkfront', 'woocommerce', 'request', 'calcom', 'acceso']).default('request'),
  group: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(2),
  /** FareHarbor shortname, Rezdy company slug, Bookeo page, Checkfront domain, Cal.com username, and so on */
  account: z.string().optional(),
  /** Default booking URL when an experience has none of its own */
  defaultUrl: z.string().optional(),
  giftUrl: z.string().nullable().optional(),
  /** Owner's stated reply time for request to book, for the confirmation email */
  responseTime: z.string().default('24 hours'),
  ownerFirstName: z.string().optional(),
  /** Payment link slots per experience for Group 2 (Stripe or Square). Sent after confirmation, never before */
  paymentLinks: z.record(z.string()).optional(),
});

export const siteSchema = z.object({
  business: z.object({
    name: z.string(),
    legalName: z.string().optional(),
    tagline: z.string().optional(),
    region: z.string().optional(),
    state: z.string().optional(),
    baseTown: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    founded: z.union([z.number(), z.string()]).optional(),
    ownerNames: z.array(z.string()).default([]),
    socials: z.object({
      facebook: z.string().optional(),
      instagram: z.string().optional(),
      youtube: z.string().optional(),
      tripadvisor: z.string().optional(),
      google: z.string().optional(),
    }).default({}),
    /** Their exact Acknowledgement of Country wording, or null */
    acknowledgement: z.string().nullable().default(null),
    /** Lat and lng of the base town, for maps and structured data */
    location: z.object({ lat: z.number(), lng: z.number() }).optional(),
    driveTimes: z.array(z.object({ from: z.string(), time: z.string(), sourceUrl: z.string().optional() })).default([]),
    nearestAirport: z.string().optional(),
    mapsUrl: z.string().optional(),
    /** Their own stylised region map image, used instead of the generated outline when present */
    mapImage: z.string().optional(),
    mapImageAlt: z.string().optional(),
    /** A pledge they state, for CommitmentBand */
    commitment: z.object({ heading: z.string(), body: z.string(), href: z.string().optional(), image: z.string().optional(), sourceUrl: z.string() }).optional(),
    /** Contact channels they already invite, for TapToChat */
    chat: z.object({ whatsapp: z.string().optional(), sms: z.string().optional(), messenger: z.string().optional() }).optional(),
    /** A one line 404 message in their voice */
    notFoundLine: z.string().optional(),
  }),
  booking: bookingSchema.default({}),
  nav: z.object({
    primary: z.array(linkSchema).default([]),
    groups: z.array(navGroupSchema).default([]),
    featured: z.array(featuredCardSchema).default([]),
    bookLabel: z.string().optional(),
  }).default({}),
  footer: z.object({
    columns: z.array(navGroupSchema).default([]),
    legal: z.array(linkSchema).default([]),
    credit: z.string().optional(),
  }).default({}),
  seo: z.object({
    defaultTitle: z.string(),
    defaultDescription: z.string(),
    ogImage: z.string().optional(),
    siteUrl: z.string().optional(),
  }),
  newsletter: z.object({ provider: z.string(), actionUrl: z.string(), blurb: z.string().optional() }).nullable().default(null),
  preview: z.object({
    enabled: z.boolean().default(true),
    preparedFor: z.string().optional(),
    sourceDomain: z.string().optional(),
  }).default({ enabled: true }),
  /** Home page copy that isn't an experience or a list */
  home: z.object({
    hero: z.object({
      headline: z.string(),
      support: z.string().optional(),
      cta: linkSchema.optional(),
      video: z.string().optional(),
      poster: z.string().optional(),
      image: z.string().optional(),
      alt: z.string().optional(),
      /** CSS object-position for the hero image, so the subject survives portrait crops ("30% 50%") */
      focal: z.string().optional(),
      /** Only for cinemagraphs made from their own photo (B7). Needs owner approval before launch */
      aiMotion: z.boolean().default(false),
    }),
    positioning: z.object({ heading: z.string(), body: z.string(), link: linkSchema.optional() }).optional(),
    features: z.array(z.object({
      heading: z.string(),
      body: z.string(),
      link: linkSchema.optional(),
      video: z.string().optional(),
      poster: z.string().optional(),
      images: z.array(z.object({ src: z.string(), alt: z.string() })).default([]),
    })).default([]),
    offers: z.object({ heading: z.string(), intro: z.string().optional() }).optional(),
    statsHeading: z.string().optional(),
    story: z.object({ heading: z.string(), body: z.string(), image: z.string().optional(), alt: z.string().optional(), link: linkSchema.optional() }).optional(),
    cta: z.object({ heading: z.string(), body: z.string().optional(), label: z.string().optional(), image: z.string().optional(), video: z.string().optional(), poster: z.string().optional() }).optional(),
    contactHeading: z.string().optional(),
  }),
  about: z.object({
    heading: z.string().optional(),
    intro: z.string().optional(),
    story: z.string().optional(),
    image: z.string().optional(),
    alt: z.string().optional(),
  }).optional(),
  contact: z.object({
    heading: z.string().optional(),
    intro: z.string().optional(),
    interests: z.array(z.string()).default([]),
  }).default({}),
  privateGroups: z.object({
    heading: z.string(),
    intro: z.string(),
    body: z.string().optional(),
    kinds: z.array(z.string()).default([]),
    image: z.string().optional(),
    alt: z.string().optional(),
    sourceUrl: z.string(),
  }).optional(),
  giftVouchers: z.object({
    heading: z.string(),
    intro: z.string(),
    image: z.string().optional(),
    alt: z.string().optional(),
    sourceUrl: z.string(),
  }).optional(),
  gettingThere: z.object({
    meetingPoint: z.string().optional(),
    directionsUrl: z.string().optional(),
    notes: z.string().optional(),
    sourceUrl: z.string().optional(),
  }).optional(),
  parkAlerts: z.object({ label: z.string(), url: z.string() }).optional(),
  reviews: z.object({
    /** A rating may only appear if it's on their site or Johnny confirms it (section 1, rule 2) */
    ratingLine: z.string().optional(),
    ratingSourceUrl: z.string().optional(),
    tripadvisorUrl: z.string().optional(),
    googleUrl: z.string().optional(),
    /** Official widget embed code, launch only */
    widgetEmbed: z.string().optional(),
  }).default({}),
  instagram: z.object({ handle: z.string().optional(), embedHtml: z.string().optional() }).default({}),
  analytics: z.object({ plausibleDomain: z.string().optional(), ga4: z.string().optional() }).default({}),
  trust: z.array(z.object({ label: z.string(), value: z.string(), sourceUrl: z.string() })).default([]),
  seasons: z.array(z.object({ months: z.array(z.number().min(1).max(12)), note: z.string(), sourceUrl: z.string().optional() })).default([]),
  conditions: z.object({ lat: z.number(), lng: z.number(), label: z.string() }).optional(),
  youtube: z.array(z.object({ id: z.string(), title: z.string() })).default([]),
});

export const gradeSchema = z.object({
  system: z.enum(['awtgs', 'own']).default('own'),
  value: z.union([z.number(), z.string()]),
  label: z.string(),
  explainer: z.string().optional(),
});

export const experienceSchema = z.object({
  title: z.string(),
  slug: z.string().optional(),
  type: z.enum(['day', 'multiday', 'private', 'corporate']).default('day'),
  summary: z.string(),
  bestFor: z.string().optional(),
  durationLabel: z.string().optional(),
  distanceKm: z.number().optional(),
  grade: gradeSchema.optional(),
  groupSize: z.object({ min: z.number().optional(), max: z.number().optional() }).optional(),
  priceFrom: z.object({ amount: z.number(), per: z.string().default('person'), note: z.string().optional(), isFrom: z.boolean().default(true) }).optional(),
  season: z.string().optional(),
  departures: z.array(z.object({ start: isoDate, end: isoDate.optional(), status: z.enum(['open', 'limited', 'full', 'private']).default('open'), sourceUrl: z.string().optional() })).default([]),
  startLocation: z.object({ name: z.string(), mapsUrl: z.string().optional() }).optional(),
  startTime: z.string().optional(),
  packFree: z.boolean().optional(),
  accommodation: z.string().optional(),
  amenities: z.array(z.object({ label: z.string(), icon: z.string().optional() })).default([]),
  highlights: z.array(z.string()).default([]),
  itinerary: z.array(z.object({ label: z.string(), title: z.string(), body: z.string() })).default([]),
  included: z.array(z.string()).default([]),
  excluded: z.array(z.string()).default([]),
  whatToBring: z.array(z.object({ group: z.string().default('carry'), item: z.string(), provided: z.boolean().default(false) })).default([]),
  fitness: z.string().optional(),
  suitsIf: z.array(z.string()).default([]),
  notForIf: z.array(z.string()).default([]),
  cancellation: z.string().optional(),
  accessibility: z.string().optional(),
  faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  gallery: z.array(z.object({ src: z.string(), alt: z.string(), score: z.number().min(1).max(5).optional() })).default([]),
  heroImage: z.string().optional(),
  heroAlt: z.string().optional(),
  cardImages: z.array(z.object({ src: z.string(), alt: z.string() })).default([]),
  packages: z.array(z.object({ name: z.string(), description: z.string().optional(), price: z.string(), bookingTarget: z.object({ itemId: z.string().optional(), url: z.string().optional() }).default({}) })).default([]),
  booking: z.object({ itemId: z.string().optional(), url: z.string().optional() }).default({}),
  featured: z.boolean().default(false),
  route: z.object({
    gpxFile: z.string().optional(),
    osmRelationId: z.number().optional(),
    /** Generated by scripts/route_elevation.mjs from the GPX; not hand edited */
    dataFile: z.string().optional(),
    pins: z.array(z.object({ name: z.string(), lat: z.number(), lng: z.number(), day: z.number().optional(), kind: z.enum(['start', 'camp', 'hut', 'highlight', 'finish']).default('highlight') })).default([]),
  }).optional(),
  dayOnTheTrail: z.array(z.object({ time: z.string(), line: z.string(), image: z.string().optional(), alt: z.string().optional() })).default([]),
  seasons: z.array(z.object({ months: z.array(z.number().min(1).max(12)), note: z.string() })).default([]),
  downloads: z.array(z.object({ kind: z.enum(['trip-notes', 'packing-list', 'welcome-pack']), file: z.string(), pages: z.number(), sizeKb: z.number() })).default([]),
  externalForms: z.array(linkSchema).default([]),
  calcomEvent: z.string().optional(),
  /** No dates yet: hide prices and booking, show a "notify me" request instead */
  datesComingSoon: z.boolean().default(false),
  datesComingNote: z.string().optional(),
  order: z.number().default(100),
  sourceUrl: z.string(),
});

export const testimonialSchema = z.object({
  quote: z.string(),
  name: z.string(),
  origin: z.string().optional(),
  experience: z.string().optional(),
  sourceUrl: z.string(),
});

export const faqSchema = z.object({ q: z.string(), a: z.string(), sourceUrl: z.string().optional() });

export const guideSchema = z.object({
  name: z.string(),
  role: z.string().optional(),
  bio: z.string(),
  yearsGuiding: z.union([z.number(), z.string()]).optional(),
  knowsBest: z.string().optional(),
  credentials: z.array(z.string()).default([]),
  photo: z.string().optional(),
  alt: z.string().optional(),
  sourceUrl: z.string(),
});

export const pressSchema = z.object({ name: z.string(), logo: z.string().optional(), href: z.string().optional(), sourceUrl: z.string() });

export const statSchema = z.object({ value: z.string(), label: z.string(), sourceFact: z.string() });

export const postSchema = z.object({
  title: z.string(),
  date: isoDate,
  category: z.string().optional(),
  readTime: z.string().optional(),
  summary: z.string().optional(),
  image: z.string().optional(),
  alt: z.string().optional(),
  sourceUrl: z.string(),
});

export const legalSchema = z.object({ title: z.string(), sourceUrl: z.string() });

export const speciesSchema = z.object({ name: z.string(), scientific: z.string().optional(), note: z.string().optional(), image: z.string().optional(), season: z.string().optional(), sourceUrl: z.string() });

/** Program calendar (kit module): a season of dated walks sold as a program rather than as products */
export const programSchema = z.object({
  date: isoDate,
  endDate: isoDate.optional(),
  title: z.string(),
  area: z.string().optional(),
  distanceKm: z.number().optional(),
  hours: z.string().optional(),
  grade: z.string().optional(),
  /** Pack weight or similar second badge ("12 to 15 kg") */
  pack: z.string().optional(),
  price: z.string().optional(),
  note: z.string().optional(),
  status: z.enum(['open', 'limited', 'full', 'cancelled', 'past']).default('open'),
  experience: z.string().optional(),
  sourceUrl: z.string(),
});

/** One signature moment per site (A4d), rendered from content only */
export const signatureSchema = z.object({
  kind: z.enum(['checklist', 'timeline', 'calendar', 'tides', 'nightsky', 'feature']),
  heading: z.string(),
  intro: z.string().optional(),
  items: z.array(z.object({ label: z.string(), detail: z.string().optional(), when: z.string().optional(), image: z.string().optional(), alt: z.string().optional() })).default([]),
  sourceUrl: z.string(),
});

export type Site = z.infer<typeof siteSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Testimonial = z.infer<typeof testimonialSchema>;
export type Guide = z.infer<typeof guideSchema>;
export type Stat = z.infer<typeof statSchema>;
