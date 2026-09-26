// B1b at launch: import_social_export.mjs {slug} {folder}. Reads an owner's
// Instagram or Facebook data download (JSON format) and writes captions.md
// plus every original photo and video into intake/social/.
import { readdirSync, readFileSync, statSync, mkdirSync, copyFileSync, writeFileSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { siteDir, log } from './lib/site.mjs';
const [slug, folder] = process.argv.slice(2);
if (!slug || !folder) { console.error('Usage: node scripts/import_social_export.mjs {slug} {folder}'); process.exit(2); }
const out = join(siteDir(slug), 'intake/social'); mkdirSync(join(out, 'images'), { recursive: true }); mkdirSync(join(out, 'videos'), { recursive: true });
const posts = []; let media = 0;
const fixText = (s) => { try { return decodeURIComponent(escape(s)); } catch { return s; } }; // Meta exports mangle UTF-8
function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (f.endsWith('.json')) { try { const j = JSON.parse(readFileSync(p, 'utf8')); const arr = Array.isArray(j) ? j : j.ig_posts ?? j.posts ?? []; for (const post of arr) { const m = post.media ?? post.attachments?.flatMap((a) => a.data?.map((x) => x.media)) ?? []; const cap = fixText(post.title ?? m[0]?.title ?? post.data?.[0]?.post ?? ''); const ts = post.creation_timestamp ?? m[0]?.creation_timestamp ?? post.timestamp; if (!cap && !m.length) continue; const files = []; for (const x of m) { if (!x?.uri) continue; const src = join(folder, x.uri); try { statSync(src); const ext = extname(src).toLowerCase(); const isVid = ['.mp4', '.mov'].includes(ext); const name = `${String(++media).padStart(3, '0')}-${basename(src)}`; copyFileSync(src, join(out, isVid ? 'videos' : 'images', name)); files.push((isVid ? 'videos/' : 'images/') + name); } catch {} } posts.push({ caption: cap, date: ts ? new Date(ts * 1000).toISOString().slice(0, 10) : '', files }); } } catch {} } } }
walk(folder);
posts.sort((a, b) => b.date.localeCompare(a.date));
writeFileSync(join(out, 'captions.md'), '# Social captions (owner data download)\n\n' + posts.map((p) => `## ${p.date}\n\nSource: owner data export${p.files.length ? '\nMedia: ' + p.files.join(', ') : ''}\n\n${p.caption}\n`).join('\n'));
log(`Imported ${posts.length} posts and ${media} media files into intake/social/. Latest post: ${posts[0]?.date ?? 'none'}.`);
