// /requests: a simple password protected page where the owner sees booking
// requests logged to D1 (Group 2). Export as JSON at /requests/export.json.
import { json, html, esc, gate } from './lib.js';

export async function handleRequests(context) {
  const { request, env } = context;
  const g = await gate(context, 'kit_requests', env.REQUESTS_PASSWORD, 'Booking requests');
  if (!g.ok) return g.response;
  if (!env.DB) return html('<p>No database bound to this site yet.</p>', 503);
  const url = new URL(request.url);
  if (request.method === 'POST' && url.pathname === '/requests/status') {
    const form = await request.formData();
    await env.DB.prepare('UPDATE booking_requests SET status = ? WHERE id = ?').bind(form.get('status'), Number(form.get('id'))).run();
    return new Response(null, { status: 303, headers: { location: '/requests' } });
  }
  let rows = [];
  try { rows = (await env.DB.prepare('SELECT * FROM booking_requests ORDER BY created_at DESC LIMIT 500').all()).results; } catch {}
  if (url.pathname === '/requests/export.json') return json(rows);
  const tr = rows.map((r) => `<tr><td>${esc(r.created_at.slice(0, 16).replace('T', ' '))}</td><td>${esc(r.experience)}</td><td>${esc(r.date)}</td><td>${esc(r.group_size)}</td><td>${esc(r.name)}<br><a href="mailto:${esc(r.email)}">${esc(r.email)}</a><br>${esc(r.phone)}</td><td>${esc(r.message)}</td><td><form method="post" action="/requests/status"><input type="hidden" name="id" value="${r.id}"><select name="status" onchange="this.form.submit()">${['new', 'confirmed', 'paid', 'declined'].map((s) => `<option ${s === r.status ? 'selected' : ''}>${s}</option>`).join('')}</select></form></td></tr>`).join('');
  return html(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Booking requests</title><style>body{font-family:system-ui;margin:2rem;background:#f4f2ee}table{border-collapse:collapse;width:100%;background:#fff}td,th{border:1px solid #ddd;padding:.5rem;vertical-align:top;font-size:.9rem;text-align:left}h1{font-size:1.5rem}</style><h1>Booking requests</h1><p>${rows.length} requests. <a href="/requests/export.json">Export JSON</a></p><table><thead><tr><th>Received</th><th>Walk</th><th>Date</th><th>Walkers</th><th>Who</th><th>Message</th><th>Status</th></tr></thead><tbody>${tr || '<tr><td colspan="7">No requests yet.</td></tr>'}</tbody></table>`);
}
