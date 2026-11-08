'use strict';

/* Shared page chrome for the r1_Fuel research site. */

const SITE = {
  base: '/research/r1_Fuel/',
  origin: 'https://www.blankframe.tech',
  contact: 'hello@blankframe.tech',
  updated: '21 September 2026',
};

const NAV = [
  { href: '/research/r1_Fuel/',             label: 'Overview',     id: 'home' },
  { href: '/research/r1_Fuel/findings/',    label: 'The analysis', id: 'findings' },
  { href: '/research/r1_Fuel/proposal/',    label: 'Research plan',id: 'proposal' },
  { href: '/research/r1_Fuel/collaborate/', label: 'Collaborate',  id: 'collaborate' },
  { href: '/research/r1_Fuel/support/',     label: 'Funding',      id: 'support' },
  { href: '/research/r1_Fuel/data/',        label: 'Data & method',id: 'data' },
  { href: '/research/r1_Fuel/status/',      label: 'Status',       id: 'status' },
];

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E" +
  "%3Crect width='100' height='100' rx='24' fill='%231B365D'/%3E" +
  "%3Crect x='28' y='28' width='44' height='44' fill='none' stroke='%23FFFFFF' stroke-width='7'/%3E%3C/svg%3E";

/** Depth-aware asset path so the stylesheet resolves from any route. */
function assetPath(depth) {
  return (depth ? '../'.repeat(depth) : './') + 'assets/site.css';
}

function nav(active, depth) {
  const links = NAV.map(
    (n) =>
      `      <a href="${n.href}"${n.id === active ? ' class="active" aria-current="page"' : ''}>${n.label}</a>`
  ).join('\n');
  return `<div class="nav-shell">
  <div class="nav-inner">
    <a class="nav-brand" href="/research/r1_Fuel/">
      <span class="mark" aria-hidden="true"></span>
      <span>r1_Fuel</span>
      <span class="sub">BlankFrame Research</span>
    </a>
    <nav class="nav-links" aria-label="Sections">
${links}
    </nav>
  </div>
</div>`;
}

function footer() {
  return `<footer>
  <div class="wrap">
    <div class="fgrid">
      <div>
        <div style="font-family:'Inter Tight',sans-serif;font-weight:700;letter-spacing:-0.03em;color:var(--ink);font-size:17px;">r1_Fuel</div>
        <div class="small" style="margin-top:6px;">An open research programme on Bangladesh's 2026 fuel shock.</div>
        <div class="small" style="margin-top:6px;">Analysis dated ${SITE.updated}.</div>
      </div>
      <div class="flinks">
        <a href="/research/r1_Fuel/findings/">The analysis</a>
        <a href="/research/r1_Fuel/proposal/">Research plan</a>
        <a href="/research/r1_Fuel/collaborate/">Collaborate</a>
        <a href="/research/r1_Fuel/support/">Funding</a>
        <a href="/research/r1_Fuel/data/">Data &amp; method</a>
        <a href="/research/r1_Fuel/data/log/">Audit log</a>
        <a href="mailto:${SITE.contact}?subject=r1_Fuel">Email</a>
        <a href="/">BlankFrame</a>
        <a href="/privacy/">Privacy</a>
      </div>
    </div>
    <p class="fnote">
      Figures marked <span class="est">est.</span> are this project's own calculations from cited inputs, with the
      method shown inline; everything else is sourced and linked. Nothing here is peer-reviewed. Corrections are
      welcome and will be logged &mdash; email
      <a href="mailto:${SITE.contact}?subject=r1_Fuel%20correction">${SITE.contact}</a>.
    </p>
  </div>
</footer>`;
}

/** Dated correction notice for pages that carried the withdrawn claims. */
const CORRECTION = `<aside class="callout" role="note" style="margin:24px 0;">
  <span class="k">Correction &middot; 8 November 2026</span>
  After publication on 21 September, the figures in this analysis were checked against their sources. What changed:
  <ul style="margin:10px 0 0 18px;">
    <li><strong>Removed:</strong> a comparison that placed Bangladesh in a cross-country &ldquo;fuel poverty&rdquo; band
      alongside named countries. It came from an earlier unverified pass and has no published source.</li>
    <li><strong>Removed:</strong> share-of-income figures that relied on an average salary and a median income we could
      not source. The tank price itself stands: 50 litres of octane at Tk 165 costs Tk 8,250.</li>
    <li><strong>Corrected:</strong> the National Pay Scale 2026 covers about 24 lakh serving civilian and military
      employees, plus about 9.25 lakh retirees and other beneficiaries. Earlier text counted all of them as employees.
      Informal workers are about 5.8 crore, roughly 84% of the employed.</li>
    <li><strong>Withdrawn:</strong> the illustrated PDF report, until it is corrected, and the frame-coded discourse CSVs,
      until two human coders have validated the frames.</li>
  </ul>
  <p style="margin:10px 0 0;">Two more points were revised: furnace oil was cut back to Tk 96.86 in September (about 38%
  above March, not +62%), and the pricing formula was applied in part in April and June rather than frozen. Everything
  else is as published on 21 September and is being re-checked.</p>
</aside>`;

/**
 * Wrap body content in the full document shell.
 * @param {{title:string, description:string, active:string, depth:number, body:string, ogTitle?:string}} o
 */
function page(o) {
  const depth = o.depth || 0;
  const canonical = SITE.origin + (o.path || SITE.base);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${o.title}</title>
<meta name="description" content="${o.description}">
<link rel="canonical" href="${canonical}">

<meta property="og:title" content="${o.ogTitle || o.title}">
<meta property="og:description" content="${o.description}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="BlankFrame Research">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${o.ogTitle || o.title}">
<meta name="twitter:description" content="${o.description}">

<link rel="icon" href="${FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700;800&family=Inter:wght@400;500;600&family=Instrument+Serif:ital@1&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${assetPath(depth)}">
</head>
<body>

${nav(o.active, depth)}

${o.body}

${footer()}

<!-- GoatCounter Analytics (Privacy-friendly, 0 cookies) -->
<script data-goatcounter="https://blankframe.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>
</body>
</html>
`;
}

module.exports = { SITE, NAV, CORRECTION, page, nav, footer };
