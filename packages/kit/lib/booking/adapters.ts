import type { BookingAdapter, BookingConfig, BookingTarget } from './types';

const pick = (t: BookingTarget | undefined, cfg: BookingConfig) => t?.url ?? cfg.defaultUrl ?? '#book';

export function fareharbor(cfg: BookingConfig): BookingAdapter {
  const account = cfg.account ?? '';
  return {
    id: 'fareharbor', label: 'Book now',
    bookUrl: (t) => t?.url ?? (t?.itemId ? `https://fareharbor.com/embeds/book/${account}/items/${t.itemId}/?full-items=yes` : cfg.defaultUrl ?? `https://fareharbor.com/embeds/book/${account}/?full-items=yes`),
    giftUrl: () => cfg.giftUrl ?? (account ? `https://fareharbor.com/embeds/book/${account}/?full-items=yes&gifts=yes` : null),
    // Lightframe opens booking as an overlay on the site, the way Bakers does.
    headScript: () => `<script src="https://fareharbor.com/embeds/api/v1/" async></script>`,
    availabilityEmbed: true,
    linkAttrs: () => ({ 'data-fareharbor': 'lightframe' }),
  };
}

export function rezdy(cfg: BookingConfig): BookingAdapter {
  return {
    id: 'rezdy', label: 'Book now',
    bookUrl: (t) => t?.url ?? (t?.itemId && cfg.account ? `https://${cfg.account}.rezdy.com/${t.itemId}` : pick(t, cfg)),
    giftUrl: () => cfg.giftUrl ?? null,
    availabilityEmbed: false,
  };
}

export function bookeo(cfg: BookingConfig): BookingAdapter {
  return { id: 'bookeo', label: 'Book now', bookUrl: (t) => pick(t, cfg), giftUrl: () => cfg.giftUrl ?? null, availabilityEmbed: false };
}

export function checkfront(cfg: BookingConfig): BookingAdapter {
  return {
    id: 'checkfront', label: 'Book now',
    bookUrl: (t) => t?.url ?? (t?.itemId && cfg.account ? `https://${cfg.account}/reserve/?item_id=${t.itemId}` : pick(t, cfg)),
    giftUrl: () => cfg.giftUrl ?? null, availabilityEmbed: false,
  };
}

export function woocommerce(cfg: BookingConfig): BookingAdapter {
  return { id: 'woocommerce', label: 'Book now', bookUrl: (t) => pick(t, cfg), giftUrl: () => cfg.giftUrl ?? null, availabilityEmbed: false };
}

/** Group 2: request to book, handled on the page and logged to D1 */
export function request(cfg: BookingConfig): BookingAdapter {
  return { id: 'request', label: 'Request to book', bookUrl: (t) => `#request-to-book${t?.itemId ? `?experience=${encodeURIComponent(t.itemId)}` : ''}`, giftUrl: () => cfg.giftUrl ?? null, availabilityEmbed: false, onSite: 'request' };
}

/** Group 3: Cal.com event types per tour, pushed into the guide's calendar */
export function calcom(cfg: BookingConfig): BookingAdapter {
  return {
    id: 'calcom', label: 'Check availability',
    bookUrl: (t) => t?.url ?? (cfg.account ? `https://cal.com/${cfg.account}${t?.itemId ? '/' + t.itemId : ''}` : '#book'),
    giftUrl: () => cfg.giftUrl ?? null, availabilityEmbed: true, onSite: 'calcom',
  };
}

/** Stub for the Acceso engine. Clients move across by switching booking.provider (section 9). */
export function acceso(cfg: BookingConfig): BookingAdapter {
  return { id: 'acceso', label: 'Book now', bookUrl: (t) => t?.url ?? `#acceso-booking${t?.itemId ? '?item=' + encodeURIComponent(t.itemId) : ''}`, giftUrl: () => cfg.giftUrl ?? null, availabilityEmbed: true };
}
