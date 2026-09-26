export const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', ...headers } });
export const html = (body, status = 200, headers = {}) => new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': 'noindex', ...headers } });
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
export function getCookie(request, name) {
  const c = request.headers.get('cookie') || '';
  const m = c.split(/;\s*/).find((x) => x.startsWith(name + '='));
  return m ? m.slice(name.length + 1) : null;
}
/** Password gate shared by /requests and /admin: an HMAC cookie, one week. */
export async function gate(context, cookieName, password, title) {
  const { request } = context;
  if (!password) return { ok: false, response: html(`<p>${esc(title)} is not configured: set the password in the Pages project's environment variables.</p>`, 503) };
  const token = await hmac(password, cookieName + '-v1');
  if (getCookie(request, cookieName) === token) return { ok: true };
  if (request.method === 'POST' && new URL(request.url).searchParams.get('login') === '1') {
    const form = await request.formData();
    if (form.get('password') === password) return { ok: false, response: new Response(null, { status: 303, headers: { location: new URL(request.url).pathname, 'set-cookie': `${cookieName}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800` } }) };
  }
  return { ok: false, response: html(loginPage(title)) };
}
const loginPage = (title) => `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(title)}</title><style>body{font-family:system-ui;display:grid;place-items:center;min-height:100vh;margin:0;background:#f4f2ee}form{display:grid;gap:.75rem;width:20rem;padding:2rem;background:#fff;border:1px solid #ddd}input,button{font:inherit;padding:.6rem}button{background:#111;color:#fff;border:0}</style><form method="post" action="?login=1"><h1 style="font-size:1.25rem;margin:0">${esc(title)}</h1><label>Password <input type="password" name="password" autofocus required></label><button>Sign in</button></form>`;
