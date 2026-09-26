// Structured data (B9). Only facts from content; offers only where a price exists.
import type { Site, Experience } from './content/schema';
import { absoluteUrl } from './site';

export function organization(site: Site) {
  const b = site.business;
  return {
    '@context': 'https://schema.org', '@type': 'LocalBusiness', '@id': absoluteUrl(site, '/#business'),
    name: b.name, url: absoluteUrl(site, '/'), ...(b.email && { email: b.email }), ...(b.phone && { telephone: b.phone }),
    ...(b.address && { address: { '@type': 'PostalAddress', streetAddress: b.address, addressRegion: b.state, addressCountry: 'AU' } }),
    ...(b.location && { geo: { '@type': 'GeoCoordinates', latitude: b.location.lat, longitude: b.location.lng } }),
    ...(site.seo.ogImage && { image: absoluteUrl(site, site.seo.ogImage) }),
    sameAs: Object.values(b.socials).filter(Boolean),
  };
}

export function touristTrip(site: Site, e: Experience, slug: string) {
  return {
    '@context': 'https://schema.org', '@type': 'TouristTrip', name: e.title, description: e.summary, url: absoluteUrl(site, `/experiences/${slug}`),
    ...(e.heroImage && { image: absoluteUrl(site, e.heroImage) }),
    provider: { '@id': absoluteUrl(site, '/#business') },
    ...(e.itinerary.length && { itinerary: { '@type': 'ItemList', itemListElement: e.itinerary.map((d, i) => ({ '@type': 'ListItem', position: i + 1, name: `${d.label}: ${d.title}` })) } }),
    ...(e.priceFrom && { offers: { '@type': 'Offer', price: e.priceFrom.amount, priceCurrency: 'AUD', url: absoluteUrl(site, `/experiences/${slug}`), availability: 'https://schema.org/InStock' } }),
  };
}

export function faqPage(faqs: { q: string; a: string }[]) {
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
}

export function breadcrumb(site: Site, items: { name: string; path: string }[]) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absoluteUrl(site, it.path) })) };
}
