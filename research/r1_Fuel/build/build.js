// Builds report.html from ../README.md, inserting charts, diagrams and photos,
// then prints it to ../Bangladesh_Fuel_Hike_Impact_2026.pdf with headless Chrome.
// Usage: node build/build.js
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const K = require('./charts.js');

const ROOT = path.resolve(__dirname, '..');
const md = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
const credits = JSON.parse(fs.readFileSync(path.join(__dirname, 'img/credits.json'), 'utf8'));
const { C } = K;

/* ───────── minimal markdown → HTML (covers what README.md uses) ───────── */
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function inline(s) {
  s = esc(s);
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  s = s.replace(/\*\*\[est\.?([^\]]*)\]\*\*/g, '<span class="est">est.$1</span>');
  s = s.replace(/\[est\.([^\]]*)\]/g, '<span class="est">est.$1</span>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<em>$2</em>');
  s = s.replace(/ ✓/g, ' <span class="ok">✓</span>');
  return s;
}
function slug(t) { return t.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

function mdToBlocks(src) {
  const L = src.split('\n'), out = [];
  let i = 0;
  while (i < L.length) {
    const l = L[i];
    if (/^```/.test(l)) { const b = []; i++; while (i < L.length && !/^```/.test(L[i])) b.push(L[i++]); i++; out.push({ t: 'code', v: b.join('\n') }); continue; }
    const h = l.match(/^(#{1,4})\s+(.*)$/);
    if (h) { out.push({ t: 'h', n: h[1].length, v: h[2] }); i++; continue; }
    if (/^---\s*$/.test(l)) { out.push({ t: 'hr' }); i++; continue; }
    if (/^\|/.test(l)) {
      const rows = []; while (i < L.length && /^\|/.test(L[i])) rows.push(L[i++]);
      const cells = r => r.replace(/^\||\|\s*$/g, '').split('|').map(c => c.trim());
      out.push({ t: 'table', head: cells(rows[0]), body: rows.slice(2).map(cells) }); continue;
    }
    if (/^\s*(-|\d+\.)\s+/.test(l)) {
      const ordered = /^\s*\d+\./.test(l), items = [];
      while (i < L.length && /^\s*(-|\d+\.)\s+/.test(L[i])) {
        let it = L[i++].replace(/^\s*(-|\d+\.)\s+/, '');
        while (i < L.length && /^\s{2,}\S/.test(L[i]) && !/^\s*(-|\d+\.)\s+/.test(L[i])) it += ' ' + L[i++].trim();
        items.push(it);
      }
      out.push({ t: ordered ? 'ol' : 'ul', items }); continue;
    }
    if (!l.trim()) { i++; continue; }
    const p = []; while (i < L.length && L[i].trim() && !/^(#|\||```|---\s*$|\s*(-|\d+\.)\s)/.test(L[i])) p.push(L[i++]);
    out.push({ t: 'p', v: p.join(' ') });
  }
  return out;
}

/* ───────── figures and where they go ───────── */
let figN = 0;
const fig = (svg, title, note, cls = '') => {
  figN++;
  return `<figure class="chart ${cls}"><figcaption><span class="fn">Figure ${figN}</span>${title}</figcaption>${svg}${note ? `<p class="fnote">${note}</p>` : ''}</figure>`;
};
const photo = (file, caption, cls = '') => {
  const c = credits[file];
  return `<figure class="photo ${cls}"><img src="img/${file}" alt="${esc(caption)}"><figcaption>${caption}<span class="credit">Photo: ${esc(c.artist)} · ${esc(c.license)} · Wikimedia Commons</span></figcaption></figure>`;
};

// keyed by the heading text that the figure should follow (after that heading's first paragraph/table)
const AFTER = {
  '1. What actually happened': { afterBlocks: 1, html: () =>
    fig(K.chartPricePath(), 'Retail fuel prices, Tk per litre, 2026',
      'Source: BPC gazettes as reported by The Daily Star and TBS. The shaded span marks the months when the monthly pricing formula was not applied.') },
  '2. Where Bangladesh now sits on the affordability map': { afterBlocks: 4, html: () =>
    fig(K.chartAffordability(), 'Cost of 50 L of octane (Tk 8,250) as a share of monthly income',
      'This report’s calculation from the income figures in the table above.') +
    fig(K.chartGlobal(), 'A 50 L tank as a share of average monthly income, selected countries',
      'The other countries’ figures come from the earlier comparison. Bangladesh uses Tk 165 octane against the Tk 18,000 average gross salary. The dashed outline shows the earlier estimate of 31%.') },
  '3. Why this hike is *incomplete* — the most important forward-looking fact': { afterBlocks: 2, html: () =>
    fig(K.chartBpcGap(), 'Diesel: what the government set, what BPC’s formula required, and the duty inside the price',
      'Sources: BPC proposal as reported by The Daily Star (Sept 2026); duty figure for August 2026.') },
  '4. Transmission, channel by channel': { afterBlocks: 0, html: () =>
    fig(K.diagramTransmission(), 'How each fuel reaches the economy', 'Octane and petrol are left out on purpose. They matter for the headline, not for the transmission.') },
  '4a. Inflation — expect the easing to reverse within 6 weeks': { afterBlocks: 3, html: () =>
    fig(K.chartInflation(), 'From 8.26% in August to an estimated 9.6–10.7% by December–January') },
  '4c. Food and the Boro time bomb — the effect is mostly *ahead of us*': { afterBlocks: 1, html: () =>
    photo('irrigation.jpg', 'Pump-fed irrigation in Cumilla. About 70% of Bangladesh’s irrigation pumps run on diesel, and peak Boro irrigation falls in December–March.', 'half') },
  '4d. Industry, RMG, and the LDC collision': { afterBlocks: 0, html: () =>
    photo('rmg.jpg', 'Garment workers leaving a factory at break. The RMG minimum wage has stayed at Tk 12,500 since December 2023.', 'half right') },
  '4e. Power: the autorickshaw feedback loop': { afterBlocks: 0, html: () =>
    photo('traffic.jpg', 'Rickshaw traffic in Hatirpool, Dhaka. Battery conversions of this fleet are how low-income households keep moving through the petrol shock.', 'wide') },
  '4e. Power: the autorickshaw feedback loop#wedge': { html: () =>
    fig(K.chartPerKm(), 'Energy cost per kilometre, by vehicle', 'This report’s estimates. The metered range assumes 100–110 km/day.') },
  '4e. Power: the autorickshaw feedback loop#loop': { html: () =>
    fig(K.diagramLoop(), 'The reinforcing loop: fuel hike → e-rickshaws → grid → oil-fired backup → next hike') },
  '5. The distributional wedge: the pay scale and the pump': { afterBlocks: 4, html: () =>
    fig(K.chartWages(), 'Government pay, consumer prices and the RMG minimum wage, index Dec 2023 = 100',
      'Price index is approximate cumulative CPI. Government line is the grade-20 basic under the phased 2026 award.') },
  '6. What to watch, and when': { afterBlocks: 0, html: () =>
    fig(K.diagramTimeline(), 'The next six months') }
};

/* ───────── render blocks ───────── */
function render(blocks) {
  let html = '', cur = null, since = 0, pending = null;
  const flush = () => { if (pending) { html += pending(); pending = null; } };
  blocks.forEach((b, idx) => {
    if (b.t === 'h') {
      flush();
      if (b.n === 1) return; // title goes on the cover
      cur = b.v; since = 0;
      const tag = 'h' + Math.min(b.n, 4);
      const cls = b.n === 2 ? ' class="sec"' : '';
      if (cur === 'Sources') { html += `<section class="sources"><h2 id="sources">Sources</h2>`; return; }
      html += `<${tag}${cls} id="${slug(b.v)}">${inline(b.v)}</${tag}>`;
      const a = AFTER[cur];
      if (a) { if (a.afterBlocks === 0) html += a.html(); else pending = a.html; }
      return;
    }
    if (b.t === 'hr') return;
    if (b.t === 'p') {
      // special in-section anchors
      if (cur && cur.startsWith('4e') && /^\*\*The operating-cost wedge/.test(b.v)) { html += `<p>${inline(b.v)}</p>` + AFTER[cur + '#wedge'].html(); since++; return; }
      if (cur && cur.startsWith('4e') && /^\*\*The loop:\*\*/.test(b.v)) { html += `<p>${inline(b.v)}</p>`; since++; return; }
      if (/^\*\(Work-time/.test(b.v)) { html += `<p class="small">${inline(b.v)}</p>`; since++; }
      else if (/^\*\*Event:\*\*/.test(b.v)) return; // on cover
      else { html += `<p>${inline(b.v)}</p>`; since++; }
    }
    if (b.t === 'code') {
      if (cur && cur.startsWith('4e')) { html += AFTER[cur + '#loop'].html(); since++; return; }
      html += `<pre>${esc(b.v)}</pre>`; since++;
    }
    if (b.t === 'table') {
      html += `<table><thead><tr>${b.head.map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${b.body.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`; since++;
    }
    if (b.t === 'ul' || b.t === 'ol') {
      html += `<${b.t}>${b.items.map(it => `<li>${inline(it)}</li>`).join('')}</${b.t}>`; since++;
    }
    if (pending && AFTER[cur] && since >= AFTER[cur].afterBlocks) flush();
  });
  flush();
  html += '</section>';
  return html;
}

const blocks = mdToBlocks(md);
const body = render(blocks);

const photoCredits = Object.entries(credits).map(([f, c]) =>
  `<li>${esc(c.title.replace(/^File:/, ''))} by ${esc(c.artist)}, ${esc(c.license)}. <a href="${c.page}">${esc(c.page)}</a></li>`).join('');

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Bangladesh Fuel Price Hike: Impact Analysis</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap" rel="stylesheet">
<style>
@page { size: A4; margin: 18mm 17mm 18mm 17mm; }
@page :first { margin: 0; }
:root { --ink:${C.ink}; --ink2:${C.ink2}; --ink3:${C.ink3}; --rule:${C.rule}; --grid:${C.grid}; --panel:${C.panel}; --accent:${C.s1}; --crit:${C.crit}; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin:0; background:#fff; color:var(--ink); font: 10.2pt/1.52 'Source Serif 4', Georgia, serif; }
svg { font-family: Inter, system-ui, sans-serif; width:100%; height:auto; display:block; }
h2,h3,h4,table,figcaption,.fnote,.est,.cover,.toc,.kpis,.credit,.small { font-family: Inter, system-ui, sans-serif; }
h2.sec { font-size:17pt; font-weight:800; letter-spacing:-0.01em; margin:0 0 10pt; padding-top:4pt; break-before:page; border-top:3px solid var(--ink); padding-top:10pt; }
h3 { font-size:11.6pt; font-weight:700; margin:16pt 0 5pt; break-after:avoid; }
h4 { font-size:10.5pt; margin:12pt 0 4pt; break-after:avoid; }
p { margin:0 0 7pt; orphans:3; widows:3; }
strong { font-weight:600; }
a { color:var(--accent); text-decoration:none; }
ul,ol { margin:0 0 8pt; padding-left:16pt; } li { margin-bottom:3pt; }
.est { font-size:7pt; font-weight:600; color:var(--ink3); border:1px solid var(--rule); border-radius:3px; padding:0 3px; vertical-align:1px; white-space:nowrap; }
.ok { color:${C.good}; font-weight:700; }
table { width:100%; border-collapse:collapse; font-size:8.4pt; margin:6pt 0 10pt; break-inside:avoid; font-variant-numeric: tabular-nums; }
th { text-align:left; font-weight:600; color:var(--ink2); border-bottom:1.5px solid var(--ink); padding:4pt 6pt; }
td { border-bottom:1px solid var(--grid); padding:4pt 6pt; vertical-align:top; }
tbody tr:nth-child(even) td { background:#fafaf8; }
pre { font-size:8pt; background:var(--panel); padding:8pt; border-radius:4pt; }
figure { margin:12pt 0 14pt; break-inside:avoid; }
figure.chart figcaption { font-size:9.6pt; font-weight:700; margin-bottom:6pt; color:var(--ink); }
.fn { display:inline-block; font-size:7.4pt; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:var(--accent); margin-right:7pt; }
.fnote { font-size:7.6pt; color:var(--ink3); margin:5pt 0 0; font-family:Inter, sans-serif; line-height:1.4; }
figure.photo img { width:100%; display:block; border-radius:3pt; object-fit:cover; }
figure.photo figcaption { font-size:8pt; color:var(--ink2); margin-top:5pt; line-height:1.4; }
.credit { display:block; font-size:6.8pt; color:var(--ink3); margin-top:2pt; }
figure.photo.wide img { height:62mm; }
figure.photo:not(.half):not(.wide) img { height:70mm; }
figure.photo.half { float:left; width:46%; margin:2pt 14pt 8pt 0; }
figure.photo.half.right { float:right; margin:2pt 0 8pt 14pt; }
figure.photo.half img { height:62mm; }
h2.sec, h3 { clear:both; }
.small { font-size:8pt; color:var(--ink3); }
/* cover */
.cover { height:297mm; width:210mm; background:#0f1a2b; color:#fff; position:relative; overflow:hidden; break-after:page; }
.cover .bg { position:absolute; inset:0; background:url(img/pump.jpg) center/cover; opacity:0.20; filter:grayscale(0.4); }
.cover .in { position:relative; padding:26mm 20mm 0; }
.cover .kick { font-size:9pt; letter-spacing:0.16em; text-transform:uppercase; color:#7fb0ea; font-weight:700; }
.cover h1 { font-size:36pt; line-height:1.05; letter-spacing:-0.02em; margin:10pt 0 12pt; font-weight:800; }
.cover .dek { font: 13pt/1.45 'Source Serif 4', serif; color:#d9dde5; max-width:150mm; }
.cover .hero { margin:14mm 0 0; }
.cover .kpis { position:absolute; left:20mm; right:20mm; bottom:34mm; display:grid; grid-template-columns:repeat(4,1fr); gap:8mm; border-top:1px solid rgba(255,255,255,0.25); padding-top:7mm; }
.cover .kpi b { display:block; font-size:22pt; font-weight:800; letter-spacing:-0.02em; }
.cover .kpi span { font-size:8pt; color:#b9c0cc; line-height:1.35; display:block; margin-top:3pt; }
.cover .meta { position:absolute; left:20mm; right:20mm; bottom:14mm; font-size:8pt; color:#9aa3b2; display:flex; justify-content:space-between; }
/* summary box */
.box { background:var(--panel); border-left:3px solid var(--accent); padding:10pt 12pt; margin:0 0 14pt; break-inside:avoid; }
.box h3 { margin-top:0; }
.toc { font-size:9pt; columns:2; column-gap:10mm; margin:4pt 0 0; padding:0; list-style:none; }
.toc li { margin:0 0 3pt; }
.sources li { font-size:8pt; margin-bottom:2pt; line-height:1.35; }
.sources a { word-break:break-word; }
.sources h3 { font-size:9.5pt; margin:10pt 0 3pt; }
.sources p { margin:10pt 0 3pt; font-family:Inter,sans-serif; font-size:9pt; }
</style></head><body>

<section class="cover">
  <div class="bg"></div>
  <div class="in">
    <div class="kick">Impact analysis · 21 September 2026</div>
    <h1>Bangladesh’s Tk 20 fuel hike: who pays, and what comes next</h1>
    <div class="dek">Diesel is up 35% and octane 37.5% since March, and BPC’s own formula says diesel is still Tk 52 short. This report covers affordability, inflation, food, industry, the grid, and the gap between public-sector and private wages.</div>
    <div class="hero">${K.coverHero()}</div>
  </div>
  <div class="kpis">
    <div class="kpi"><b>Tk 165</b><span>octane per litre, up from Tk 120 in March</span></div>
    <div class="kpi"><b>45.8%</b><span>of the average monthly salary buys one 50 L tank</span></div>
    <div class="kpi"><b>27.8%</b><span>of the diesel cost gap closed by this hike</span></div>
    <div class="kpi"><b>9.6–10.7%</b><span>estimated inflation by Dec–Jan, from 8.26%</span></div>
  </div>
  <div class="meta"><span>Research pass 1 · figures marked “est.” are this report’s own calculations</span><span>Sources and photo credits at the end</span></div>
</section>

<div class="box">
  <h3>The short version</h3>
  <ul>
    <li><strong>The hike is incomplete.</strong> The flat Tk 20 over-recovers on petrol, octane and kerosene but closes only about a quarter of the diesel gap. BPC may run out of money for letters of credit in October, so a second hike or a duty cut before the end of 2026 is near-certain.</li>
    <li><strong>The octane headline is the wrong lens.</strong> The real transmission runs through diesel (freight, buses, irrigation, generators), kerosene (the poorest households) and furnace oil (the grid).</li>
    <li><strong>The biggest delayed risk is Boro rice.</strong> Irrigation costs up about Tk 2,140 crore since March, with a frozen procurement price, point to pressure on the 2027 harvest.</li>
    <li><strong>The e-rickshaw surge and the load shedding form one loop,</strong> and the hike tightens it.</li>
    <li><strong>The distributional wedge.</strong> Public pay rose up to 142% two days before the hike, while the RMG minimum wage has not changed since 2023.</li>
    <li><strong>The unused lever.</strong> Tk 32.44/L of duty is still inside the diesel price. Removing it would close 62% of the remaining gap without raising the pump price.</li>
  </ul>
  <ol class="toc">
    ${blocks.filter(b => b.t === 'h' && b.n === 2).map(b => `<li><a href="#${slug(b.v)}">${inline(b.v)}</a></li>`).join('')}
    <li><a href="#photo-credits">Photo credits</a></li>
  </ol>
</div>
${photo('pump.jpg', 'A Padma Oil filling station in Bangladesh during a fuel shortage. Queues of motorcycles are the most visible sign of the shock, and motorcycles are what the octane headline actually describes.')}

${body}

<section class="sources"><h3 id="photo-credits">Photo credits</h3><ul>${photoCredits}</ul>
<p class="small">The full search log, fetched-page notes, consolidated data tables and derivations are in <code>reseach_pass_1.md</code> in the repository.</p></section>
</body></html>`;

const out = path.join(__dirname, 'report.html');
fs.writeFileSync(out, html);
console.log('wrote', out, (html.length / 1024).toFixed(0) + 'KB', 'figures:', figN);

if (process.argv.includes('--no-pdf')) process.exit(0);
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const pdf = path.join(ROOT, 'Bangladesh_Fuel_Hike_Impact_2026.pdf');
execFileSync(chrome, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--virtual-time-budget=15000',
  '--run-all-compositor-stages-before-draw', `--print-to-pdf=${pdf}`, 'file://' + out], { stdio: 'inherit' });
console.log('wrote', pdf, (fs.statSync(pdf).size / 1024).toFixed(0) + 'KB');
