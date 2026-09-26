import type { BookingAdapter, BookingConfig } from './types';
import * as a from './adapters';
export type { BookingAdapter, BookingConfig, BookingTarget } from './types';

const registry: Record<BookingAdapter['id'], (cfg: BookingConfig) => BookingAdapter> = {
  fareharbor: a.fareharbor, rezdy: a.rezdy, bookeo: a.bookeo, checkfront: a.checkfront, woocommerce: a.woocommerce, request: a.request, calcom: a.calcom, acceso: a.acceso,
};

export function getAdapter(cfg: BookingConfig): BookingAdapter {
  const make = registry[cfg.provider];
  if (!make) throw new Error(`Unknown booking provider ${cfg.provider}`);
  return make(cfg);
}
