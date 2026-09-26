# Session 51 — L1 launch plumbing: Trading card, share image, per-page share envelopes

**Date:** 2026-09-26 (Lenovo), ~22:18–23:15 IST
**Headline:** "Investing, from zero" is now properly launchable: a card leads the Trading page, the sitemap lists it, and a WhatsApp link shows its own title + notebook picture. **PUSHED & LIVE, WhatsApp-verified by Srinidhi.** 178/178 tests, `CI=true` build clean.

## The finding that shaped the task
Adding an `ogImage` alone would NOT have fixed WhatsApp. The site is client-side rendered: every URL gets `index.html`, and WhatsApp's preview bot doesn't run JavaScript, so it only ever saw the homepage's tags + React logo. Even the cooking pages' dish `og:image`s never reached WhatsApp (already a known TODO_FUTURE item).

## Decisions (with Srinidhi)
- **A — "labelled envelope per page"** (chosen over B: this page only; C: react-snap prerendering; D: just a better site-wide default image). A post-build script writes a copy of `build/index.html` per seoConfig route with that page's tags swapped in.
- **i — notebook-style share card** drawn by a script (over a map screenshot).
- The card sits **above** the Fundamental/Technical cards (Srinidhi's call after seeing it below).

## What shipped
- `a426fae5` — Trading card (`<Link>`, card-skin/tile-skin, notebook image) + `Trading.test.js`; sitemap URL; `seoConfig` ogImage; `scripts/make_share_image.py` (Caveat + JetBrains Mono woff read by Pillow, 2× supersampled, map inks); `scripts/write-share-pages.mjs` wired into `"build"`.
- `f83a71bb` — card moved above the analysis cards.
- Script safety: skips `/` and `/404`, never overwrites an existing file (ogatu, learn), self-checks every file; loads the ES-module `seoConfig.js` via a `data:` URL import (no duplicate config). Review auto-fix: function replacers so a `$` in text can't be read as a regex code.

## Verification
- Local: diff of envelope vs `index.html` = only the intended tags + an added `<title>`. Card: DOM checks at 1280 / 375 / dark (preview pane hidden → screenshots unreliable).
- Live: bot-UA curl → investing page, soya-kurma, pdf-merger, trading all carry their own og:title/og:image; `/`, unknown URLs keep homepage defaults; `/ogatu/` + `/learn/` intact; real browser loads the game with no console errors. Srinidhi's WhatsApp desktop preview: title, description, notebook picture ✅.

## Lessons
- **A missing file on the live site returns 200** (the vercel.json catch-all serves index.html). My first "is the deploy live?" check was fooled — it got a 2 KB HTML page for the PNG. Check `content-type` (or GitHub's Vercel commit status), not the status code.
- Vercel serves `build/<route>/index.html` for `/<route>` before the catch-all rewrite (predicted from the bare `/ogatu` behaviour, now proven).
- The web-font LATIN subsets lack symbols like → (drew as boxes in Pillow) — stick to plain punctuation.
- WhatsApp desktop crops previews to a centre square (optional redraw in TODO_FUTURE).

## Background
- S2 research agent launched (returns since 2000: savings a/c, FD, PPF, gold, real estate, equity, debt; two sources each) → `~/.claude/plans/srinidhibs.com/research/s2_where_money_lives_research.md`.
