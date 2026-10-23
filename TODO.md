# Landing page TODO

Trust and professionalism pass on `index.html`. Benchmark: https://li.fi, which earns trust with proof, a clear offer and the signs of a working company. Copy the structure, not the scale, and never invent numbers.

## 1. Say what we sell (hero)
- [x] **Approved 2026-10-16, live since `134284b`:** H1 is now "AI software and edge hardware, built and tested in Bangladesh." The tagline moved to the small line under the buttons.
  Original item: Rewrite the H1 so it names what we build and for whom. "We build the frame. You create what matters." is a tagline, not an offer.
- [x] **Approved 2026-10-16, live since `134284b`:** the subhead names the four products. The rest of the page's "cognitive load / invisible" wording is unchanged.
  Original item: Make the subhead concrete: name the product types and the user. Cut the repeated "cognitive load / invisible / ambient / quiet" wording across the page.

## 2. Show proof above the fold
- [x] Add a strip of real numbers under the hero, e.g. ThrottleIQ km or testers, the r1_Fuel 1,996-article corpus, Terracotta Tales ৳2.5L. They're buried in cards 05 and 07 today. _(2026-10-24: four figures already on the site: 1,996 articles and 5 costed study designs (r1_Fuel, `research/`), 30 checks (the MacBook checker's rendered checklist; its static "0 of 28" placeholder is stale), ৳2.5L (Terracotta Tales, labelled as a collaborator). **Owner:** no ThrottleIQ km, rider or tester totals exist in the repo; add one to the strip when you have a real figure.)_
- [ ] Get one or two named quotes (name + role) from ThrottleIQ beta riders or MacBook Checker users.

## 3. Focus the portfolio
- [x] **Approved 2026-10-16, live since `134284b`:** both moved to a "From our collaborators" card under the products.
  Original item: Move Terracotta Tales and the beekeeping fieldwork (both Farzana Reza Shifa's) to a "Collaborators" section, or drop them. Today they blur whether BlankFrame is a company or a group of friends.
- [x] **Approved 2026-10-16, live since `134284b`:** the Ambient Systems card is removed.
  Original item: Remove "Ambient Systems: In build" or give it a link. A card with no link reads as vaporware.
- [x] **Approved 2026-10-16, live since `134284b`:** "Currently building" and "We're early" removed; ThrottleIQ's stale "Beta v2.2" chip now says "Android app" (its README says beta 4.7.1). "Early-stage" stays on the lab card only.
  Original item: Tone down the "early" signals ("Currently building", "We're early", "Beta", "In build"). Keep one at most.

## 4. Show that a company is behind it
- [ ] Add the founder's name, photo and a one-line bio.
- [ ] Footer: GitHub, LinkedIn, X, plus Privacy (and Terms if we collect anything). Today it's only © and a mailto. _(2026-10-24: GitHub added, linking the `blankframe-tech` org that ThrottleIQ, Indriyo, ITL-Reserver and this repo live under. **Owner, still open:** no company LinkedIn or X account appears in this repo or `ai-job-search-Abraar` (the only LinkedIn URLs are personal, and they disagree: `in/abraar73` on `/abraar/`, `in/abraar3` in the CV repo); there is no privacy page. Supply the URLs, or the privacy text (GoatCounter, no cookies; tools run in the browser), and they go in the footer.)_
- [ ] Consider an About page and a changelog or "What's new" link.

## 5. Clear next step
- [x] **Approved 2026-10-16, live since `134284b`:** hero and footer use "Work with us" (mailto with a subject); the address stays as a second button in the footer.
  Original item: Replace the bare mailto CTA with an explicit action ("Book a call", "Try ThrottleIQ", "Work with us"). Keep the email as a secondary link.

## 6. Polish
- [x] Add `og:image` (and `twitter:card`) so shared links show a preview card. _(2026-10-15: `/og-image.png`, 1200x630, built from the brand mark; `summary_large_image`.)_
- [x] Replace the inline SVG-square favicon with the real logo. _(2026-10-15: no separate logo file exists in the repo; the square mark is the logo, so it now lives in `/favicon.svg` and `index.html` links it. Other pages still inline it.)_
- [x] Clean up the duplicate public folders: `throttleIQ/`, `throttle-iq/`, `throttle-iq-2/`, `throttleiq2/`, `thtorrleiq2/` (typo). Pick one, redirect or remove the rest. _(2026-10-15: canonical is `/throttle-iq/`, which the app, QR routing and 404 use. The v2 showcase moved from `/thtorrleiq2/` to `/throttle-iq/v2/`. `thtorrleiq2/`, `throttleiq2/` and `throttle-iq-2/` redirect there; `throttleIQ/` redirects to `/throttle-iq/`.)_
- [x] Review the page rendered in a browser at desktop and phone width; this list came from the HTML only. _(2026-10-22: live page in headless Chrome at 375x812 and 1280x900 after scrolling every section into view: no horizontal overflow, 0 page errors, cards and buttons fit. Not seen on a real phone. The philosophy and capabilities sections still use the "invisible / cognitive load" wording from item 1.)_
