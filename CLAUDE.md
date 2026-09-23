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
- **Session 49 (2026-09-23) — LIVE:** Home masthead types **CODES → COOKS → TRADES** (hand-built `TypewriterLine` in `Home.js`); the 5 section landings (Finance/Trading/Tools/Cooking/Contact) now wear the redesign via shared `common/SectionHeader.js` + `card-skin`/`tile-skin`; Cooking cards open with **colour-enhanced 4:3 covers** (`public/images/cooking/covers/`, made by `scripts/make_cooking_covers.py`); sitemap = **25 URLs**; site **registered + verified in Google Search Console** (HTML-tag meta in `public/index.html` — NEVER remove); all deps **pinned exact**.
- **Dual-Personality redesign — ✅ SHIPPED & LIVE (Session 48, 2026-08-04):** the light/dark toggle is a full personality switch — light = neo-brutalist **Playground** (cream/black, **teal `#0891B2`** CTA), dark = glass **Laboratory** (deep-space/cyan). RD-1→RD-6 (design tokens `src/styles/tokens.css`+`motion.js`, anti-flash + 600ms morph, shell, "SRINIDHI VOL.01" Home, landing graceful-inherit, ship-hardening) all **live on Vercel**. Component "skins" in `src/styles/index.css`. Design doc: `~/.claude/plans/srinidhibs.com/radical-redesign-dual-personality.md`. Merged cleanly with origin's **Ogatu game** (preserved at `/ogatu/`); **`origin == local`**. Deferred (TODO_FUTURE): landing tile-grid + tool/calculator token migration, brand refresh, showpiece layer.
- **PDF Merger enhanced (Session 45) — PUSHED & LIVE:** the Merger now accepts **JPG/PNG** alongside PDFs (each image embedded as a fitted A4 page) **and** has a **unified cross-file page grid** — every page of every file is one draggable tile; drag any page anywhere (e.g. an image between two PDF pages); the merge follows the grid order. Per-page select + per-file remove preserved. Commits `989eaac1` + `c737d27f` (only `src/components/tools/pdf-merger/PDFMerger.js`) + docs `de0fe1ba`, pushed to origin → Vercel. User live-verified "works as intended."
- **Learn gate (Session 44) + Cooking section & SEO (Session 43): LIVE.** All pushed (origin == local at `041d4fe6` as of Session-45 start; the earlier "push held" notes were stale — the user had pushed intentionally). `public/learn/` is a COPY of `teach-pannaga` — re-copy on lesson updates.
- Phase 9 (Income Tax FY 2026-27) complete from Session 42.

## Session Status
**Last Updated:** 2026-09-23 (Lenovo)
**Last Session:** Session 49 — typewriter masthead (`a42377a7`), sitemap +9 URLs (`43b75a9b`), Search Console property + verification tag (`2664ad3f`, sitemap read: Success/25), deps pinned (`6627eef0`), **landing restyle 1A** (`6f3a13d4`), Cooking card photos + kurma pan shot + enhanced covers (`aa940509`/`f612f40f`/`da0f7bb5`). All pushed; Vercel deployed. **143/143 tests, CI=true build clean.** `origin == local`.
**Next Session Action:** Pick from TODO_FUTURE — Finance/Tools tiles → real `<Link>`s (keyboard + crawlable), darker text-safe finance green, recipe-page `<h1>`, then prerendering (the big SEO/AI-crawler unlock). Trading page needs Srinidhi's own notes (content, not code).
NOTES: host = **Vercel** (push = live, needs explicit go-ahead); tests `CI=true npm test -- --watchAll=false`; ALWAYS `CI=true npm run build` before shipping; preview pane hidden ⇒ Framer fade-ins freeze at opacity 0 (preview artefact, not a bug).
