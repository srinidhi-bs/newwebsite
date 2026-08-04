# Project: Srinidhi BS Personal Website

## Overview
React-based personal website showcasing informational content and PDF utility tools.
Styled with TailwindCSS.

## Architecture
- **Frontend**: React (Create React App)
- **Styling**: TailwindCSS
- **Routing**: React Router
- **PDF Processing**: pdf-lib, pdfjs-dist, qpdf-wasm (client-side)

## Build & Run
- `npm start`: Run dev server
- `npm test`: Run tests
- `npm run build`: Build for production
- `npm run analyze`: Visualize bundle chunks (requires build first)

## Key Features
- Informational pages (Home, Finance, Trading)
- PDF Tools (Merge — accepts PDF + JPG/PNG with a unified drag-reorder page grid, Split, PDF↔JPG conversion, PDF Resizer, PDF Unlock, PDF Lock, PDF Rearrange, PDF Page Numbers)
- Dark mode support
- Responsive design
- **Animations**: Framer Motion integration
- **SEO**: react-helmet-async for per-page meta tags, Open Graph, Twitter Cards, JSON-LD structured data, sitemap.xml, 404 page
- **Navigation**: Breadcrumb navigation (auto-generated from route, JSON-LD BreadcrumbList)
- **Error Handling**: Global + route-level error boundaries with friendly fallback UI
- **Performance**: Core Web Vitals monitoring, optimized caching headers

## Current Focus
- **Radical Redesign — "Dual Personality" (Session 46), IN PROGRESS, LOCAL ONLY — do NOT push (push = deploy the unfinished redesign live):** the light/dark toggle becomes a full personality switch — light = neo-brutalist **Playground**, dark = glass **Laboratory**. RD-1 design tokens (`src/styles/tokens.css` + `motion.js`, Tailwind mapping, @fontsource fonts), RD-2 anti-flash script + cross-personality morph, RD-3 shell (nav/footer/toggle), RD-4 Home ("SRINIDHI VOL.01" editorial) — all committed on **local master** (`c8f54c4a` + earlier). Component "skins" in `src/styles/index.css`. Design doc: `~/.claude/plans/srinidhibs.com/radical-redesign-dual-personality.md`. **Update (found in 2026-07-02 audit): RD-5 (`4024b06b`) and RD-6 ship-hardening (`283d74fc`) were ALSO committed on 2026-06-28 evening, after the Session-46 wrap** — the redesign is code-complete on local master; what remains is merge-with-origin → real-browser verify → push (= deploy, only with explicit go-ahead). **139/139 tests.**
- **PDF Merger enhanced (Session 45) — PUSHED & LIVE:** the Merger now accepts **JPG/PNG** alongside PDFs (each image embedded as a fitted A4 page) **and** has a **unified cross-file page grid** — every page of every file is one draggable tile; drag any page anywhere (e.g. an image between two PDF pages); the merge follows the grid order. Per-page select + per-file remove preserved. Commits `989eaac1` + `c737d27f` (only `src/components/tools/pdf-merger/PDFMerger.js`) + docs `de0fe1ba`, pushed to origin → Vercel. User live-verified "works as intended."
- **Learn gate (Session 44) + Cooking section & SEO (Session 43): LIVE.** All pushed (origin == local at `041d4fe6` as of Session-45 start; the earlier "push held" notes were stale — the user had pushed intentionally). `public/learn/` is a COPY of `teach-pannaga` — re-copy on lesson updates.
- Phase 9 (Income Tax FY 2026-27) complete from Session 42.

## Session Status
**Last Updated:** 2026-08-04 (Lenovo)
**Last Session:** Session 47 — added the third Cooking recipe page, `/cooking/soya-kurma` (soya chunk & peas coconut kurma), built from the same-day cook logged in the separate `srinidhi-cooks` project. Content-only page on the `RecipeBits` pattern + the 4 standard registrations + 16 resized photos. Commits `91511b07` and `a0e10af3` (a `/review_gstack` fix: `Section` renders photos BELOW its prose, so an aside pointing "above" was wrong). Photos had **EXIF orientation tag 6** — baked in and stripped, else they render sideways under the site's plain `<img>`. **139/139 tests, production build clean, no console errors, all 16 images 200.** Per-page SEO tags don't apply in the headless preview — verified identical on the live pizza page, so it's the known CSR ceiling, not a regression.
**Doc correction:** RD-5 (`4024b06b`) and RD-6 ship-hardening (`283d74fc`) are **done** — the redesign is code-complete on local master. Second time the notes lagged the repo; trust `git log` at session start.
**Next Session Action:** **`git fetch origin` first** — `master` is ahead 10 / behind 6 against a fetch from 28 Jun 2026, so the divergence is unknown. Then merge `origin/master` (**never force-push** — origin has the Ogatu game + `/ogatu` redirect), re-run tests, do the outstanding **real-browser** walkthrough (theme-morph + pdf.js don't work in the Claude preview), and push ONLY with Srinidhi's explicit go-ahead (push = live Vercel deploy). The kurma page ships in that same push.
NOTES: host = **Vercel** (push = live); tests via `npm test -- --watchAll=false`; `public/sitemap.xml` still has NO /cooking URLs (TODO_FUTURE); `TODO_CURRENT.md` is over its 200-line cap and needs a move-to-TODO_COMPLETED pass.
