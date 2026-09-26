// Scroll motion (A2 rules): only fades and short rises, one hero moment per
// page, everything readable at rest, everything off under reduced motion.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initMotion() {
  document.documentElement.classList.add('js');
  if (reduced) return;
  gsap.registerPlugin(ScrollTrigger);
  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  for (const el of items) {
    const rect = el.getBoundingClientRect();
    // Anything already on screen at load stays readable; never parked at zero opacity.
    if (rect.top < window.innerHeight * 0.9) continue;
    const rise = Number(el.dataset.reveal || 18);
    gsap.set(el, { opacity: 0, y: rise });
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' }) });
  }
  // Number count for stats: the one flourish, and only once.
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const target = el.dataset.count || '';
    const num = parseFloat(target.replace(/[^0-9.]/g, ''));
    if (!isFinite(num)) return;
    const prefix = target.match(/^[^0-9]*/)?.[0] ?? '';
    const suffix = target.match(/[^0-9.]*$/)?.[0] ?? '';
    const decimals = (target.split('.')[1] || '').replace(/[^0-9]/g, '').length;
    const obj = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => gsap.to(obj, { v: num, duration: 1.4, ease: 'power2.out', onUpdate: () => { el.textContent = prefix + obj.v.toLocaleString('en-AU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix; } }) });
  });
}

/** Video sources are attached only after the page has painted (hero) or when
 * the video is near the viewport, so the poster is the LCP and video bytes
 * never compete with it. Under reduced motion no video loads at all. */
export function lazyVideos() {
  const attach = (v: HTMLVideoElement) => { if (v.dataset.attached) return; v.dataset.attached = '1'; v.querySelectorAll<HTMLSourceElement>('source[data-src]').forEach((s) => { s.src = s.dataset.src!; }); v.load(); v.play().catch(() => {}); };
  const all = Array.from(document.querySelectorAll<HTMLVideoElement>('video[data-lazy-video]'));
  if (reduced) { all.forEach((v) => { v.removeAttribute('autoplay'); }); return; }
  const hero = all.filter((v) => v.dataset.lazyVideo === 'hero');
  const rest = all.filter((v) => v.dataset.lazyVideo !== 'hero');
  const afterLoad = () => hero.forEach(attach);
  if (document.readyState === 'complete') setTimeout(afterLoad, 150); else window.addEventListener('load', () => setTimeout(afterLoad, 150), { once: true });
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) { attach(e.target as HTMLVideoElement); io.unobserve(e.target); } }, { rootMargin: '300px' }); rest.forEach((v) => io.observe(v)); } else rest.forEach(attach);
}

export function pauseOffscreenVideos() {
  const videos = document.querySelectorAll<HTMLVideoElement>('video[autoplay]');
  if (!('IntersectionObserver' in window) || !videos.length) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) { const v = e.target as HTMLVideoElement; if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }
  }, { threshold: 0.1 });
  videos.forEach((v) => { if (reduced) { v.removeAttribute('autoplay'); v.pause(); } else io.observe(v); });
}
