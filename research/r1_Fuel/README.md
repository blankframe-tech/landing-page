# r1_Fuel — research site

Public site for the **Bangladesh 2026 fuel shock** research programme, served at
<https://www.blankframe.tech/research/r1_Fuel/>.

Research source of truth: the private `FuelPriceHikeImpactResearch` repository (the site links to
nothing in it). This directory is the published surface of that work, not a second copy of it.

## Routes

| Route | Page | Source |
|---|---|---|
| `/research/r1_Fuel/` | Overview — the shock, the five things the headline misses, the loop, the calendar, the programme | `src/home.js` |
| `/research/r1_Fuel/findings/` | The full impact analysis | `content/analysis.md` |
| `/research/r1_Fuel/proposal/` | Research questions and the five study designs | `content/proposals.md` |
| `/research/r1_Fuel/collaborate/` | Five open roles, the field, terms and ethics | `src/collaborate.js` |
| `/research/r1_Fuel/support/` | Short note: the programme is independently funded | `src/support.js` |
| `/research/r1_Fuel/data/` | What is built, conventions, P4 corpus and its validation failures | `src/data.js` |
| `/research/r1_Fuel/data/log/` | The full audit trail | `content/audit_log.md` |
| `/research/r1_Fuel/status/` | Phase, critical path, public changelog | `src/status.js` |

## Correction of 8 November 2026

The analysis was checked against its sources after publication. The site now carries a dated
correction notice (`CORRECTION` in `src/shell.js`) on the overview, the analysis and the audit log, and:

- the cross-country affordability band and the shares against an unsourced average salary and median
  income are removed from `content/analysis.md`, `content/audit_log.md`, `src/home.js` and `src/charts.js`;
- pay-scale coverage reads about 24 lakh serving employees plus about 9.25 lakh retirees and other
  beneficiaries (also in the static `proposal/p4/` and `proposal/p6/` pages);
- the illustrated PDF, the frame-coded CSVs and the frame-share figure under `p4_discourse/out/` are
  withdrawn until the PDF is corrected and two human coders have validated the frames;
- the funding tiers and every fixed October deadline are gone; `/support/` says the programme is
  independently funded, and the baseline is timed to the next fuel-price event.

`build_site.js` refuses to write a page that contains any withdrawn claim (the `WITHDRAWN` pattern),
so a re-sync from the research repo cannot quietly bring them back. Re-syncing `content/*.md` will
fail the build until the research repo's text is corrected too; fix the text, do not loosen the pattern.

## Build

```bash
npm install          # marked, the only dependency
node build_site.js   # writes the static HTML in place
```

Output is plain static HTML. Nothing in the published site needs a build step,
a framework or a CDN at run time; the only external requests a visitor makes are
Google Fonts and the GoatCounter tag.

- `assets/site.css` — the whole design system, built on the BlankFrame tokens
  (warm paper `#F2F1ED`, ink `#131313`, accent `#FF4A1F`, Inter Tight / Inter /
  Instrument Serif).
- `src/shell.js` — head, nav, footer, per-page metadata.
- `src/charts.js` — every figure, rendered to inline SVG at build time. Single-series
  magnitude charts use the house accent against neutral ink; the one categorical pair
  available is `#FF4A1F` / `#1B6FD4`, which clears the lightness, chroma, CVD,
  normal-vision and contrast checks.
- `content/*.md` — copies of the research repo's markdown. Re-sync with:

```bash
SRC=../../../FuelPriceHikeImpactResearch
cp "$SRC/README.md"               content/analysis.md
cp "$SRC/research_proposals.md"   content/proposals.md
cp "$SRC/reseach_pass_1.md"       content/audit_log.md
rsync -a --delete --exclude data --exclude __pycache__ \
      --exclude 'out/*.csv' --exclude 'out/frames_by_period.png' \
      "$SRC/p4_discourse/" p4_discourse/
node build_site.js
```

## Conventions that must hold

- **No personal email addresses in published HTML.** The collaborator list in the
  research repo carries contact details gathered from institutional pages; the site
  links the institutional profile instead. Do not republish the addresses here.
- **Derived figures carry the `est.` marker** and their method is shown. Anything
  unmarked must be traceable to a cited source.
- **Limitations are published alongside the outputs.** The data page states where
  the corpus is biased and where the classifier fails; that is deliberate and should
  survive edits.
- Every page carries the GoatCounter tag, and `/research/r1_Fuel/` is registered in
  `tools/visit-count/`, `stats/` and `analytics/` per the repository rules in `AGENTS.md`.
