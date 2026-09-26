// pdf_text.mjs {file.pdf} [...]: plain text from PDFs found during intake (brochures, T&Cs, itineraries).
import { readFileSync, writeFileSync } from 'node:fs';
const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
for (const f of process.argv.slice(2)) {
  const doc = await getDocument({ data: new Uint8Array(readFileSync(f)), useSystemFonts: true }).promise;
  let out = '';
  for (let i = 1; i <= doc.numPages; i++) { const page = await doc.getPage(i); const tc = await page.getTextContent(); let last = null; for (const it of tc.items) { if (last && Math.abs(last - it.transform[5]) > 2) out += '\n'; out += it.str + (it.hasEOL ? '\n' : ' '); last = it.transform[5]; } out += '\n\n'; }
  writeFileSync(f.replace(/\.pdf$/i, '.txt'), out); console.log(f, doc.numPages, 'pages', out.length, 'chars');
}
