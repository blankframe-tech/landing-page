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
Every subpage **MUST** appear in the live breakdown dashboard at `visit-count/index.html` (as well as its aliases `stats/index.html` and `analytics/index.html`):
1. **Add Route to `PATHS` Array** in the `<script>` section of `visit-count/index.html`:
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
3. **Keep Aliases Synced**:
   Copy the updated `visit-count/index.html` to `stats/index.html` and `analytics/index.html`.

### C. Feature on the Main Landing Page
Add a card for the new project in the **Portfolio** section of `index.html` with its rank number, category tag, description, and link to the route.

---

## 2. Design System & Tech Standards
- **Palette**: Warm paper background (`--bg: #F2F1ED`), solid cards (`--card: #FFFFFF`), dark ink (`--ink: #131313`), and orange accent (`--accent: #FF4A1F`).
- **Typography**: Inter Tight (headings), Instrument Serif italic (accents), Inter (body).
- **Architecture**: Clean, zero-build static pages compatible with GitHub Pages and custom domain `www.blankframe.tech`.
