// Chart + diagram engine for the Bangladesh fuel-hike report.
// Hand-rolled SVG so the PDF has vector figures at print resolution.
// Palette: dataviz reference categorical slots, validated light-mode
// (adjacent 4-slot: worst CVD dE 9.1 PASS / normal-vision 22.9 PASS;
//  3-slot all-pairs: worst CVD dE 9.2 PASS / normal-vision 24.0 PASS).
// Contrast WARN on aqua+yellow is relieved by direct labels + data tables.

const C = {
  s1: '#2a78d6', s2: '#eb6834', s3: '#1baf7a', s4: '#eda100',
  s5: '#e87ba4', s7: '#4a3aa7', s8: '#e34948',
  seq100: '#cde2fb', seq250: '#86b6ef', seq400: '#3987e5', seq550: '#1c5cab', seq700: '#0d366b',
  ink: '#111110', ink2: '#52514e', ink3: '#87857c',
  grid: '#e8e7e2', rule: '#d6d5ce', surface: '#fcfcfb', panel: '#f5f4f0',
  crit: '#c0392b', warn: '#eda100', good: '#1baf7a'
};

const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const fmt = (n,d=0) => n.toFixed(d).replace(/\B(?=(\d{3})+(?!\d))/g,',');
const lin = (d0,d1,r0,r1) => v => r0 + (v-d0)/(d1-d0)*(r1-r0);

// de-collide a set of {y,...} labels, min gap px, within [top,bottom]
function decollide(items, gap, top, bottom){
  const a = items.slice().sort((x,y)=>x.y-y.y);
  for (let i=1;i<a.length;i++) if (a[i].y - a[i-1].y < gap) a[i].y = a[i-1].y + gap;
  const over = a.length ? a[a.length-1].y - bottom : 0;
  if (over > 0) for (let i=a.length-1;i>=0;i--){
    a[i].y -= over;
    if (i>0 && a[i].y - a[i-1].y >= gap) break;
  }
  if (a.length && a[0].y < top){ const d = top - a[0].y; a.forEach(o=>o.y+=d); }
  return a;
}

function defs(){
  return `<defs>
    <marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 9 5 L 0 9 z" fill="${C.ink2}"/></marker>
    <marker id="ahb" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path d="M 0 1 L 9 5 L 0 9 z" fill="${C.s1}"/></marker>
    <marker id="ahr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path d="M 0 1 L 9 5 L 0 9 z" fill="${C.crit}"/></marker>
    <pattern id="hatch" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
      <rect width="7" height="7" fill="${C.crit}" opacity="0.10"/>
      <line x1="0" y1="0" x2="0" y2="7" stroke="${C.crit}" stroke-width="2.4" opacity="0.55"/>
    </pattern>
    <pattern id="hatchg" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
      <rect width="7" height="7" fill="${C.ink3}" opacity="0.08"/>
      <line x1="0" y1="0" x2="0" y2="7" stroke="${C.ink3}" stroke-width="2.2" opacity="0.5"/>
    </pattern>
  </defs>`;
}

const W = 680; // content width in px at 96dpi for an A4 text column

/* ───────────────── C1 · price path, 4 series ───────────────── */
function chartPricePath(){
  const H=320, m={t:22,r:96,b:46,l:44};
  const xs=['Pre-18 Apr','18 Apr','June','21 Sep'];
  const series=[
    {k:'Octane',   c:C.s1, v:[120,140,145,165]},
    {k:'Petrol',   c:C.s2, v:[116,135,140,160]},
    {k:'Kerosene', c:C.s3, v:[112,130,135,155]},
    {k:'Diesel',   c:C.s4, v:[100,115,115,135]}
  ];
  const x = i => m.l + i*((W-m.l-m.r)/(xs.length-1));
  const y = lin(95,170, H-m.b, m.t);
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Retail fuel prices, taka per litre, March to September 2026">${defs()}`;
  for(let v=100;v<=170;v+=10){
    s+=`<line x1="${m.l}" y1="${y(v).toFixed(1)}" x2="${W-m.r}" y2="${y(v).toFixed(1)}" stroke="${C.grid}" stroke-width="1"/>`;
    s+=`<text x="${m.l-9}" y="${(y(v)+3.5).toFixed(1)}" text-anchor="end" font-size="10" fill="${C.ink3}">${v}</text>`;
  }
  xs.forEach((t,i)=>{
    s+=`<line x1="${x(i)}" y1="${m.t}" x2="${x(i)}" y2="${H-m.b}" stroke="${C.grid}" stroke-width="1" stroke-dasharray="2 3"/>`;
    s+=`<text x="${x(i)}" y="${H-m.b+18}" text-anchor="middle" font-size="10.5" fill="${C.ink2}">${t}</text>`;
  });
  // shaded "formula suspended" span
  s+=`<rect x="${x(1)}" y="${m.t}" width="${x(3)-x(1)}" height="${H-m.b-m.t}" fill="${C.s8}" opacity="0.035"/>`;
  s+=`<text x="${(x(1)+x(3))/2}" y="${m.t+13}" text-anchor="middle" font-size="9.5" fill="${C.ink3}" font-style="italic">monthly pricing formula suspended</text>`;
  const labels=[];
  series.forEach(se=>{
    const pts = se.v.map((v,i)=>[x(i),y(v)]);
    s+=`<path d="${pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ')}" fill="none" stroke="${se.c}" stroke-width="2" stroke-linejoin="round"/>`;
    pts.forEach(p=>{ s+=`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4.2" fill="${se.c}" stroke="${C.surface}" stroke-width="2"/>`; });
    labels.push({y:y(se.v[3]), c:se.c, k:se.k, v:se.v[3], yr:y(se.v[3])});
  });
  decollide(labels,26,m.t+6,H-m.b).forEach(L=>{
    s+=`<line x1="${W-m.r+4}" y1="${L.yr.toFixed(1)}" x2="${W-m.r+13}" y2="${L.y.toFixed(1)}" stroke="${L.c}" stroke-width="1.2" opacity="0.6"/>`;
    s+=`<text x="${W-m.r+17}" y="${(L.y+3.6).toFixed(1)}" font-size="10.5" fill="${C.ink}" font-weight="600">${L.k}</text>`;
    s+=`<text x="${W-m.r+17}" y="${(L.y+14.5).toFixed(1)}" font-size="9.5" fill="${C.ink2}">Tk ${L.v}</text>`;
  });
  s+=`<text x="${m.l-9}" y="${m.t-8}" text-anchor="end" font-size="9.5" fill="${C.ink3}">Tk/L</text>`;
  return s+`</svg>`;
}

/* ───────── C2 · affordability by income denominator ───────── */
function chartAffordability(){
  const rows=[
    {k:'Median monthly income', sub:'Tk 9,000', v:91.7},
    {k:'RMG minimum wage', sub:'Tk 12,500 · unchanged since Dec 2023', v:66.0},
    {k:'Average gross salary', sub:'Tk 18,000', v:45.8},
    {k:'Govt lowest basic, fully phased', sub:'Tk 20,000', v:41.3},
    {k:'Average salary, a year ago at Tk 125/L', sub:'reference', v:34.7, ghost:true}
  ];
  const m={t:34,r:54,b:40,l:250}, bh=26, gap=13;
  const H=m.t+rows.length*(bh+gap)+m.b;
  const x=lin(0,100,m.l,W-m.r);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Cost of 50 litres of octane as a share of monthly income, by income measure">${defs()}`;
  s+=`<rect x="${x(50)}" y="${m.t-10}" width="${x(100)-x(50)}" height="${rows.length*(bh+gap)+4}" fill="${C.s8}" opacity="0.05"/>`;
  s+=`<line x1="${x(50)}" y1="${m.t-10}" x2="${x(50)}" y2="${m.t+rows.length*(bh+gap)-6}" stroke="${C.s8}" stroke-width="1.2" stroke-dasharray="4 3"/>`;
  s+=`<text x="${x(50)+6}" y="${m.t-16}" font-size="9.5" fill="${C.crit}" font-weight="600">extreme fuel poverty band (&gt;50%)</text>`;
  for(let v=0;v<=100;v+=25){
    s+=`<text x="${x(v)}" y="${H-m.b+22}" text-anchor="middle" font-size="10" fill="${C.ink3}">${v}%</text>`;
    if(v) s+=`<line x1="${x(v)}" y1="${m.t-10}" x2="${x(v)}" y2="${m.t+rows.length*(bh+gap)-6}" stroke="${C.grid}" stroke-width="1"/>`;
  }
  rows.forEach((r,i)=>{
    const yy=m.t+i*(bh+gap);
    s+=`<text x="${m.l-14}" y="${yy+12}" text-anchor="end" font-size="11" fill="${C.ink}" font-weight="600">${esc(r.k)}</text>`;
    s+=`<text x="${m.l-14}" y="${yy+24}" text-anchor="end" font-size="9.5" fill="${C.ink3}">${esc(r.sub)}</text>`;
    const w=x(r.v)-x(0);
    s+=`<rect x="${x(0)}" y="${yy}" width="${w.toFixed(1)}" height="${bh}" rx="4" fill="${r.ghost?'url(#hatchg)':C.seq450||C.s1}" ${r.ghost?`stroke="${C.ink3}" stroke-width="1"`:''}/>`;
    s+=`<text x="${x(r.v)+8}" y="${yy+17.5}" font-size="12" font-weight="700" fill="${r.ghost?C.ink2:C.ink}">${r.v}%</text>`;
  });
  s+=`<line x1="${m.l}" y1="${m.t+rows.length*(bh+gap)-6}" x2="${W-m.r}" y2="${m.t+rows.length*(bh+gap)-6}" stroke="${C.rule}" stroke-width="1"/>`;
  return s+`</svg>`;
}

/* ───────── C3 · international comparison ───────── */
function chartGlobal(){
  const rows=[
    ['United States',1.1],['Switzerland',1.6],['Australia',1.7],['Japan',2.5],['United Kingdom',3.0],
    ['Germany',3.1],['China',5.2],['Brazil',9.6],['South Africa',11.4],['India',15.0],
    ['Pakistan',31.3],['Nigeria',34.1],['BANGLADESH',45.8],['Madagascar',61.9]
  ];
  const m={t:40,r:40,b:44,l:118}, bw=(W-m.l-m.r)/rows.length, H=330;
  const y=lin(0,65,H-m.b,m.t);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Cost of a 50 litre tank as a share of average monthly income, selected countries">${defs()}`;
  for(let v=0;v<=60;v+=20){
    s+=`<line x1="${m.l-8}" y1="${y(v).toFixed(1)}" x2="${W-m.r}" y2="${y(v).toFixed(1)}" stroke="${C.grid}" stroke-width="1"/>`;
    s+=`<text x="${m.l-13}" y="${(y(v)+3.5).toFixed(1)}" text-anchor="end" font-size="10" fill="${C.ink3}">${v}%</text>`;
  }
  s+=`<line x1="${m.l-8}" y1="${y(50).toFixed(1)}" x2="${W-m.r}" y2="${y(50).toFixed(1)}" stroke="${C.crit}" stroke-width="1.2" stroke-dasharray="4 3"/>`;
  s+=`<text x="${m.l}" y="${(y(50)-6).toFixed(1)}" text-anchor="start" font-size="9.5" fill="${C.crit}" font-weight="600">50% of monthly income</text>`;
  rows.forEach((r,i)=>{
    const isBD=r[0]==='BANGLADESH';
    const bx=m.l+i*bw+2.5, w=bw-5;
    s+=`<rect x="${bx.toFixed(1)}" y="${y(r[1]).toFixed(1)}" width="${w.toFixed(1)}" height="${(y(0)-y(r[1])).toFixed(1)}" rx="3.5" fill="${isBD?C.s1:'#cfcdc4'}"/>`;
    if(isBD){
      s+=`<rect x="${bx.toFixed(1)}" y="${y(31.3).toFixed(1)}" width="${w.toFixed(1)}" height="${(y(0)-y(31.3)).toFixed(1)}" rx="3.5" fill="none" stroke="${C.ink}" stroke-width="1.3" stroke-dasharray="3 2.5"/>`;
      s+=`<text x="${(bx+w/2).toFixed(1)}" y="${(y(r[1])-22).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="700" fill="${C.s1}">45.8%</text>`;
      s+=`<text x="${(bx+w/2).toFixed(1)}" y="${(y(r[1])-10).toFixed(1)}" text-anchor="middle" font-size="8.5" fill="${C.ink2}">was est. 31%</text>`;
    } else {
      s+=`<text x="${(bx+w/2).toFixed(1)}" y="${(y(r[1])-6).toFixed(1)}" text-anchor="middle" font-size="9" fill="${C.ink2}">${r[1]}</text>`;
    }
    s+=`<text x="${(bx+w/2).toFixed(1)}" y="${H-m.b+15}" text-anchor="end" font-size="9.5" transform="rotate(-42 ${(bx+w/2).toFixed(1)} ${H-m.b+15})" fill="${isBD?C.ink:C.ink2}" font-weight="${isBD?700:400}">${esc(r[0]==='BANGLADESH'?'Bangladesh':r[0])}</text>`;
  });
  s+=`<line x1="${m.l-8}" y1="${y(0)}" x2="${W-m.r}" y2="${y(0)}" stroke="${C.rule}" stroke-width="1.2"/>`;
  return s+`</svg>`;
}

/* ───────── C4 · the BPC diesel gap ───────── */
function chartBpcGap(){
  const H=250, m={t:58,r:40,l:40};
  const x=lin(0,200,m.l,W-m.r), bar=52, ty=m.t+24;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Diesel price versus the price BPC's own formula required">${defs()}`;
  const seg=(a,b,fill,stroke)=>`<rect x="${x(a).toFixed(1)}" y="${ty}" width="${(x(b)-x(a)-2).toFixed(1)}" height="${bar}" fill="${fill}" ${stroke?`stroke="${stroke}" stroke-width="1.2"`:''}/>`;
  s+=seg(0,115,'#cfcdc4');
  s+=seg(115,135,C.s1);
  s+=seg(135,187,'url(#hatch)',C.crit);
  // duty wedge inside the set price
  s+=`<rect x="${x(102.56).toFixed(1)}" y="${ty}" width="${(x(135)-x(102.56)-2).toFixed(1)}" height="${bar}" fill="${C.ink}" opacity="0.14"/>`;
  s+=`<line x1="${x(102.56).toFixed(1)}" y1="${ty}" x2="${x(102.56).toFixed(1)}" y2="${ty+bar}" stroke="${C.ink}" stroke-width="1" stroke-dasharray="3 2"/>`;
  const tick=(v,lab,sub,col,above)=>{
    const yy = above? ty-8 : ty+bar+8;
    let o=`<line x1="${x(v).toFixed(1)}" y1="${above?ty-6:ty+bar+6}" x2="${x(v).toFixed(1)}" y2="${above?ty-20:ty+bar+20}" stroke="${col}" stroke-width="1.2"/>`;
    o+=`<text x="${x(v).toFixed(1)}" y="${above?ty-26:ty+bar+34}" text-anchor="middle" font-size="11.5" font-weight="700" fill="${col}">${lab}</text>`;
    o+=`<text x="${x(v).toFixed(1)}" y="${above?ty-15:ty+bar+46}" text-anchor="middle" font-size="9.5" fill="${C.ink2}">${sub}</text>`;
    return o;
  };
  s+=tick(115,'Tk 115','price before 21 Sep',C.ink2,true);
  s+=tick(135,'Tk 135','what the government set',C.s1,false);
  s+=tick(187,'Tk 187',"BPC's formula price",C.crit,true);
  // brace over the gap
  const gy=ty+bar+64;
  s+=`<path d="M ${x(135).toFixed(1)} ${gy-6} L ${x(135).toFixed(1)} ${gy} L ${x(187).toFixed(1)} ${gy} L ${x(187).toFixed(1)} ${gy-6}" fill="none" stroke="${C.crit}" stroke-width="1.2"/>`;
  s+=`<text x="${((x(135)+x(187))/2).toFixed(1)}" y="${gy+15}" text-anchor="middle" font-size="11" font-weight="700" fill="${C.crit}">Tk 52 still unpassed</text>`;
  s+=`<text x="${((x(135)+x(187))/2).toFixed(1)}" y="${gy+28}" text-anchor="middle" font-size="9.5" fill="${C.ink2}">only 27.8% of the Tk 72 gap closed</text>`;
  // legend
  s+=`<g font-size="10" fill="${C.ink2}">
    <rect x="${m.l}" y="14" width="11" height="11" fill="${C.s1}"/><text x="${m.l+16}" y="23">the Tk 20 hike</text>
    <rect x="${m.l+118}" y="14" width="11" height="11" fill="url(#hatch)" stroke="${C.crit}" stroke-width="1"/><text x="${m.l+134}" y="23">still not passed through</text>
    <rect x="${m.l+280}" y="14" width="11" height="11" fill="${C.ink}" opacity="0.14"/><text x="${m.l+296}" y="23">Tk 32.44/L duties &amp; taxes inside the pump price</text>
  </g>`;
  return s+`</svg>`;
}

/* ───────── C5 · operating cost per km ───────── */
function chartPerKm(){
  const H=210, m={t:30,r:150,b:40,l:186}, bh=34, gap=20;
  const x=lin(0,12,m.l,W-m.r);
  const rows=[
    {k:'Petrol three-wheeler', sub:'Tk 165/L at ~15 km/L', lo:11.0, hi:11.0, c:C.s2, lab:'Tk 11.00'},
    {k:'Battery rickshaw, metered', sub:'4–9 kWh/day at Tk 8–9/kWh', lo:0.32, hi:0.81, c:C.s1, lab:'Tk 0.32–0.81'},
    {k:'Battery rickshaw, illegal tap', sub:'~93% of Dhaka charging points', lo:0, hi:0.02, c:C.ink3, lab:'~Tk 0'}
  ];
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Fuel or electricity cost per kilometre by vehicle type">${defs()}`;
  for(let v=0;v<=12;v+=2){
    s+=`<line x1="${x(v)}" y1="${m.t-8}" x2="${x(v)}" y2="${m.t+rows.length*(bh+gap)-14}" stroke="${C.grid}" stroke-width="1"/>`;
    s+=`<text x="${x(v)}" y="${H-m.b+20}" text-anchor="middle" font-size="10" fill="${C.ink3}">${v}</text>`;
  }
  s+=`<text x="${(W-m.r+m.l)/2}" y="${H-m.b+34}" text-anchor="middle" font-size="9.5" fill="${C.ink3}">taka per kilometre</text>`;
  rows.forEach((r,i)=>{
    const yy=m.t+i*(bh+gap);
    s+=`<text x="${m.l-14}" y="${yy+15}" text-anchor="end" font-size="11" font-weight="600" fill="${C.ink}">${esc(r.k)}</text>`;
    s+=`<text x="${m.l-14}" y="${yy+27}" text-anchor="end" font-size="9.5" fill="${C.ink3}">${esc(r.sub)}</text>`;
    const w=Math.max(x(r.hi)-x(0),3);
    s+=`<rect x="${x(0)}" y="${yy}" width="${w.toFixed(1)}" height="${bh}" rx="4" fill="${r.c}"/>`;
    s+=`<text x="${(x(r.hi)+10).toFixed(1)}" y="${yy+22}" font-size="11.5" font-weight="700" fill="${C.ink}">${r.lab}</text>`;
  });
  const y0=m.t+8, y1=m.t+(bh+gap)+bh-8;
  s+=`<path d="M ${x(11)+70} ${y0} L ${x(11)+82} ${y0} L ${x(11)+82} ${y1} L ${x(11)+70} ${y1}" fill="none" stroke="${C.crit}" stroke-width="1.3"/>`;
  s+=`<text x="${x(11)+88}" y="${(y0+y1)/2-3}" font-size="12" font-weight="700" fill="${C.crit}">14–34×</text>`;
  s+=`<text x="${x(11)+88}" y="${(y0+y1)/2+10}" font-size="9.5" fill="${C.ink2}">cheaper</text>`;
  return s+`</svg>`;
}

/* ───────── C6 · the reinforcing loop ───────── */
function diagramLoop(){
  const H=470, cx=W/2, cy=232, rx=250, ry=158;
  const nodes=[
    {t:'Fuel hike',            s:'diesel +17.4%',           c:C.s8},
    {t:'Modal switch',          s:'to battery rickshaws',    c:C.s1},
    {t:'Charging load grows',   s:'500 MW–1 GW · 5% of gen', c:C.s1},
    {t:'Deeper load shedding',  s:'>3,500 MW peak cuts',     c:C.s2},
    {t:'Oil-fired backup',      s:'furnace oil · Tk 1.2bn/day', c:C.s2},
    {t:'BPC & PDB deficits',    s:'Tk 22,876 cr in 6 months', c:C.s8}
  ];
  const n=nodes.length, bw=156, bh=50;
  const ang = i => -Math.PI/2 + i*2*Math.PI/n;
  const pt = a => [cx+rx*Math.cos(a), cy+ry*Math.sin(a)];
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Reinforcing loop from the fuel hike through battery rickshaw charging to load shedding and back to fuel deficits">${defs()}`;
  // arcs between consecutive nodes
  for(let i=0;i<n;i++){
    const pad=0.40;
    const a0=ang(i)+pad, a1=ang(i+1)-pad;
    const steps=18, ps=[];
    for(let k=0;k<=steps;k++){ ps.push(pt(a0+(a1-a0)*k/steps)); }
    const d = ps.map((p,k)=>(k?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
    s+=`<path d="${d}" fill="none" stroke="${C.ink3}" stroke-width="1.6" marker-end="url(#ah)" opacity="0.85"/>`;
  }
  s+=`<text x="${cx}" y="${cy-12}" text-anchor="middle" font-size="13.5" font-weight="700" fill="${C.ink}">REINFORCING</text>`;
  s+=`<text x="${cx}" y="${cy+6}" text-anchor="middle" font-size="13.5" font-weight="700" fill="${C.ink}">LOOP</text>`;
  s+=`<text x="${cx}" y="${cy+24}" text-anchor="middle" font-size="9.5" fill="${C.ink3}">each turn raises the next</text>`;
  s+=`<text x="${cx}" y="${cy+36}" text-anchor="middle" font-size="9.5" fill="${C.ink3}">round's cost</text>`;
  nodes.forEach((nd,i)=>{
    const [px,py]=pt(ang(i));
    const bx=px-bw/2, by=py-bh/2;
    s+=`<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw}" height="${bh}" rx="7" fill="${C.surface}" stroke="${nd.c}" stroke-width="1.8"/>`;
    s+=`<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="4" height="${bh}" rx="2" fill="${nd.c}"/>`;
    s+=`<text x="${px.toFixed(1)}" y="${(py-3).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="700" fill="${C.ink}">${esc(nd.t)}</text>`;
    s+=`<text x="${px.toFixed(1)}" y="${(py+11).toFixed(1)}" text-anchor="middle" font-size="9" fill="${C.ink2}">${esc(nd.s)}</text>`;
  });
  // the parallel genset loop, drawn as a side branch
  const byy=H-34;
  s+=`<rect x="${cx-266}" y="${byy-26}" width="532" height="42" rx="7" fill="${C.panel}" stroke="${C.rule}" stroke-width="1"/>`;
  s+=`<text x="${cx-254}" y="${byy-10}" font-size="9.5" font-weight="700" fill="${C.ink}">PARALLEL LOOP</text>`;
  s+=`<text x="${cx-254}" y="${byy+3}" font-size="9.5" fill="${C.ink2}">load shedding → factories run diesel gensets at Tk 145/L → diesel demand spikes as BPC</text>`;
  s+=`<text x="${cx-254}" y="${byy+14}" font-size="9.5" fill="${C.ink2}">cannot fund October LCs → shortage → Tk 15–80/L above gazette in rural markets</text>`;
  return s+`</svg>`;
}

/* ───────── C7 · transmission map ───────── */
function diagramTransmission(){
  const H=420;
  const col=[70,300,530];
  const fuels=[
    {t:'Diesel',      s:'+17.4% → Tk 135', c:C.s4, y:100},
    {t:'Kerosene',    s:'+14.8% → Tk 155', c:C.s3, y:215},
    {t:'Furnace oil', s:'+62% → Tk 113.54', c:C.s2, y:330}
  ];
  const chans=[
    {t:'Truck freight',      y:58,  f:[0]},
    {t:'Bus & launch fares', y:118, f:[0]},
    {t:'Irrigation pumps',   y:178, f:[0]},
    {t:'Factory generators', y:238, f:[0]},
    {t:'Household lighting', y:298, f:[1]},
    {t:'Power generation',   y:358, f:[2]}
  ];
  const outs=[
    {t:'Food inflation',      s:'Boro cost +Tk 2,130 cr', y:86,  ch:[0,2]},
    {t:'Real wages fall',     s:'8.05% vs 8.26%',         y:170, ch:[1,4]},
    {t:'Export margins',      s:'output already −20–30%', y:254, ch:[0,3]},
    {t:'Load shedding',       s:'>3,500 MW',              y:338, ch:[5]}
  ];
  const bw=150, bh=42;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="How each fuel transmits through economic channels into outcomes">${defs()}`;
  const hdr=(x,t)=>`<text x="${x}" y="24" text-anchor="middle" font-size="9.5" font-weight="700" fill="${C.ink3}" letter-spacing="0.06em">${t}</text>`;
  s+=hdr(col[0]+bw/2-40,'THE FUEL')+hdr(col[1]+bw/2-40,'THE CHANNEL')+hdr(col[2]+bw/2-45,'THE OUTCOME');
  const link=(x1,y1,x2,y2,c,o)=>{
    const mx=(x1+x2)/2;
    return `<path d="M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}" fill="none" stroke="${c}" stroke-width="1.4" opacity="${o}"/>`;
  };
  chans.forEach((ch,ci)=>{
    ch.f.forEach(fi=> { s+=link(col[0]+bw-40, fuels[fi].y, col[1]-40, ch.y+14, fuels[fi].c, 0.5); });
  });
  outs.forEach(o=>{ o.ch.forEach(ci=> { s+=link(col[1]+bw-40, chans[ci].y+14, col[2]-45, o.y+18, C.ink3, 0.45); }); });
  fuels.forEach(f=>{
    s+=`<rect x="${col[0]-40}" y="${f.y-bh/2}" width="${bw}" height="${bh}" rx="6" fill="${C.surface}" stroke="${f.c}" stroke-width="1.8"/>`;
    s+=`<rect x="${col[0]-40}" y="${f.y-bh/2}" width="4" height="${bh}" rx="2" fill="${f.c}"/>`;
    s+=`<text x="${col[0]-28}" y="${f.y-3}" font-size="11.5" font-weight="700" fill="${C.ink}">${f.t}</text>`;
    s+=`<text x="${col[0]-28}" y="${f.y+11}" font-size="9" fill="${C.ink2}">${esc(f.s)}</text>`;
  });
  chans.forEach(ch=>{
    s+=`<rect x="${col[1]-40}" y="${ch.y}" width="${bw-14}" height="28" rx="5" fill="${C.panel}" stroke="${C.rule}" stroke-width="1"/>`;
    s+=`<text x="${col[1]-40+(bw-14)/2}" y="${ch.y+18}" text-anchor="middle" font-size="10" fill="${C.ink}">${esc(ch.t)}</text>`;
  });
  outs.forEach(o=>{
    s+=`<rect x="${col[2]-45}" y="${o.y}" width="${bw+15}" height="38" rx="6" fill="${C.ink}" />`;
    s+=`<text x="${col[2]-33}" y="${o.y+16}" font-size="11" font-weight="700" fill="#ffffff">${esc(o.t)}</text>`;
    s+=`<text x="${col[2]-33}" y="${o.y+29}" font-size="8.8" fill="#c9c8c0">${esc(o.s)}</text>`;
  });
  return s+`</svg>`;
}

/* ───────── C8 · inflation bridge ───────── */
function chartInflation(){
  const H=290, m={t:56,r:40,b:56,l:46};
  const y=lin(7.8,11.0,H-m.b,m.t);
  const bars=[
    {k:'August 2026\nactual', lo:8.26, hi:8.26, base:0, c:C.ink3, anchor:true},
    {k:'Direct fuel\npurchase', lo:0.25, hi:0.40, c:C.s4},
    {k:'Transport\nservices', lo:0.40, hi:0.90, c:C.s2},
    {k:'Food via freight\n& irrigation', lo:0.40, hi:0.65, c:C.s3},
    {k:'Pay-scale\ndemand', lo:0.30, hi:0.50, c:C.s5},
    {k:'Expected\nDec–Jan', lo:9.61, hi:10.71, base:0, c:C.s1, anchor:true}
  ];
  const bw=(W-m.l-m.r)/bars.length;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Estimated contributions to general inflation from the fuel price hike">${defs()}`;
  for(let v=8;v<=11;v+=0.5){
    s+=`<line x1="${m.l-8}" y1="${y(v).toFixed(1)}" x2="${W-m.r}" y2="${y(v).toFixed(1)}" stroke="${C.grid}" stroke-width="1"/>`;
    s+=`<text x="${m.l-13}" y="${(y(v)+3.5).toFixed(1)}" text-anchor="end" font-size="9.5" fill="${C.ink3}">${v.toFixed(1)}%</text>`;
  }
  let run=8.26;
  bars.forEach((b,i)=>{
    const bx=m.l+i*bw+bw*0.20, w=bw*0.60;
    if(b.anchor){
      const top = (i===0)? b.hi : b.hi, bot = (i===0)? 7.8 : 7.8;
      s+=`<rect x="${bx.toFixed(1)}" y="${y(top).toFixed(1)}" width="${w.toFixed(1)}" height="${(y(bot)-y(top)).toFixed(1)}" rx="3.5" fill="${b.c}" opacity="${i===0?0.55:1}"/>`;
      if(i===bars.length-1){
        s+=`<rect x="${bx.toFixed(1)}" y="${y(b.hi).toFixed(1)}" width="${w.toFixed(1)}" height="${(y(b.lo)-y(b.hi)).toFixed(1)}" fill="url(#hatch)"/>`;
        s+=`<text x="${(bx+w/2).toFixed(1)}" y="${(y(b.hi)-20).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="700" fill="${C.s1}">9.6–10.7%</text>`;
        s+=`<text x="${(bx+w/2).toFixed(1)}" y="${(y(b.hi)-8).toFixed(1)}" text-anchor="middle" font-size="8.5" fill="${C.ink2}">estimate</text>`;
      } else {
        s+=`<text x="${(bx+w/2).toFixed(1)}" y="${(y(b.hi)-8).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="700" fill="${C.ink}">8.26%</text>`;
      }
    } else {
      const top=run+b.hi, bot=run;
      s+=`<rect x="${bx.toFixed(1)}" y="${y(top).toFixed(1)}" width="${w.toFixed(1)}" height="${(y(bot)-y(top)-2).toFixed(1)}" rx="3" fill="${b.c}" opacity="0.30"/>`;
      s+=`<rect x="${bx.toFixed(1)}" y="${y(run+b.lo).toFixed(1)}" width="${w.toFixed(1)}" height="${(y(bot)-y(run+b.lo)-2).toFixed(1)}" rx="3" fill="${b.c}"/>`;
      s+=`<text x="${(bx+w/2).toFixed(1)}" y="${(y(top)-7).toFixed(1)}" text-anchor="middle" font-size="9.5" font-weight="700" fill="${C.ink}">+${b.lo.toFixed(2)}–${b.hi.toFixed(2)}</text>`;
      s+=`<line x1="${(bx+w).toFixed(1)}" y1="${y(bot).toFixed(1)}" x2="${(bx+bw*0.60).toFixed(1)}" y2="${y(bot).toFixed(1)}" stroke="${C.ink3}" stroke-width="1" stroke-dasharray="2 2"/>`;
      run += (b.lo+b.hi)/2;
    }
    b.k.split('\n').forEach((ln,li)=>{
      s+=`<text x="${(bx+w/2).toFixed(1)}" y="${H-m.b+18+li*11}" text-anchor="middle" font-size="9.5" fill="${C.ink2}">${esc(ln)}</text>`;
    });
  });
  s+=`<line x1="${m.l-8}" y1="${y(7.8)}" x2="${W-m.r}" y2="${y(7.8)}" stroke="${C.rule}" stroke-width="1.2"/>`;
  s+=`<text x="${m.l-8}" y="${m.t-22}" font-size="9.5" fill="${C.ink3}">Solid bar = low end of the range · pale extension = high end</text>`;
  s+=`<text x="${m.l-8}" y="${m.t-9}" font-size="9.5" fill="${C.ink3}" font-style="italic">Contributions are this report's estimates (assumed CPI weights), not reported figures.</text>`;
  return s+`</svg>`;
}

/* ───────── C9 · wage divergence, indexed ───────── */
function chartWages(){
  const H=310, m={t:26,r:150,b:48,l:48};
  const xs=['Dec 2023','2024','2025','Sep 2026'];
  const series=[
    {k:'Govt grade 20 basic', c:C.s1, v:[100,100,100,171], proj:242, note:'Tk 8,250 → 14,125'},
    {k:'Consumer prices',     c:C.s2, v:[100,110,121,131], note:'cumulative inflation'},
    {k:'RMG minimum wage',    c:C.s3, v:[100,100,100,100], note:'Tk 12,500, unchanged'}
  ];
  const x=i=>m.l+i*((W-m.r-m.l)/(xs.length-1));
  const y=lin(90,250,H-m.b,m.t);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Government pay, consumer prices and the garment minimum wage, indexed to December 2023">${defs()}`;
  for(let v=100;v<=250;v+=25){
    s+=`<line x1="${m.l}" y1="${y(v).toFixed(1)}" x2="${W-m.r}" y2="${y(v).toFixed(1)}" stroke="${C.grid}" stroke-width="1"/>`;
    s+=`<text x="${m.l-10}" y="${(y(v)+3.5).toFixed(1)}" text-anchor="end" font-size="9.5" fill="${C.ink3}">${v}</text>`;
  }
  xs.forEach((t,i)=>s+=`<text x="${x(i)}" y="${H-m.b+18}" text-anchor="middle" font-size="10.5" fill="${C.ink2}">${t}</text>`);
  const labels=[];
  series.forEach(se=>{
    const pts=se.v.map((v,i)=>[x(i),y(v)]);
    s+=`<path d="${pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ')}" fill="none" stroke="${se.c}" stroke-width="2"/>`;
    if(se.proj){
      s+=`<path d="M ${x(3).toFixed(1)} ${y(se.v[3]).toFixed(1)} L ${(x(3)+34).toFixed(1)} ${y(se.proj).toFixed(1)}" fill="none" stroke="${se.c}" stroke-width="2" stroke-dasharray="4 3"/>`;
      s+=`<circle cx="${(x(3)+34).toFixed(1)}" cy="${y(se.proj).toFixed(1)}" r="3.6" fill="${C.surface}" stroke="${se.c}" stroke-width="2"/>`;
      s+=`<text x="${(x(3)+40).toFixed(1)}" y="${(y(se.proj)+3.5).toFixed(1)}" font-size="9.5" fill="${C.ink2}">242 by yr 2</text>`;
    }
    pts.forEach(p=>s+=`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4" fill="${se.c}" stroke="${C.surface}" stroke-width="2"/>`);
    labels.push({y:y(se.v[3]), yr:y(se.v[3]), c:se.c, k:se.k, note:se.note, v:se.v[3]});
  });
  decollide(labels,26,m.t+10,H-m.b-6).forEach(L=>{
    s+=`<text x="${W-m.r+14}" y="${(L.y-1).toFixed(1)}" font-size="10.5" font-weight="700" fill="${C.ink}">${esc(L.k)}</text>`;
    s+=`<text x="${W-m.r+14}" y="${(L.y+11).toFixed(1)}" font-size="9" fill="${C.ink2}">${esc(L.note)}</text>`;
    s+=`<circle cx="${W-m.r+7}" cy="${(L.y-5).toFixed(1)}" r="3.4" fill="${L.c}"/>`;
  });
  s+=`<text x="${m.l-10}" y="${m.t-8}" text-anchor="end" font-size="9.5" fill="${C.ink3}">index</text>`;
  s+=`<text x="${m.l}" y="${H-10}" font-size="9.5" fill="${C.ink3}" font-style="italic">Index, December 2023 = 100. Government line shows the phased award: +71% in year one, +142% at full phase-in.</text>`;
  return s+`</svg>`;
}

/* ───────── C10 · watch timeline ───────── */
function diagramTimeline(){
  const H=250, m={l:36,r:36,t:66};
  const months=['Oct 26','Nov 26','Dec 26','Jan 27','Feb 27','Mar 27'];
  const x=lin(0,5,m.l+30,W-m.r-30);
  const ev=[
    {m:0,   t:'BPC letter-of-credit funding exhausts', s:'physical supply risk', c:C.s8, off:-70},
    {m:0.6, t:'October CPI print', s:'first hard pass-through evidence', c:C.s1, off:76},
    {m:1.1, t:'LDC graduation, 24 Nov', s:'preferences begin to lapse', c:C.s2, off:-34},
    {m:1.8, t:'Boro planting decisions', s:'sets 2027 food prices', c:C.s4, off:40},
    {m:2.6, t:'Probable second hike', s:'or an equivalent duty cut', c:C.s8, off:-106},
    {m:4.2, t:'Peak irrigation + PDB dues', s:'diesel demand into a cash-short BPC', c:C.s3, off:76}
  ];
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Calendar of events to watch from October 2026 to March 2027">${defs()}`;
  const axy=m.t+62;
  s+=`<line x1="${m.l}" y1="${axy}" x2="${W-m.r}" y2="${axy}" stroke="${C.ink}" stroke-width="1.6" marker-end="url(#ah)"/>`;
  months.forEach((mo,i)=>{
    s+=`<line x1="${x(i)}" y1="${axy-5}" x2="${x(i)}" y2="${axy+5}" stroke="${C.ink2}" stroke-width="1.2"/>`;
    s+=`<text x="${x(i)}" y="${axy+20}" text-anchor="middle" font-size="10" fill="${C.ink2}">${mo}</text>`;
  });
  ev.forEach((e,i)=>{
    const ex=x(e.m);
    e.up = e.off < 0; const off = e.off;
    const ty = axy + off;
    s+=`<line x1="${ex.toFixed(1)}" y1="${axy + (e.up?-6:6)}" x2="${ex.toFixed(1)}" y2="${ty + (e.up?13:-13)}" stroke="${e.c}" stroke-width="1.2" stroke-dasharray="3 2"/>`;
    s+=`<circle cx="${ex.toFixed(1)}" cy="${axy}" r="4.6" fill="${e.c}" stroke="${C.surface}" stroke-width="2"/>`;
    const anch = ex > W-170 ? 'end' : (ex < 150 ? 'start' : 'middle');
    s+=`<text x="${ex.toFixed(1)}" y="${ty}" text-anchor="${anch}" font-size="10.5" font-weight="700" fill="${C.ink}">${esc(e.t)}</text>`;
    s+=`<text x="${ex.toFixed(1)}" y="${ty+12}" text-anchor="${anch}" font-size="9" fill="${C.ink2}">${esc(e.s)}</text>`;
  });
  return s+`</svg>`;
}

/* ───────── cover hero ───────── */
function coverHero(){
  const H=210, m={t:26,r:20,b:34,l:20};
  const xs=[0,1,2,3];
  const series=[
    {c:'#ffffff', v:[120,140,145,165], w:2.4},
    {c:'#7fb0ea', v:[100,115,115,135], w:1.6}
  ];
  const x=i=>m.l+i*((W-m.l-m.r)/3);
  const y=lin(92,172,H-m.b,m.t);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Octane and diesel prices rising from March to September 2026">`;
  for(let v=100;v<=170;v+=10) s+=`<line x1="${m.l}" y1="${y(v).toFixed(1)}" x2="${W-m.r}" y2="${y(v).toFixed(1)}" stroke="#ffffff" stroke-width="1" opacity="0.10"/>`;
  series.forEach(se=>{
    const pts=se.v.map((v,i)=>[x(i),y(v)]);
    s+=`<path d="${pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ')}" fill="none" stroke="${se.c}" stroke-width="${se.w}" stroke-linejoin="round"/>`;
    pts.forEach((p,i)=>s+=`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${i===3?5:3.4}" fill="${se.c}"/>`);
  });
  s+=`<text x="${x(3)-8}" y="${(y(165)-12).toFixed(1)}" text-anchor="end" font-size="12" font-weight="700" fill="#ffffff">Octane Tk 165</text>`;
  s+=`<text x="${x(3)-8}" y="${(y(135)+20).toFixed(1)}" text-anchor="end" font-size="11" font-weight="600" fill="#7fb0ea">Diesel Tk 135</text>`;
  ['Pre-Apr','18 Apr','June','21 Sep'].forEach((t,i)=>
    s+=`<text x="${x(i)}" y="${H-12}" text-anchor="middle" font-size="9.5" fill="#9a9890">${t}</text>`);
  return s+`</svg>`;
}

module.exports = { C, chartPricePath, chartAffordability, chartGlobal, chartBpcGap, chartPerKm,
  diagramLoop, diagramTransmission, chartInflation, chartWages, diagramTimeline, coverHero };
