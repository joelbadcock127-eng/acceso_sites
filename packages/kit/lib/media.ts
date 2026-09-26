// Optimised poster URLs for videos: the poster is the LCP image, so it goes
// through astro:assets like every other image (A4c, section 7).
import { getImage } from 'astro:assets';
const images = import.meta.glob<{ default: ImageMetadata }>('/src/images/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}');
export async function posterUrl(src?: string, width = 1600): Promise<string | undefined> {
  if (!src) return undefined;
  const key = '/src/' + src.replace(/^\/?(src\/)?/, '');
  if (!images[key]) return src;
  const mod = (await images[key]()).default;
  const out = await getImage({ src: mod, width: Math.min(width, mod.width), format: 'webp', quality: 62 });
  return out.src;
}
