// Shared page setup: site, adapter, experiences and the lists every page may need.
import { getSite, getExperiences, safeCollection } from './site';
import { getAdapter } from './booking';
export async function pageData() {
  const site = await getSite();
  const adapter = getAdapter({ ...site.booking, giftUrl: site.booking.giftUrl ?? undefined });
  const experiences = await getExperiences();
  const testimonials = (await safeCollection('testimonials')).map((t) => t.data);
  const faqs = (await safeCollection('faqs')).map((f) => f.data);
  const guides = (await safeCollection('guides')).map((g) => g.data);
  const press = (await safeCollection('press')).map((p) => p.data);
  const stats = (await safeCollection('stats')).map((s) => s.data);
  const species = (await safeCollection('species')).map((s) => s.data);
  const posts = (await safeCollection('posts')).map((p) => ({ ...p, slug: p.id.replace(/\.md$/, '') }));
  const legal = (await safeCollection('legal')).map((p) => ({ ...p, slug: p.id.replace(/\.md$/, '') }));
  const program = (await safeCollection('program')).map((p) => p.data);
  const signatureEntry = (await safeCollection('signature'))[0];
  const signature = signatureEntry ? signatureEntry.data : null;
  return { site, adapter, experiences, testimonials, faqs, guides, press, stats, species, posts, legal, signature, program };
}
