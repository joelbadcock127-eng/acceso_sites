// Generates clearly marked placeholder images for the Ridgeline demo (A10).
// Never used for a real prospect: real sites use the prospect's own photos.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
const out = new URL('../sites/_demo_ridgeline/src/images/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });
const scenes = [
  ['#2b4a5e', '#c9a86a', 'Alpine ridge at dawn'], ['#3b5c4a', '#e8d9b5', 'The Razorback'], ['#4a5e3b', '#d9c9a0', 'Walkers on the ridge'], ['#5e6b4a', '#f0e6c8', 'Snow gums'],
  ['#6b4a5e', '#f2d7c8', 'Alpine wildflowers'], ['#3b4a5e', '#d4c4a8', 'Guide with group'], ['#5e4a3b', '#e6d2b8', 'Guide portrait'], ['#2e3a44', '#e8b57a', 'Hut camp at dusk'],
  ['#3a4f66', '#f5e1b8', 'Summit view'], ['#55663a', '#efe3c4', 'High plains'], ['#664a3a', '#f0dcc4', 'Group on track'], ['#2f4a3a', '#cfe0c8', 'Mountain ash'],
  ['#4a3f2f', '#e9d7b3', 'Hut'], ['#0f1a2b', '#c8d6f0', 'Night sky'],
];
for (let i = 0; i < scenes.length; i++) {
  const [a, b, label] = scenes[i];
  const W = 1600, H = 1067;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <path d="M0 ${H * 0.62} L${W * 0.18} ${H * 0.42} L${W * 0.33} ${H * 0.55} L${W * 0.5} ${H * 0.3} L${W * 0.66} ${H * 0.5} L${W * 0.82} ${H * 0.38} L${W} ${H * 0.58} L${W} ${H} L0 ${H} Z" fill="${a}" opacity=".85"/>
    <path d="M0 ${H * 0.78} L${W * 0.25} ${H * 0.62} L${W * 0.5} ${H * 0.72} L${W * 0.75} ${H * 0.58} L${W} ${H * 0.7} L${W} ${H} L0 ${H} Z" fill="#000" opacity=".25"/>
    <text x="40" y="${H - 40}" font-family="Helvetica, Arial, sans-serif" font-size="34" fill="#fff" opacity=".85">DEMO PLACEHOLDER · ${label}</text>
  </svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toFile(`${out}demo-${String(i + 1).padStart(2, '0')}.jpg`);
}
console.log(`Wrote ${scenes.length} demo images to ${out}`);
