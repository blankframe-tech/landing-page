# Repository Rules & Guidelines

## 1. Mandatory Telemetry & Visitor Counter Rule

Whenever a new subpage, project showcase, demo, or utility route is added to this repository (e.g., `/<new-project>/index.html`):

### A. Telemetry Tracking Tag
Every public-facing HTML page in this repository **MUST** include the GoatCounter analytics script immediately before the closing `</body>` tag:
```html
<!-- GoatCounter Analytics (Privacy-friendly, 0 cookies) -->
<script data-goatcounter="https://blankframe.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>
```

### B. Register in the Live Visit Counter Dashboard
Every subpage **MUST** appear in the live breakdown dashboard at `tools/visit-count/index.html` (`stats/` and `analytics/` only redirect there):
1. **Add Route to `PATHS` Array** in the `<script>` section of `tools/visit-count/index.html`:
   ```javascript
   { id: 'project_id', path: '/project-path/', name: 'Project Display Name' }
   ```
2. **Add Item Row Markup** in `#bft-breakdown-view`:
   Add a `.breakdown-item` card containing:
   - Rank number (e.g., `07`)
   - Category tag (e.g., `<span class="item-tag">Category</span>`)
   - Title and direct link
   - Proportion bar: `<div class="bar-fill" id="bar-project_id" style="width: 0%;"></div>`
   - Percentage label: `<span class="bar-pct" id="pct-project_id">Calculating...</span>`
   - Count value: `<div class="count-val" id="count-project_id">—</div>`
3. **Don't copy the dashboard**:
   `stats/index.html` and `analytics/index.html` are redirect stubs; leave them as they are.

Redirect stubs (a `<meta http-equiv="refresh">` page, like `throttleIQ/` or `stats/`) are the only pages without the tag.

### C. Feature on the Main Landing Page
Add a card for the new project in the **Portfolio** section of `index.html` with its rank number, category tag, description, and link to the route. Its status chip carries `data-product="<id>"` and gets its text from `products.json` (Live / Beta / Lab / Archived, with an evidence line): add the product there, then run `python3 tools/build_products.py` (`--check` fails when a chip drifts).

### D. Keep internal files off the site
Notes, agent files, drafts and scripts that aren't meant for visitors go in the `exclude` list in `_config.yml` (GitHub Pages' Jekyll pass then doesn't publish them). Claims on a page must match what shipped: label lab work as lab work.

---

## 2. Design System & Tech Standards
- **Palette and tokens**: `brand/tokens.json` is the source of truth (slate `--bg: #F8FAFC`, white `--card`, zinc `--ink: #18181B`, blue `--accent: #3B82F6`, plus dark values). After editing it, run `python3 brand/build_tokens.py`; it regenerates `brand/tokens.css`, `brand/tailwind.css`, `brand/blankframe_tokens.dart` and the tables on `/brand/`. `--check` fails if those are stale, a text pair misses WCAG AA, or the `:root` palette in `index.html` drifts from the tokens. New pages can link `/brand/tokens.css` and use the `--bf-*` variables instead of copying the palette.
- **Typography**: Inter Tight (headings), Instrument Serif italic (accents), Inter (body).
- **Architecture**: Clean, zero-build static pages compatible with GitHub Pages and custom domain `www.blankframe.tech`.
