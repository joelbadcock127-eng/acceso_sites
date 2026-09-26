// Shared Cloudflare Pages Functions (A4d forms, A7 request log, the /requests
// owner page and the /admin editor). A site's functions/[[path]].js re-exports
// onRequest from here, so every site gets fixes in one commit.
import { handleForm } from './form.js';
import { handleRequests } from './requests.js';
import { handleAdmin } from './admin.js';

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const p = url.pathname;
  if (p === '/api/form') return handleForm(context);
  if (p === '/requests' || p.startsWith('/requests/')) return handleRequests(context);
  if (p === '/admin' || p.startsWith('/admin/') || p.startsWith('/api/admin/')) return handleAdmin(context);
  return context.next();
}
