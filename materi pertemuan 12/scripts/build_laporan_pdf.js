#!/usr/bin/env node
/**
 * Membangun docs/LAPORAN_QA_API.pdf dari docs/LAPORAN_QA_API.md.
 *
 * Tidak ada dependensi baru pada proyek: puppeteer-core dipasang lokal di
 * .qa_tools/ (diabaikan Git) dan memakai Microsoft Edge yang sudah terpasang.
 *
 * Pakai:  node scripts/build_laporan_pdf.js [--html-only]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MD_PATH = path.join(ROOT, 'docs', 'LAPORAN_QA_API.md');
const PDF_PATH = path.join(ROOT, 'docs', 'LAPORAN_QA_API.pdf');
const HTML_PATH = path.join(ROOT, '.qa_tools', 'laporan_preview.html');

const EDGE_CANDIDATES = [
  process.env.EDGE_PATH,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/microsoft-edge',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
].filter(Boolean);

/* ------------------------------------------------------------------ inline */

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function inline(text) {
  const codes = [];
  let out = escapeHtml(text).replace(/`([^`]+)`/g, (_, code) => {
    codes.push(`<code>${code}</code>`);
    return `\u0000${codes.length - 1}\u0000`;
  });

  out = out
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s.,;:)]|$)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2">$1</a>');

  return out.replace(/\u0000(\d+)\u0000/g, (_, i) => codes[Number(i)]);
}

const slug = (text) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* ------------------------------------------------------------------ blocks */

function splitRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);

  const cells = [];
  let buf = '';
  let inCode = false;
  for (const ch of s) {
    if (ch === '`') inCode = !inCode;
    if (ch === '|' && !inCode) {
      cells.push(buf.trim());
      buf = '';
    } else {
      buf += ch;
    }
  }
  cells.push(buf.trim());
  return cells;
}

const isBlockStart = (line) =>
  /^(#{2,6}\s|\||>\s?|```|---+\s*$|\s*[-*]\s+|\s*\d+\.\s+)/.test(line);

function renderBlocks(lines) {
  const out = [];
  let i = 0;
  let firstH2 = true;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    let m = line.match(/^(#{2,6})\s+(.*)$/);
    if (m) {
      const level = m[1].length;
      const text = m[2].trim();
      const cls = level === 2
        ? (firstH2 ? ' class="first"' : /^16\.\s/.test(text) ? ' class="newpage"' : '')
        : '';
      if (level === 2) firstH2 = false;
      out.push(`<h${level}${cls} id="${slug(text)}">${inline(text)}</h${level}>`);
      i++;
      continue;
    }

    if (/^---+\s*$/.test(line)) { out.push('<hr>'); i++; continue; }

    if (/^```/.test(line)) {
      i++;
      const buf = [];
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++;
      out.push(`<pre><code>${escapeHtml(buf.join('\n'))}</code></pre>`);
      continue;
    }

    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      out.push(`<blockquote>${renderBlocks(buf)}</blockquote>`);
      continue;
    }

    if (/^\|/.test(line) && i + 1 < lines.length && /^\|[\s:|-]+\|?\s*$/.test(lines[i + 1])) {
      const head = splitRow(line);
      const align = splitRow(lines[i + 1]).map((c) =>
        /^:-+:$/.test(c) ? 'center' : /-+:$/.test(c) ? 'right' : 'left');
      i += 2;

      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) { rows.push(splitRow(lines[i])); i++; }

      const colStyle = (n) =>
        align[n] && align[n] !== 'left' ? ` style="text-align:${align[n]}"` : '';

      const thead = head
        .map((c, n) => `<th${colStyle(n)}>${inline(c)}</th>`)
        .join('');
      const tbody = rows
        .map((r) => `<tr>${head
          .map((_, n) => `<td${colStyle(n)}>${inline(r[n] || '')}</td>`)
          .join('')}</tr>`)
        .join('');

      out.push(
        `<table class="cols-${head.length}"><thead><tr>${thead}</tr></thead>` +
        `<tbody>${tbody}</tbody></table>`);
      continue;
    }

    m = line.match(/^\s*([-*])\s+(.*)$/);
    if (m) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      out.push(`<ul>${items.map((t) => `<li>${inline(t)}</li>`).join('')}</ul>`);
      continue;
    }

    m = line.match(/^\s*(\d+)\.\s+(.*)$/);
    if (m) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      out.push(`<ol>${items.map((t) => `<li>${inline(t)}</li>`).join('')}</ol>`);
      continue;
    }

    const para = [];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
      para.push(lines[i].trim());
      i++;
    }
    out.push(`<p>${inline(para.join(' '))}</p>`);
  }

  return out.join('\n');
}

/* ------------------------------------------------------------------- build */

const md = fs.readFileSync(MD_PATH, 'utf8').replace(/\r\n/g, '\n');
const allLines = md.split('\n');

const ruleIndex = allLines.findIndex((l) => /^---+\s*$/.test(l));
const coverLines = allLines.slice(0, ruleIndex);
const bodyLines = allLines.slice(ruleIndex + 1);

const title = (coverLines.find((l) => /^#\s/.test(l)) || '# -').slice(2).trim();
const subtitle = (coverLines.find((l) => /^##\s/.test(l)) || '## -').slice(3).trim();
const subjectLine = (coverLines.find((l) => /^###\s/.test(l)) || '### -').slice(4).trim();

const bodyHtml = renderBlocks(bodyLines);

const toc = [...bodyLines.join('\n').matchAll(/^##\s+(.*)$/gm)]
  .map((m) => m[1].trim())
  .filter((t) => !/^Lampiran/.test(t))
  .map((t) => `<li><a href="#${slug(t)}">${inline(t)}</a></li>`)
  .join('\n');

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>${escapeHtml(subjectLine.replace(/`/g, ''))}</title>
<style>
  @page { size: A4; margin: 20mm 17mm 18mm 17mm; }

  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    font-family: "Calibri", "Segoe UI", Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.45;
    color: #000000;
    margin: 0;
    hyphens: none;
  }

  /* ---------------------------------------------------------------- cover */
  .cover {
    page-break-after: always;
    padding-top: 26mm;
    text-align: center;
  }
  .cover .rule-top {
    border-top: 3px solid #14395e;
    width: 46mm;
    margin: 0 auto 14mm;
  }
  .cover h1 {
    font-size: 22pt;
    letter-spacing: .6pt;
    line-height: 1.25;
    color: #000000;
    margin: 0 0 6mm;
    font-weight: 700;
  }
  .cover .sub {
    text-align: center;
    font-size: 13pt;
    color: #000000;
    margin: 0 auto 4mm;
    max-width: 132mm;
    line-height: 1.4;
  }
  .cover .subject {
    text-align: center;
    font-size: 11.5pt;
    color: #000000;
    margin: 0 auto 22mm;
    max-width: 132mm;
  }
  .cover .subject code { font-size: 10.5pt; background: none; color: #000000; }
  .cover table {
    margin: 0 auto;
    width: 122mm;
    font-size: 9.5pt;
    border: 1px solid #b9c6d2;
  }
  .cover table th, .cover table td {
    border: 1px solid #cfd8e0;
    padding: 3px 6px;
    text-align: left;
    vertical-align: top;
  }
  .cover table th {
    width: 34mm;
    background: #eef2f7;
    font-weight: 600;
    color: #000000;
  }

  /* ------------------------------------------------------------------ toc */
  .toc { page-break-after: always; }
  .toc h2 {
    page-break-before: auto;
    font-size: 14pt;
    border-bottom: 1.5px solid #14395e;
    padding-bottom: 2mm;
  }
  .toc ol { list-style: none; padding-left: 0; margin-top: 6mm; }
  .toc li {
    margin: 0 0 2.2mm;
    font-size: 10.5pt;
    border-bottom: 1px dotted #c8d2dc;
    padding-bottom: 1.2mm;
  }
  .toc a { color: #000000; text-decoration: none; }

  /* ------------------------------------------------------------- headings */
  h2 {
    font-size: 14pt;
    color: #000000;
    border-bottom: 1.5px solid #14395e;
    padding-bottom: 1.8mm;
    margin: 0 0 4mm;
    page-break-after: avoid;
  }
  h2.first { page-break-before: auto; }
  h2.newpage { page-break-before: always; }
  h3 {
    font-size: 11.5pt;
    color: #000000;
    margin: 6mm 0 2mm;
    page-break-after: avoid;
  }

  p { margin: 0 0 2.6mm; text-align: justify; }
  strong { color: #000000; }

  /* --------------------------------------------------------------- tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 2mm 0 4mm;
    font-size: 8.8pt;
    line-height: 1.3;
  }
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; }
  th, td {
    border: 0.6pt solid #a9b6c2;
    padding: 2px 4px;
    text-align: left;
    vertical-align: top;
    overflow-wrap: break-word;
  }
  th { background: #e7edf3; color: #000000; font-weight: 600; }
  tbody tr:nth-child(even) td { background: #f7f9fb; }
  table.cols-6, table.cols-7 { font-size: 8pt; }

  /* --------------------------------------------------------- code, quotes */
  pre {
    background: #f4f6f8;
    border-left: 2.5pt solid #8ba3b8;
    padding: 2.6mm 3mm;
    margin: 2mm 0 3.5mm;
    font-size: 8.5pt;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  code {
    font-family: "Consolas", "Courier New", monospace;
    font-size: 8.8pt;
    background: #f1f3f5;
    padding: 0 1.2pt;
  }
  pre code { background: none; padding: 0; font-size: 8.4pt; }

  blockquote {
    margin: 2mm 0 3.5mm;
    padding: 2mm 3mm 1pt;
    border-left: 2.5pt solid #8ba3b8;
    background: #f7f9fb;
    color: #000000;
    font-style: italic;
  }

  ul, ol { margin: 0 0 3mm; padding-left: 6mm; }
  li { margin-bottom: 1.2mm; }

  hr { border: none; border-top: 0.6pt solid #cfd8e0; margin: 4mm 0; }
  a { color: #000000; }
</style>
</head>
<body>

<section class="cover">
  <div class="rule-top"></div>
  <h1>${inline(title)}</h1>
  <p class="sub">${inline(subtitle).replace(/29119-(\d)/g, '29119&#8209;$1')}</p>
  <p class="subject">${inline(subjectLine)}</p>
  <table>
    <tr><th>Objek uji</th><td>Website Balai Penilaian Kompetensi — https://www.balaipensi.my.id</td></tr>
    <tr><th>Metode</th><td>Black-Box Testing pada lapisan API, Keyword-Driven Testing</td></tr>
    <tr><th>Alat</th><td>Postman 11, Newman 6.2.3</td></tr>
    <tr><th>Tanggal</th><td>24 November 2026</td></tr>
    <tr><th>Versi / status</th><td>1.0 — Draf</td></tr>
    <tr><th>Acuan</th><td>ISO/IEC/IEEE 29119-5:2024; ISO/IEC/IEEE 29119-1:2022; ISO/IEC 25010:2023; ISO/IEC 27001:2022</td></tr>
  </table>
</section>

<section class="toc">
  <h2 style="page-break-before:auto">Daftar Isi</h2>
  <ol>
${toc}
  </ol>
</section>

${bodyHtml}

</body>
</html>
`;

fs.writeFileSync(HTML_PATH, html, 'utf8');

/* -------------------------------------------------------------------- pdf */

(async () => {
  if (process.argv.includes('--html-only')) {
    console.log('HTML ditulis:', HTML_PATH);
    return;
  }

  const puppeteer = require(path.join(ROOT, '.qa_tools', 'node_modules', 'puppeteer-core'));
  const executablePath = EDGE_CANDIDATES.find((p) => fs.existsSync(p));
  if (!executablePath) {
    throw new Error('Microsoft Edge/Chromium tidak ditemukan. Set EDGE_PATH.');
  }

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--allow-file-access-from-files'],
  });

  try {
    const page = await browser.newPage();
    await page.goto('file:///' + HTML_PATH.replace(/\\/g, '/'), { waitUntil: 'load' });

    const overflow = await page.evaluate(() => {
      const bad = [];
      for (const el of document.querySelectorAll('body *')) {
        if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0 && el.tagName !== 'PRE') {
          bad.push(el.tagName + '.' + (el.className || '') + ' +' + (el.scrollWidth - el.clientWidth) + 'px');
        }
      }
      return { width: document.documentElement.scrollWidth, bad: bad.slice(0, 10) };
    });

    const footer = `
      <div style="width:100%;font-family:Calibri,Arial,sans-serif;font-size:7.5pt;color:#000000;padding:0 17mm;display:flex;justify-content:space-between;">
        <span>Dokumentasi Pengujian API — Balai Penilaian Kompetensi</span>
        <span>Halaman <span class="pageNumber"></span> dari <span class="totalPages"></span></span>
      </div>`;
    const header = `
      <div style="width:100%;font-family:Calibri,Arial,sans-serif;font-size:7.5pt;color:#000000;padding:0 17mm;display:flex;justify-content:space-between;">
        <span>ISO/IEC/IEEE 29119-5 — Keyword-Driven Testing</span>
        <span>v1.0 · 24 November 2026</span>
      </div>`;

    await page.pdf({
      path: PDF_PATH,
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: header,
      footerTemplate: footer,
      margin: { top: '20mm', bottom: '18mm', left: '17mm', right: '17mm' },
    });

    const buf = fs.readFileSync(PDF_PATH);
    const pages = (buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
    console.log('PDF      :', PDF_PATH);
    console.log('Ukuran   :', (buf.length / 1024).toFixed(0) + ' KB');
    console.log('Halaman  :', pages);
    console.log('Lebar doc:', overflow.width, 'px (A4 @96dpi ≈ 794 px)');
    console.log('Overflow :', overflow.bad.length ? overflow.bad.join(', ') : 'tidak ada');
  } finally {
    await browser.close();
  }
})().catch((err) => {
  console.error('Gagal membangun PDF:', err.message);
  process.exit(1);
});
