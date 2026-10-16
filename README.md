# BlankFrame Technologies — Landing Page

The blankframe.tech site: the BlankFrame Technologies (BFT) home page plus a set of
static product, research and personal sub-sites. Plain HTML, no build step; GitHub
Pages serves it with its default Jekyll pass (`_config.yml` keeps `TODO.md` out and
`.well-known` in). A push to `main` deploys.

## What's in this repo

| Path | What |
|---|---|
| `index.html`, `404.html`, `favicon.svg`, `og-image.png` | The BFT home page (structure, styles and script in one file), the not-found page and shared assets |
| `throttle-iq/` | ThrottleIQ: product page, install page, QR routing, crash reports, `v2/` showcase. The canonical path; `throttleIQ/`, `throttle-iq-2/`, `throttleiq2/` and `thtorrleiq2/` only redirect here |
| `poredekho-vto/`, `reserve-my-tokens/`, `mac-check/`, `fret-gps/`, `itl-reserver/`, `indriyo/` | Product and project pages |
| `experiments/`, `research/` | The experiments lab section and the research pages (including the Fuel Shock proposal pages generated from the FuelPriceHikeImpactResearch repo) |
| `abraar/`, `shifa/` | Personal pages (`abraar/` is its own nested git repo) |
| `terracotta-tales/` | Redirect to Terracotta Tales |
| `visit-count/` | Live per-sub-site traffic dashboard (GoatCounter); `stats/` and `analytics/` are copies of it |
| `archived/` | The previous home page |
| `EXTRAS/` | Reference images and palettes, not linked from the site |
| `setup_previews.sh` | Creates the theme-preview git worktrees (now in `../0_archive/bft-previews/`) |
| `TODO.md` | The open trust and polish list for the home page |
| `CNAME` | Serves the repo at `www.blankframe.tech` |

**Rule for new pages** (see `AGENTS.md`): every public page includes the GoatCounter
script before `</body>` and is registered in the `visit-count/` dashboard (and its
`stats/` and `analytics/` copies).

## GitHub Pages setup (already done)

Settings → Pages: source `Deploy from a branch`, branch `main`, folder `/ (root)`,
custom domain `www.blankframe.tech`, **Enforce HTTPS** on.

## Point the Namecheap domain at GitHub Pages

In Namecheap → Domain List → `blankframe.tech` → **Manage** → **Advanced DNS**,
add:

| Type | Host | Value |
|---|---|---|
| CNAME Record | `www` | `<your-username>.github.io.` |
| A Record | `@` | `185.199.108.153` |
| A Record | `@` | `185.199.109.153` |
| A Record | `@` | `185.199.110.153` |
| A Record | `@` | `185.199.111.153` |

The four `A` records point the bare `blankframe.tech` (no `www`) at GitHub's
servers so it redirects to `www.blankframe.tech`; the `CNAME` handles the `www`
subdomain itself. Remove any existing Namecheap "Parking Page" redirect records
first, or they'll conflict.

DNS changes can take anywhere from a few minutes to 24 hours to propagate.

## Editing content

The home page's copy, colors and layout all live in `index.html`. The key spots:

- CSS custom properties at the top of the `<style>` block (`--bg`, `--fg`,
  `--secondary`, `--accent`) control the whole palette.
- Section content is plain HTML further down — search for the section `id`
  (`philosophy`, `capabilities`, `principles`, `vision`, `focus`) to find it.
- The contact email (`hello@blankframe.tech`) is in the footer — update it
  once that inbox exists, or swap it for a form.

## Notes

- No JS framework or build tool, so GitHub Pages needs no configuration.
- Respects `prefers-reduced-motion` (disables the cursor-parallax frame and
  scroll fade-ups) and keeps visible focus outlines for keyboard navigation.
- Fonts (Space Grotesk + Inter) load from Google Fonts via CDN; everything
  else is self-contained.
