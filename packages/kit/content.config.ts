// Every site re-exports this from its own src/content.config.ts. The glob and
// file loaders resolve against the site folder (Astro's root), so each site
// only ever sees its own content.
import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import * as s from './lib/content/schema';

const single = (path: string) => file(path, { parser: (text) => [{ id: 'main', ...JSON.parse(text) }] });
// Lists get a stable id from their position, so the editor can address each row.
const list = (path: string) => file(path, { parser: (text) => (JSON.parse(text) as Record<string, unknown>[]).map((item, i) => ({ id: String(i + 1), ...item })) });

export const collections = {
  site: defineCollection({ loader: single('src/content/site.json'), schema: s.siteSchema }),
  experiences: defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/experiences' }), schema: s.experienceSchema }),
  testimonials: defineCollection({ loader: list('src/content/testimonials.json'), schema: s.testimonialSchema }),
  faqs: defineCollection({ loader: list('src/content/faqs.json'), schema: s.faqSchema }),
  guides: defineCollection({ loader: list('src/content/guides.json'), schema: s.guideSchema }),
  press: defineCollection({ loader: list('src/content/press.json'), schema: s.pressSchema }),
  stats: defineCollection({ loader: list('src/content/stats.json'), schema: s.statSchema }),
  species: defineCollection({ loader: list('src/content/species.json'), schema: s.speciesSchema }),
  signature: defineCollection({ loader: single('src/content/signature.json'), schema: s.signatureSchema }),
  posts: defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/posts' }), schema: s.postSchema }),
  legal: defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/legal' }), schema: s.legalSchema }),
};
