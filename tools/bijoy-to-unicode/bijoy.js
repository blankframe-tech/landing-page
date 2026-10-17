/* Browser port of convert.py + b2u.js (Bijoy -> Unicode, keeps layout). Works on .docx only.
   Needs JSZip and a DOMParser/XMLSerializer. converter.js is banglaconverter.org's engine (third-party). */
(function (root) {
const W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const XML = "http://www.w3.org/XML/1998/namespace";
const FONT = "Nirmala UI";
const PRE = "‡†wˆ‰"; // Bijoy vowel signs typed before their consonant; must travel to the next run
const SUSPECT = /্(?![ক-হড়-য়])|[া-ৌ]{2}|(?<!\S)[া-্]|[\xa1-\xffŒ-˜‚„†-•…‰‹›™]/;
const pre = `
function v(c){return c!==undefined&&/[\\u0995-\\u09B9\\u09DC\\u09DD\\u09DF\\u09CE]/.test(c)}
function D(c){return c==='\\u09CD'}
function ah(c){return c!==undefined&&/[\\u09BE-\\u09CC\\u09D7]/.test(c)}
function aF(c){return c==='\\u09BC'}
function ao(c){return c!==undefined&&/[\\u09BF\\u09C7\\u09C8]/.test(c)}
function cy(c){return c===' '||c==='\\n'||c==='\\t'||c==='\\r'||c===undefined}
function aJ(c){return c!==undefined&&/[\\u09BE\\u09C0-\\u09C4\\u09D7]/.test(c)}
`;

function makeEngine(src) {
  const E = new Function(pre + src + ";return {cM:cM,ay:ay};")();
  E.ay["¤œ"]="ম্ন";E.ay["\\^"]="্ব";E.ay["Ñ"]="-";E.ay["¤"]="ম্";E.ay["¯"]="স্";E.ay["š"]="ন্";E.ay["¿"]="ত্র";E.ay["ú"]="প";E.ay["œ"]="্ন";
  const fn = (s=>E.cM("bijoy",s+" ").slice(0,-1).replace(/্্/g,"্").replace(/র্দীঘ/g,"দীর্ঘ").replace(/নিযার্তন/g,"নির্যাতন").replace(/অন্র্Íগত/g,"অন্তর্গত").replace(/\u09C7\u09BE/g,"\u09CB").replace(/\u09C7\u09D7/g,"\u09CC").replace(/র্র্/g,"র্").replace(/ন্‘/g,"ন্তু").replace(/([া-ৈ])\1/g,"$1"));
  return (texts) => texts.map(fn);
}

const kids = (n, name) => [...n.childNodes].filter((c) => c.nodeType === 1 && c.localName === name);
const fontName = (r) => { const f = kids(r, "rPr")[0] && kids(kids(r, "rPr")[0], "rFonts")[0]; return (f && f.getAttributeNS(W, "ascii")) || ""; };
const isBijoy = (r) => { const n = fontName(r), t = textOf(r); return n.includes("Sutonny") || n.includes("MJ") || (n === "Vrinda" && /[‡†¨~]/.test(t)); };
// same text model as python-docx's run.text: <w:br> is a newline only when it is a text-wrapping break
const textOf = (r) => [...r.childNodes].map((c) => {
  const n = c.localName;
  if (n === "t") return c.textContent;
  if (n === "tab" || n === "ptab") return "\t";
  if (n === "cr" || (n === "br" && ["", "textWrapping"].includes(c.getAttributeNS(W, "type") || ""))) return "\n";
  return n === "noBreakHyphen" ? "-" : "";
}).join("");
const plain = (r) => [...r.childNodes].every((c) => ["rPr", "t", "tab"].includes(c.localName));

function setText(r, text) {
  [...r.childNodes].filter((c) => c.localName !== "rPr").forEach((c) => r.removeChild(c));
  for (const part of text.split(/(\t|\n|\r)/)) {
    const mark = { "\t": "w:tab", "\n": "w:br", "\r": "w:br" }[part];
    if (mark) r.appendChild(r.ownerDocument.createElementNS(W, mark));
    else if (part) {
      const t = r.ownerDocument.createElementNS(W, "w:t");
      t.setAttributeNS(XML, "xml:space", "preserve");
      t.appendChild(r.ownerDocument.createTextNode(part));
      r.appendChild(t);
    }
  }
}

function setFont(r) {
  let pr = kids(r, "rPr")[0];
  if (!pr) { pr = r.ownerDocument.createElementNS(W, "w:rPr"); r.insertBefore(pr, r.firstChild); }
  let f = kids(pr, "rFonts")[0];
  if (!f) { f = r.ownerDocument.createElementNS(W, "w:rFonts"); pr.insertBefore(f, pr.firstChild); }
  for (const a of ["ascii", "hAnsi", "cs", "eastAsia"]) f.setAttributeNS(W, "w:" + a, FONT);
}

const PARTS = /^word\/(document|header\d*|footer\d*|footnotes|endnotes)\.xml$/;

// bytes: ArrayBuffer of a .docx. Returns {blob, words}: the converted file and words worth a manual look.
async function convertDocx(bytes, engine, JSZip) {
  const zip = await JSZip.loadAsync(bytes);
  const ser = new XMLSerializer();
  const docs = [];
  for (const name of Object.keys(zip.files).filter((n) => PARTS.test(n))) {
    docs.push({ name, dom: new DOMParser().parseFromString(await zip.file(name).async("string"), "application/xml") });
  }
  const jobs = [];
  for (const { dom } of docs) {
    for (const p of [...dom.getElementsByTagNameNS(W, "p")]) {
      let prev = null; // Word splits words across runs; merge same-format runs so conjuncts aren't cut
      for (const r of kids(p, "r")) {
        const ok = isBijoy(r) && plain(r);
        const pr = kids(r, "rPr")[0], ppr = prev && kids(prev, "rPr")[0];
        if (ok && prev && ppr && pr && ser.serializeToString(ppr) === ser.serializeToString(pr)) {
          setText(prev, textOf(prev) + textOf(r));
          p.removeChild(r);
        } else prev = ok ? r : null;
      }
      let carry = "";
      for (const r of kids(p, "r")) {
        if (!isBijoy(r)) continue;
        let t = carry + textOf(r);
        carry = "";
        while (t && PRE.includes(t[t.length - 1])) { carry = t[t.length - 1] + carry; t = t.slice(0, -1); }
        jobs.push([r, t]);
      }
    }
  }
  const out = engine(jobs.map(([, t]) => t));
  jobs.forEach(([r], i) => { setText(r, out[i]); setFont(r); });
  for (const { name, dom } of docs) {
    const xml = ser.serializeToString(dom); // browsers drop the declaration, xmldom keeps it
    zip.file(name, xml.startsWith("<?xml") ? xml : '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' + xml);
  }
  const words = [...new Set(out.flatMap((u) => u.split(/\s+/)).filter((w) => w && SUSPECT.test(w)))].sort();
  return { blob: await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" }), words };
}

root.Bijoy = { makeEngine, convertDocx };
if (typeof module !== "undefined") module.exports = root.Bijoy;
})(typeof window !== "undefined" ? window : globalThis);
