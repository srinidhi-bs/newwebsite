# Session 47 — Cooking: soya chunk & peas coconut kurma recipe page

**Date:** 2026-08-04
**Machine:** Lenovo ThinkPad P14s
**Duration:** Short website session, at the tail of a long cooking session in the separate
`srinidhi-cooks` project (the dish was cooked and photographed the same afternoon).
**Focus:** Add a third recipe page to the Cooking section.

## What was built

A new recipe page at `/cooking/soya-kurma` documenting a soya chunk and green peas kurma built on
a **roasted coconut base instead of tomato** — because there were no tomatoes in the house.

Commits (both LOCAL, push held):
- `91511b07` feat(cooking): add the soya chunk & peas coconut kurma recipe
- `a0e10af3` fix(cooking): correct a photo reference direction on the kurma page

### The six touch points (the reusable checklist for recipe #4)
1. `src/components/pages/CookingSoyaKurma.js` — new, content-only
2. `src/components/layout/AnimatedRoutes.js` — lazy import + `<Route>`
3. `src/components/common/Breadcrumbs.js` — `ROUTE_LABELS` entry
4. `src/config/seoConfig.js` — route entry + Recipe JSON-LD (22 ingredients, 12 steps)
5. `src/components/pages/Cooking.js` — one `RECIPES` object, first in the array (newest first)
6. `public/images/cooking/s3_*.jpg` — 16 pre-resized photos

The page uses `Callout` and `Aside` from `RecipeBits` — the pizza page doesn't, the roasted-veg page
does. They carry the two moments that actually decided the dish, which is what a reader learns from.

## Findings & decisions

### 1. The docs were stale about the redesign — again
Session 46's carryover listed **RD-5 and RD-6 as still open**. `git log` shows both landed the same
evening (`4024b06b`, `283d74fc`), plus a 2026-07-02 CLAUDE.md audit. The redesign is **code-complete
on local master**; only the real-browser walkthrough and the push remain. Corrected in TODO_CURRENT
and PROJECT_PHASES this session.

This is the *second* time (Session 45 saw the same thing with "push held") that the notes were behind
the repo. **Trust `git log` over the prose at session start.**

### 2. EXIF orientation would have shipped sideways photos
The phone photos are stored **landscape 4000×2252 with EXIF orientation tag 6** — i.e. they are meant
to display rotated, as portrait. The site renders photos with a plain `<img>` and no orientation
handling, so the tag's behaviour is browser-dependent.

Fix: `ImageOps.exif_transpose()` to bake the rotation into the pixels, then re-encode without the tag.
Verified by re-reading two written files, not by trusting the metadata. Same resize convention as the
existing photos: longest edge 1000 px, JPEG q85, landed at 85–177 KB (existing band is 52–234 KB).

### 3. `Section` puts photos BELOW its prose
`/review_gstack` caught an aside pointing at "photo three above." `Section` renders
`{children}` and *then* `<PhotoGrid>`, so a section's photos are always below its text. Fixed to
"third photo below." Worth remembering when writing any future recipe page.

### 4. Per-page SEO doesn't apply in the headless preview
`document.title` empty, canonical = homepage, zero JSON-LD nodes. **Checked the existing, live
moringa-pizza page and it behaves identically** — so this is the known CSR ceiling, not a regression.
The differential test is what made that conclusion safe rather than a guess.

## Verification
- **139/139 tests** green (before and after the review fix)
- **Production build clean** (`craco build`, Vercel-equivalent)
- Page renders, breadcrumbs resolve, **zero console errors**
- All 16 images fetched **200 / image-jpeg**, 2.08 MB total
- **No horizontal overflow**
- Landing page tiles in correct newest-first order

## Carryover / hazards
- ⚠ **`master` is ahead 10 / behind 6 vs `origin/master`, and the last fetch was 28 Jun 2026** — the
  "behind" count is stale. `git fetch` before doing anything. Merge origin, **never force-push**
  (origin carries the Ogatu game + `/ogatu` redirect).
- The redesign ship decision is the real next task; the kurma page just rides along in that push.
- `public/sitemap.xml` has **no /cooking URLs at all** — filed in TODO_FUTURE.
- `TODO_CURRENT.md` is now 240+ lines against a 200-line cap, and is mostly completed history.
  A move-to-`TODO_COMPLETED.md` pass is overdue (not done this session — it would have been a large
  unrequested change).
- `FUNCTION_MAP.md` was missing the cooking pages entirely; all four added this session.
