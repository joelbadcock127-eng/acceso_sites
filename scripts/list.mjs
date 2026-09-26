// "List sites": sites.json as a table, flagging sent previews past deleteAfter.
import { readRegistry } from './lib/site.mjs';
const today = new Date().toISOString().slice(0, 10);
const rows = readRegistry().map((s) => ({ slug: s.slug, business: s.business, status: s.status, archetype: s.archetype ?? '', group: s.bookingGroup ?? '', preview: s.previewUrl ?? '', domain: s.domain ?? '', sentOn: s.sentOn ?? '', deleteAfter: s.deleteAfter ?? '', flag: s.status === 'sent' && s.deleteAfter && s.deleteAfter < today ? 'PAST DELETE DATE' : '' }));
console.table(rows);
const overdue = rows.filter((r) => r.flag);
if (overdue.length) console.log(`\n${overdue.length} preview(s) past their delete date: ${overdue.map((r) => r.slug).join(', ')}. Run kill.mjs for each.`);
