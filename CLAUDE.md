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
- `npm run build`: Build for production (then `scripts/write-share-pages.mjs` writes per-page share "envelopes" `build/<route>/index.html` from `seoConfig.js` — a new page's WhatsApp preview = its seoConfig entry, incl. `ogImage`)
- `npm run analyze`: Visualize bundle chunks (requires build first)
- ⚠ Tests fail with `Cannot find module '../build/Release/canvas.node'` after any `npm install`? npm's `ignore-scripts=true` leaves `canvas` unbuilt → `rm -rf node_modules/canvas` (jsdom then skips it; the site never uses it). Decided 2026-09-26: remove, don't build.

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
- **Session 50 (2026-09-26) — "Investing, from zero" (LIVE — Sitting 1):** story-game at `/trading/investing-from-zero` teaching first-time investors. Engine in `src/components/investing/` (StoryPlayer + beat types narration/guess/choice/split/basket, `storyProgress` localStorage + `useStoryProgress`, `storyText` {placeholders} via `derive(answers)`), notebook-sketch `LevelMap` (home screen), content in `src/content/investing/en/` (sittings.js order; sitting1.js done; 2-7 stubs). Design doc `~/.claude/plans/srinidhibs.com/investing-from-zero.md`. Reader pages: no sources/cities/dates (audit trail in code comments).
- **Session 49 (2026-09-23) — LIVE:** Home masthead types **CODES → COOKS → TRADES** (hand-built `TypewriterLine` in `Home.js`); the 5 section landings (Finance/Trading/Tools/Cooking/Contact) now wear the redesign via shared `common/SectionHeader.js` + `card-skin`/`tile-skin`; Cooking cards open with **colour-enhanced 4:3 covers** (`public/images/cooking/covers/`, made by `scripts/make_cooking_covers.py`); sitemap = **25 URLs**; site **registered + verified in Google Search Console** (HTML-tag meta in `public/index.html` — NEVER remove); all deps **pinned exact**.
- **Dual-Personality redesign — ✅ SHIPPED & LIVE (Session 48, 2026-08-04):** the light/dark toggle is a full personality switch — light = neo-brutalist **Playground** (cream/black, **teal `#0891B2`** CTA), dark = glass **Laboratory** (deep-space/cyan). RD-1→RD-6 (design tokens `src/styles/tokens.css`+`motion.js`, anti-flash + 600ms morph, shell, "SRINIDHI VOL.01" Home, landing graceful-inherit, ship-hardening) all **live on Vercel**. Component "skins" in `src/styles/index.css`. Design doc: `~/.claude/plans/srinidhibs.com/radical-redesign-dual-personality.md`. Merged cleanly with origin's **Ogatu game** (preserved at `/ogatu/`); **`origin == local`**. Deferred (TODO_FUTURE): landing tile-grid + tool/calculator token migration, brand refresh, showpiece layer.
- **PDF Merger enhanced (Session 45) — PUSHED & LIVE:** the Merger now accepts **JPG/PNG** alongside PDFs (each image embedded as a fitted A4 page) **and** has a **unified cross-file page grid** — every page of every file is one draggable tile; drag any page anywhere (e.g. an image between two PDF pages); the merge follows the grid order. Per-page select + per-file remove preserved. Commits `989eaac1` + `c737d27f` (only `src/components/tools/pdf-merger/PDFMerger.js`) + docs `de0fe1ba`, pushed to origin → Vercel. User live-verified "works as intended."
- **Learn gate (Session 44) + Cooking section & SEO (Session 43): LIVE.** All pushed (origin == local at `041d4fe6` as of Session-45 start; the earlier "push held" notes were stale — the user had pushed intentionally). `public/learn/` is a COPY of `teach-pannaga` — re-copy on lesson updates.
- Phase 9 (Income Tax FY 2026-27) complete from Session 42.

## Session Status
**Last Updated:** 2026-09-26 night (Lenovo)
**Last Session:** Session 51 — L1 launch plumbing for "Investing, from zero": Trading card (leads the page), sitemap (26 URLs), notebook share image (`scripts/make_share_image.py`), and **per-page share envelopes** — `scripts/write-share-pages.mjs` runs after `craco build` and writes `build/<route>/index.html` with each seoConfig page's own OG tags, so WhatsApp previews show the right title + picture (cooking dish photos too). `a426fae5`, `f83a71bb`. **178/178 tests, CI build clean, PUSHED & LIVE, WhatsApp-verified.** S2 research done by a background agent.
**Next Session Action:** S2 "Where can money live?" — read `~/.claude/plans/srinidhibs.com/research/s2_where_money_lives_research.md`, then storyline options → Srinidhi picks → build. See TODO_CURRENT brief.
NOTES: host = **Vercel** (push = live, needs explicit go-ahead); tests `CI=true npm test -- --watchAll=false`; ALWAYS `CI=true npm run build` before shipping; preview pane ⇒ Framer fade/exit animations freeze (verify via DOM, not screenshots); a missing file on the live site returns 200 + index.html (catch-all rewrite) — check content-type, not status.
