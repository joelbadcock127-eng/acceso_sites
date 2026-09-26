// Shared form behaviour (A4d): inline validation, honeypot, Turnstile token,
// accessible success state, and preview mode that sends nothing anywhere.
export function initForms() {
  document.querySelectorAll<HTMLFormElement>('form[data-kit-form]').forEach((form) => {
    const preview = form.dataset.preview === 'true';
    const status = form.querySelector<HTMLElement>('[data-status]');
    const fields = Array.from(form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea'));
    const validate = (f: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => {
      const wrap = f.closest<HTMLElement>('.field'); if (!wrap) return true;
      const ok = f.checkValidity();
      if (ok) wrap.removeAttribute('data-invalid'); else wrap.setAttribute('data-invalid', '');
      return ok;
    };
    fields.forEach((f) => f.addEventListener('blur', () => validate(f)));
    // Conditional fields: [data-show-when="name=value"]
    form.querySelectorAll<HTMLElement>('[data-show-when]').forEach((el) => {
      const [name, value] = (el.dataset.showWhen || '').split('=');
      const src = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
      const apply = () => { el.hidden = !(src && src.value === value); };
      src?.addEventListener('change', apply); apply();
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const invalid = fields.filter((f) => !validate(f));
      if (invalid.length) { invalid[0].focus(); return; }
      const honey = form.querySelector<HTMLInputElement>('input[name="_hp"]');
      const say = (msg: string, ok = true) => { if (status) { status.textContent = msg; status.setAttribute('role', 'status'); status.dataset.state = ok ? 'ok' : 'error'; status.hidden = false; } };
      if (honey && honey.value) { say('Thanks, your message has been received.'); form.reset(); return; }
      if (preview) { say('Preview only. Once live, booking requests go straight to your inbox.'); return; }
      const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent || ''; btn.textContent = 'Sending…'; }
      try {
        const data = Object.fromEntries(new FormData(form).entries());
        const res = await fetch(form.action, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify({ ...data, page: location.pathname }) });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || 'Something went wrong');
        form.querySelectorAll<HTMLElement>('.field, .actions').forEach((x) => (x.hidden = true));
        say(form.dataset.success || body.message || 'Thanks, your message has been received.');
        status?.focus();
      } catch (err) {
        say((err as Error).message + '. Please try again, or email us directly.', false);
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || 'Send'; }
      }
    });
  });
}
