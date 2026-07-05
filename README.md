# BlankFrame Technologies — Landing Page

A single-file, static "coming soon" landing page for BlankFrame Technologies (BFT),
built from the company vision and website design docs. No build step, no dependencies
beyond Google Fonts — just `index.html`.

## What's in this repo

- `index.html` — the entire site (structure, styles, and script in one file)
- `CNAME` — tells GitHub Pages to serve this repo at `www.blankframe.tech`

## Deploy with GitHub Pages

1. Create a new GitHub repo (e.g. `blankframe-site`) and push these files to the
   `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Initial landing page"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`,
   branch `main`, folder `/ (root)`. Save.
4. Under **Custom domain**, enter `www.blankframe.tech` and save (this writes
   the same value already in the `CNAME` file — GitHub will pick it up either way).
5. Check **Enforce HTTPS** once the certificate is issued (can take a few minutes
   to a few hours after DNS is verified).

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

Everything — copy, colors, layout — lives in `index.html`. The key spots:

- CSS custom properties at the top of the `<style>` block (`--bg`, `--fg`,
  `--secondary`, `--accent`) control the whole palette.
- Section content is plain HTML further down — search for the section `id`
  (`philosophy`, `capabilities`, `principles`, `vision`, `focus`) to find it.
- The contact email (`hello@blankframe.tech`) is in the footer — update it
  once that inbox exists, or swap it for a form.

## Notes

- No JS framework or build tool — matches "static export compatible" from the
  design brief and keeps GitHub Pages deployment to zero configuration.
- Respects `prefers-reduced-motion` (disables the cursor-parallax frame and
  scroll fade-ups) and keeps visible focus outlines for keyboard navigation.
- Fonts (Space Grotesk + Inter) load from Google Fonts via CDN; everything
  else is self-contained.
