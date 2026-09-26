// POST /api/form. Validates, checks the honeypot and Turnstile, writes booking
// requests to D1, then sends the owner summary and the sender's automatic reply
// through Web3Forms (the key lives in the Pages project's environment).
import { json } from './lib.js';

const KINDS = new Set(['contact', 'request', 'private-quote', 'corporate', 'gift-voucher', 'brochure', 'newsletter']);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function handleForm({ request, env }) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  let data;
  try { data = await request.json(); } catch { return json({ error: 'Bad request' }, 400); }
  if (data._hp) return json({ ok: true, message: 'Thanks.' }); // honeypot: pretend it worked
  if (!KINDS.has(data.kind)) return json({ error: 'Unknown form' }, 400);
  if (!data.email || !EMAIL.test(data.email)) return json({ error: 'Please check your email address' }, 400);
  if (env.TURNSTILE_SECRET) {
    const ok = await verifyTurnstile(env.TURNSTILE_SECRET, data['cf-turnstile-response'], request.headers.get('cf-connecting-ip'));
    if (!ok) return json({ error: 'Spam check failed. Please try again' }, 400);
  }
  const fields = Object.fromEntries(Object.entries(data).filter(([k]) => !k.startsWith('_') && k !== 'cf-turnstile-response'));
  const summary = Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join('\n');

  if (data.kind === 'request' && env.DB) {
    // Same shape as Experience and departures, so it imports straight into the Acceso engine later.
    await env.DB.prepare('CREATE TABLE IF NOT EXISTS booking_requests (id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL, experience TEXT, date TEXT, group_size INTEGER, name TEXT, email TEXT, phone TEXT, message TEXT, status TEXT DEFAULT "new", page TEXT)').run();
    await env.DB.prepare('INSERT INTO booking_requests (created_at, experience, date, group_size, name, email, phone, message, page) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(new Date().toISOString(), data.experience ?? null, data.date ?? null, Number(data.groupSize) || null, data.name ?? null, data.email, data.phone ?? null, data.message ?? null, data.page ?? null).run();
  }

  const ownerName = env.OWNER_FIRST_NAME || 'We';
  const responseTime = env.RESPONSE_TIME || '24 hours';
  const replies = {
    request: `Request received. ${ownerName} will confirm your spot and send payment details within ${responseTime}.`,
    contact: `Thanks for getting in touch. ${ownerName} will reply within ${responseTime}.`,
    'private-quote': `Thanks. ${ownerName} will come back with a quote within ${responseTime}.`,
    corporate: `Thanks. ${ownerName} will reply within ${responseTime}.`,
    'gift-voucher': `Thanks. ${ownerName} will send payment details and your voucher within ${responseTime}.`,
    brochure: `Here are the trip notes you asked for: ${new URL(request.url).origin}${data.file || ''}`,
    newsletter: 'Thanks, you are on the list.',
  };
  const subjectMap = { request: `Booking request: ${data.experience ?? ''} (${data.groupSize ?? '?'} walkers)`, contact: `Website message from ${data.name ?? data.email}`, 'private-quote': `Private quote: ${data.groupType ?? ''} of ${data.groupSize ?? '?'}`, corporate: `Corporate or school enquiry: ${data.organisation ?? ''}`, 'gift-voucher': `Gift voucher request from ${data.name ?? data.email}`, brochure: `Trip notes requested: ${data.experience ?? ''}`, newsletter: `Newsletter signup: ${data.email}` };
  const payment = data.kind === 'request' && env.PAYMENT_LINKS ? safeJson(env.PAYMENT_LINKS)?.[data.experience] : null;

  if (env.WEB3FORMS_KEY) {
    // Owner summary
    await sendMail(env.WEB3FORMS_KEY, { subject: subjectMap[data.kind] || 'Website form', from_name: data.site || 'Website', replyto: data.email, message: summary + (payment ? `\n\nPayment link slot for this experience (send after confirming): ${payment}` : '') });
    // Automatic reply to the sender
    if (env.AUTOREPLY !== 'off') await sendMail(env.WEB3FORMS_KEY, { subject: `Re: ${subjectMap[data.kind] || 'your message'}`, from_name: data.site || 'Website', to: data.email, message: replies[data.kind] });
  }
  return json({ ok: true, message: replies[data.kind] });
}

async function verifyTurnstile(secret, token, ip) {
  if (!token) return false;
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ secret, response: token, remoteip: ip }) });
  const j = await r.json().catch(() => ({}));
  return !!j.success;
}
async function sendMail(key, payload) {
  const r = await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify({ access_key: key, ...payload }) });
  if (!r.ok) throw new Error('Mail send failed');
}
const safeJson = (s) => { try { return JSON.parse(s); } catch { return null; } };
