// All booking goes through one interface (A7). No page builds a booking URL.
export type BookingTarget = { itemId?: string; url?: string };

export interface BookingAdapter {
  id: 'fareharbor' | 'rezdy' | 'bookeo' | 'checkfront' | 'woocommerce' | 'request' | 'calcom' | 'acceso';
  /** Label for the primary button. Group 2 must say "Request to book", never "Book now" */
  label: string;
  bookUrl(target?: BookingTarget): string;
  giftUrl?(): string | null;
  headScript?(): string | null;
  /** true only where the platform officially supports an embed */
  availabilityEmbed?: boolean;
  /** Extra attributes for the link, for example FareHarbor Lightframe */
  linkAttrs?(target?: BookingTarget): Record<string, string>;
  /** Group 2 and 3: the button opens an on page flow rather than leaving */
  onSite?: 'request' | 'calcom';
}

export interface BookingConfig {
  provider: BookingAdapter['id'];
  group: 1 | 2 | 3;
  account?: string;
  defaultUrl?: string;
  giftUrl?: string | null;
}
