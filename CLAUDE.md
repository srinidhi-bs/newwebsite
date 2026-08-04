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
- **Dual-Personality redesign — ✅ SHIPPED & LIVE (Session 48, 2026-08-04):** the light/dark toggle is a full personality switch — light = neo-brutalist **Playground** (cream/black, **teal `#0891B2`** CTA), dark = glass **Laboratory** (deep-space/cyan). RD-1→RD-6 (design tokens `src/styles/tokens.css`+`motion.js`, anti-flash + 600ms morph, shell, "SRINIDHI VOL.01" Home, landing graceful-inherit, ship-hardening) all **live on Vercel**. Component "skins" in `src/styles/index.css`. Design doc: `~/.claude/plans/srinidhibs.com/radical-redesign-dual-personality.md`. Merged cleanly with origin's **Ogatu game** (preserved at `/ogatu/`); **`origin == local`**. Deferred (TODO_FUTURE): landing tile-grid + tool/calculator token migration, brand refresh, showpiece layer.
- **PDF Merger enhanced (Session 45) — PUSHED & LIVE:** the Merger now accepts **JPG/PNG** alongside PDFs (each image embedded as a fitted A4 page) **and** has a **unified cross-file page grid** — every page of every file is one draggable tile; drag any page anywhere (e.g. an image between two PDF pages); the merge follows the grid order. Per-page select + per-file remove preserved. Commits `989eaac1` + `c737d27f` (only `src/components/tools/pdf-merger/PDFMerger.js`) + docs `de0fe1ba`, pushed to origin → Vercel. User live-verified "works as intended."
- **Learn gate (Session 44) + Cooking section & SEO (Session 43): LIVE.** All pushed (origin == local at `041d4fe6` as of Session-45 start; the earlier "push held" notes were stale — the user had pushed intentionally). `public/learn/` is a COPY of `teach-pannaga` — re-copy on lesson updates.
- Phase 9 (Income Tax FY 2026-27) complete from Session 42.

## Session Status
**Last Updated:** 2026-08-04 (Lenovo)
**Last Session:** Session 48 — **SHIPPED the Dual-Personality redesign live.** Finished the last redesign steps in-thread (RD-5 `4024b06b`, RD-6 `283d74fc`), recolored the Playground CTA pink→**teal `#0891B2`** (`f3adc66c` — a *bluer* teal so it separates from the finance-green tool chips), `git fetch` + clean `git merge origin/master` to fold in the Ogatu game (`5303b168`, no conflicts — disjoint file sets), fixed the masthead (`4f8782dd`: `13vw`→`8vw` so "ACCOUNTANT" stops breaking mid-word on desktop at 100% zoom — the 80% local browser zoom had masked it), and pushed → Vercel deployed. **139/139 tests, CI=true build clean.** `origin == local`.
**Next Session Action:** Nothing blocked; site fully live. Best next = the **landing restyle** (Finance/Trading/Tools/Cooking/Contact + tool/calc pages adopt `card-skin`/`text-ink`/`accent-*` — the seams RD-5 deferred). Cheap SEO win: add the 4 **`/cooking` URLs to `public/sitemap.xml`** (still missing).
NOTES: host = **Vercel** (push = live, needs explicit go-ahead); tests via `CI=true npm test -- --watchAll=false`; ALWAYS `CI=true npm run build` before shipping (Vercel = warnings-as-errors); TODO_CURRENT was trimmed into TODO_COMPLETED this session.
