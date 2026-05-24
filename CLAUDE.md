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
- PDF Tools (Merge, Split, PDF↔JPG conversion, PDF Resizer, PDF Unlock, PDF Lock, PDF Rearrange, PDF Page Numbers)
- Dark mode support
- Responsive design
- **Animations**: Framer Motion integration
- **SEO**: react-helmet-async for per-page meta tags, Open Graph, Twitter Cards, JSON-LD structured data, sitemap.xml, 404 page
- **Navigation**: Breadcrumb navigation (auto-generated from route, JSON-LD BreadcrumbList)
- **Error Handling**: Global + route-level error boundaries with friendly fallback UI
- **Performance**: Core Web Vitals monitoring, optimized caching headers

## Current Focus
- **Cooking section SHIPPED & LIVE (Session 43):** `/cooking` recipe hub + `/cooking/moringa-pizza` + `/cooking/roasted-veg`, a Home "Cooking Adventures" tile, breadcrumbs, per-page SEO, and comedic "5-star menu" cards — all on shared `src/components/cooking/RecipeBits.js`.
- **Staged, NOT pushed:** an SEO structured-data follow-up in `seoConfig.js` (complete Recipe JSON-LD + per-page `og:image` for both recipes) — awaits an explicit ship (push = deploy).
- Phase 9 (Income Tax FY 2026-27) remains complete from Session 42.

## Session Status
**Last Updated:** 2026-05-24
**Last Session:** Session 43 — Built the Cooking section from the separate `srinidhi-cooks` cooking-journal content: a recipe-hub landing + two illustrated recipe pages (moringa-pesto pizza; steam-roasted veg + khichdi) on shared `RecipeBits` components, 40 web photos, routes/breadcrumbs/SEO, a Home "Cooking Adventures" tile, comedic "5-star menu" cards, and (per a relayed brief) a personal/"alive" rewrite of the roasted-veg page. Two commits **PUSHED + LIVE** (`0ed1d5a7`, `18bf5d01`). A relayed code-review then prompted an SEO structured-data upgrade (full Recipe JSON-LD + per-page og:image) — verified live in the DOM but **committed-not-pushed** pending a ship call. Tests 139/139 throughout.
**Next Session Action:** (1) **Ship the staged SEO change** (`git push` → Vercel deploy) or bundle it with prerendering; (2) the spawned **prerendering** task (react-snap + reconcile `public/index.html` static OG defaults) — needed so non-JS social bots / link previews see per-page tags + the dish `og:image`; (3) optional polish — a "Jump to recipe" link + a one-line moringa/amla nutrition nod. NOTE: site auto-deploys from `master` via Vercel (push = live); `npm run build` kills `npm start`; run tests via `npm test -- --watchAll=false`.
