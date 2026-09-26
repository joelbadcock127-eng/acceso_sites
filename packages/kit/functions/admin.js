// /admin: the owner's text field editor. It mirrors the Bakers editor exactly
// in method (password, a list of every text and image field, save commits to
// GitHub through the Contents API and the site rebuilds), applied to the
// content files in sites/{slug}/src/content instead of HTML partials.
// Env: ADMIN_PASSWORD, GITHUB_TOKEN, CONTENT_REPO (owner/repo), CONTENT_BRANCH, SITE_SLUG.
import { json, html, esc, gate } from './lib.js';

const GH = 'https://api.github.com';
const EDITABLE = ['site.json', 'testimonials.json', 'faqs.json', 'guides.json', 'press.json', 'stats.json', 'species.json', 'signature.json', 'plan.json'];
const LOCKED_KEYS = new Set(['sourceUrl', 'sourceFact', 'preview', 'booking', 'analytics']); // audit fields and wiring stay with Johnny

export async function handleAdmin(context) {
  const { request, env } = context;
  const g = await gate(context, 'kit_admin', env.ADMIN_PASSWORD, 'Edit your site');
  if (!g.ok) return g.response;
  const url = new URL(request.url);
  const slug = env.SITE_SLUG;
  const base = `sites/${slug}/src/content/`;
  if (!env.GITHUB_TOKEN || !env.CONTENT_REPO || !slug) return html('<p>The editor needs GITHUB_TOKEN, CONTENT_REPO and SITE_SLUG set on the Pages project.</p>', 503);
  const gh = (path, init = {}) => fetch(`${GH}/repos/${env.CONTENT_REPO}/contents/${path}${init.method ? '' : `?ref=${env.CONTENT_BRANCH || 'main'}`}`, { ...init, headers: { authorization: `Bearer ${env.GITHUB_TOKEN}`, accept: 'application/vnd.github+json', 'user-agent': 'acceso-kit-admin', ...(init.headers || {}) } });

  if (url.pathname === '/api/admin/files') {
    const list = await (await gh(base)).json();
    const exp = await (await gh(base + 'experiences')).json().catch(() => []);
    const files = [...(Array.isArray(list) ? list : []).filter((f) => EDITABLE.includes(f.name)).map((f) => f.name), ...(Array.isArray(exp) ? exp : []).map((f) => 'experiences/' + f.name)];
    return json({ files });
  }
  if (url.pathname === '/api/admin/file') {
    const name = url.searchParams.get('name') || '';
    if (!safeName(name)) return json({ error: 'Bad file' }, 400);
    const meta = await (await gh(base + name)).json();
    const text = atob((meta.content || '').replace(/\n/g, ''));
    const doc = parse(name, text);
    return json({ name, sha: meta.sha, fields: flatten(doc.data), body: doc.body });
  }
  if (url.pathname === '/api/admin/save' && request.method === 'POST') {
    const { name, sha, fields, body } = await request.json();
    if (!safeName(name)) return json({ error: 'Bad file' }, 400);
    const meta = await (await gh(base + name)).json();
    const current = parse(name, atob((meta.content || '').replace(/\n/g, '')));
    if (meta.sha !== sha) return json({ error: 'This file changed since you opened it. Reload and try again.' }, 409);
    let changed = 0;
    for (const [path, value] of Object.entries(fields)) { if (LOCKED_KEYS.has(path.split('.').pop())) continue; if (setPath(current.data, path, value)) changed++; }
    if (typeof body === 'string' && body !== current.body) { current.body = body; changed++; }
    if (!changed) return json({ ok: true, changed: 0 });
    const text = serialize(name, current);
    const put = await gh(base + name, { method: 'PUT', body: JSON.stringify({ message: `Admin edit: ${name} (${changed} change${changed === 1 ? '' : 's'})`, content: btoa(unescape(encodeURIComponent(text))), sha: meta.sha, branch: env.CONTENT_BRANCH || 'main' }) });
    if (!put.ok) return json({ error: `GitHub rejected the save (${put.status})` }, 502);
    return json({ ok: true, changed });
  }
  return html(EDITOR);
}

const safeName = (n) => /^(experiences\/[a-z0-9-]+\.md|[a-z]+\.json)$/.test(n);
function parse(name, text) {
  if (name.endsWith('.json')) return { data: JSON.parse(text || '{}'), body: null };
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  return { data: m ? parseYamlLite(m[1]) : {}, body: m ? m[2] : text, raw: m ? m[1] : '' };
}
function serialize(name, doc) {
  if (name.endsWith('.json')) return JSON.stringify(doc.data, null, 2) + '\n';
  return `---\n${toYaml(doc.data)}---\n${doc.body ?? ''}`;
}
// Flatten to "a.b.0.c": value for the field list; strings and numbers only.
function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj ?? {})) { const p = prefix ? `${prefix}.${k}` : k; if (v && typeof v === 'object') flatten(v, p, out); else if (typeof v === 'string' || typeof v === 'number') out[p] = v; }
  return out;
}
function setPath(obj, path, value) {
  const keys = path.split('.'); let o = obj;
  for (const k of keys.slice(0, -1)) { if (o[k] == null) return false; o = o[k]; }
  const last = keys[keys.length - 1]; const prev = o[last];
  if (prev === undefined || typeof prev === 'object') return false;
  const next = typeof prev === 'number' ? Number(value) : String(value);
  if (prev === next) return false; o[last] = next; return true;
}
// Minimal YAML: enough for the frontmatter the kit writes (block maps, block lists, flow maps and lists, quoted scalars).
function parseYamlLite(src) {
  const lines = src.split('\n'); let i = 0;
  const scalar = (s) => { s = s.trim(); if (s === '') return ''; if (/^".*"$/.test(s)) return JSON.parse(s); if (/^'.*'$/.test(s)) return s.slice(1, -1).replace(/''/g, "'"); if (s === 'true') return true; if (s === 'false') return false; if (s === 'null') return null; if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s); if (s.startsWith('{') || s.startsWith('[')) return flow(s); return s; };
  const flow = (s) => { // convert flow syntax to JSON by quoting bare tokens
    let out = '', tok = '', inStr = false, q = '';
    const push = () => { const t = tok.trim(); if (t !== '') out += JSON.stringify(scalar(t)); tok = ''; };
    for (let c = 0; c < s.length; c++) { const ch = s[c]; if (inStr) { tok += ch; if (ch === q && s[c - 1] !== '\\') { inStr = false; } continue; } if (ch === '"' || ch === "'") { inStr = true; q = ch; tok += ch; continue; } if ('{}[],:'.includes(ch)) { if (ch === ':' && /^[A-Za-z_][\w-]*$/.test(tok.trim())) { out += JSON.stringify(tok.trim()) + ':'; tok = ''; continue; } push(); out += ch; } else tok += ch; }
    push(); return JSON.parse(out);
  };
  const indentOf = (l) => l.match(/^ */)[0].length;
  function block(indent) {
    const isList = lines[i]?.trim().startsWith('- '); const res = isList ? [] : {};
    while (i < lines.length) {
      const line = lines[i]; if (!line.trim()) { i++; continue; } const ind = indentOf(line); if (ind < indent) break; if (ind > indent) { i++; continue; }
      if (isList) { const rest = line.trim().slice(2); i++; if (rest.includes(': ') && !rest.startsWith('{') && !rest.startsWith('"')) { const obj = {}; const [k, ...v] = rest.split(': '); obj[k] = scalar(v.join(': ')); if (i < lines.length && indentOf(lines[i]) > indent && !lines[i].trim().startsWith('- ')) Object.assign(obj, block(indentOf(lines[i]))); res.push(obj); } else res.push(scalar(rest)); }
      else { const m = line.trim().match(/^([\w-]+):(.*)$/); if (!m) { i++; continue; } const key = m[1], rest = m[2].trim(); i++; if (rest === '' ) { res[key] = (i < lines.length && indentOf(lines[i]) > indent) ? block(indentOf(lines[i])) : null; } else res[key] = scalar(rest); }
    }
    return res;
  }
  return block(0);
}
function toYaml(v, indent = '') {
  const q = (s) => JSON.stringify(String(s));
  if (Array.isArray(v)) return v.map((x) => (x && typeof x === 'object' ? `${indent}- ${toYaml(x, indent + '  ').trimStart()}` : `${indent}- ${typeof x === 'string' ? q(x) : x}\n`)).join('');
  if (v && typeof v === 'object') return Object.entries(v).map(([k, x]) => (x && typeof x === 'object' ? (Array.isArray(x) && x.length === 0 ? `${indent}${k}: []\n` : Object.keys(x).length === 0 && !Array.isArray(x) ? `${indent}${k}: {}\n` : `${indent}${k}:\n${toYaml(x, indent + '  ')}`) : `${indent}${k}: ${typeof x === 'string' ? q(x) : x}\n`)).join('');
  return String(v);
}

const EDITOR = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Edit your site</title>
<style>body{font-family:system-ui;margin:0;background:#f4f2ee;color:#111}header{display:flex;gap:1rem;align-items:center;padding:.75rem 1rem;background:#fff;border-bottom:1px solid #ddd;position:sticky;top:0}main{display:grid;grid-template-columns:minmax(20rem,32rem) 1fr;min-height:calc(100vh - 3.5rem)}aside{padding:1rem;overflow:auto;border-right:1px solid #ddd;background:#fff}iframe{width:100%;height:100%;border:0;background:#fff}label{display:block;font-size:.75rem;color:#555;margin-top:.75rem;text-transform:uppercase;letter-spacing:.05em}input,textarea,select,button{font:inherit}input,textarea{width:100%;padding:.4rem;border:1px solid #ccc;box-sizing:border-box}textarea{min-height:5rem}button{padding:.5rem .9rem;background:#111;color:#fff;border:0;cursor:pointer}button[disabled]{opacity:.5}.msg{font-size:.85rem;color:#555}.img{max-width:100%;max-height:6rem;display:block;margin-top:.25rem;border:1px solid #ddd}</style>
<header><strong>Edit your site</strong><select id="file"></select><button id="save" disabled>Save changes</button><span class="msg" id="msg">Changes go live about a minute after saving.</span></header>
<main><aside id="fields"></aside><iframe id="preview" src="/" title="Site preview"></iframe></main>
<script>
const sel=document.getElementById('file'),fields=document.getElementById('fields'),save=document.getElementById('save'),msg=document.getElementById('msg');
let doc=null;
fetch('/api/admin/files').then(r=>r.json()).then(j=>{sel.innerHTML=j.files.map(f=>'<option>'+f+'</option>').join('');load();});
sel.onchange=load;
async function load(){const r=await fetch('/api/admin/file?name='+encodeURIComponent(sel.value));doc=await r.json();fields.innerHTML='';for(const [k,v] of Object.entries(doc.fields)){const l=document.createElement('label');l.textContent=k;const isImg=/\\.(jpe?g|png|webp|svg)$/i.test(String(v));const el=document.createElement(String(v).length>80?'textarea':'input');el.value=v;el.dataset.path=k;el.oninput=()=>{save.disabled=false;};fields.append(l,el);if(isImg){const i=document.createElement('img');i.className='img';i.src='/'+String(v).replace(/^images\\//,'_kit_img/');fields.append(i);}}if(doc.body!==null){const l=document.createElement('label');l.textContent='page text (markdown)';const t=document.createElement('textarea');t.style.minHeight='16rem';t.value=doc.body;t.dataset.body='1';t.oninput=()=>{save.disabled=false;};fields.append(l,t);}save.disabled=true;
 const m=sel.value.match(/^experiences\\/(.*)\\.md$/);preview.src=m?'/experiences/'+m[1]:'/';}
save.onclick=async()=>{save.disabled=true;msg.textContent='Saving…';const f={};fields.querySelectorAll('[data-path]').forEach(e=>f[e.dataset.path]=e.value);const body=fields.querySelector('[data-body]')?.value;const r=await fetch('/api/admin/save',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:doc.name,sha:doc.sha,fields:f,body})});const j=await r.json();msg.textContent=j.ok?('Saved '+j.changed+' change(s). The site rebuilds in about a minute.'):(j.error||'Save failed');if(!j.ok)save.disabled=false;};
</script></html>`;
