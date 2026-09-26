// Tiny static server for a built site (dist/), used by qa, shots and review.
import { createServer } from 'node:http';
import { gzipSync } from 'node:zlib';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain', '.xml': 'application/xml', '.pdf': 'application/pdf', '.ico': 'image/x-icon' };
export async function serve(dir, port = 0) {
  let headers = {};
  try { const h = await readFile(join(dir, '_headers'), 'utf8'); headers = parseHeaders(h); } catch {}
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    let p = decodeURIComponent(url.pathname);
    const candidates = p.endsWith('/') ? [p + 'index.html'] : [p, p + '.html', p + '/index.html'];
    for (const c of candidates) {
      const f = join(dir, c);
      try { const s = await stat(f); if (s.isFile()) { let body = await readFile(f); const h = { 'content-type': TYPES[extname(f)] ?? 'application/octet-stream', ...matchHeaders(headers, p) };
          // Cloudflare compresses text on the edge; do the same so Lighthouse measures realistic transfer sizes.
          if (/^(text\/|application\/(json|javascript|xml)|image\/svg)/.test(h['content-type']) && /gzip/.test(req.headers['accept-encoding'] || '')) { body = gzipSync(body); h['content-encoding'] = 'gzip'; }
          res.writeHead(200, h); res.end(body); return; } } catch {}
    }
    try { const body = await readFile(join(dir, '404.html')); res.writeHead(404, { 'content-type': 'text/html; charset=utf-8', ...matchHeaders(headers, p) }); res.end(body); } catch { res.writeHead(404); res.end('Not found'); }
  });
  await new Promise((r) => server.listen(port, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  return { base, close: () => new Promise((r) => server.close(r)) };
}
function parseHeaders(text) {
  const rules = []; let cur = null;
  for (const line of text.split('\n')) { if (!line.trim()) continue; if (!line.startsWith(' ')) { cur = { pattern: line.trim(), headers: {} }; rules.push(cur); } else if (cur) { const [k, ...v] = line.trim().split(':'); cur.headers[k.trim().toLowerCase()] = v.join(':').trim(); } }
  return rules;
}
function matchHeaders(rules, path) {
  const out = {};
  for (const r of rules) { const re = new RegExp('^' + r.pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$'); if (re.test(path)) Object.assign(out, r.headers); }
  return out;
}
