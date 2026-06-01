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
- **PDF Merger enhanced (Session 45) — PUSHED & LIVE:** the Merger now accepts **JPG/PNG** alongside PDFs (each image embedded as a fitted A4 page) **and** has a **unified cross-file page grid** — every page of every file is one draggable tile; drag any page anywhere (e.g. an image between two PDF pages); the merge follows the grid order. Per-page select + per-file remove preserved. Commits `989eaac1` + `c737d27f` (only `src/components/tools/pdf-merger/PDFMerger.js`) + docs `de0fe1ba`, pushed to origin → Vercel. User live-verified "works as intended."
- **Learn gate (Session 44) + Cooking section & SEO (Session 43): LIVE.** All pushed (origin == local at `041d4fe6` as of Session-45 start; the earlier "push held" notes were stale — the user had pushed intentionally). `public/learn/` is a COPY of `teach-pannaga` — re-copy on lesson updates.
- Phase 9 (Income Tax FY 2026-27) complete from Session 42.

## Session Status
**Last Updated:** 2026-06-01
**Last Session:** Session 45 — Enhanced the PDF Merger in two steps. (1) Accept **JPG/PNG** alongside PDFs, embedding each image as a **fitted A4 page** (auto orientation, centered) — commit `989eaac1`. (2) Rebuilt the reorder UI into a **single unified page grid**: every page of every file is one draggable tile; drag any page to any position to **interleave across files**; the merge follows the grid order; per-page select + per-file remove preserved — commit `c737d27f`. Three issues fixed via dual-review + in-browser testing: a stale blob-URL thumbnail (→ data URL), a `thumbnailCache` leak in `removeFile`, and a pdf.js *"Cannot use the same canvas during multiple render()"* race (→ cancel the renderTask on cleanup). **139/139 tests.** Verified headless (a script proved an interleaved merge `[PDF p2, image, PDF p1, PDF p3]` comes out in exactly that page order) + in the real component (dragged the image from position 4→1; merge logs confirmed it embeds first). **User live-verified "works as intended."** **PUSHED & LIVE** (commits `989eaac1`, `c737d27f`, docs `de0fe1ba` → origin/master → Vercel) with the user's explicit go-ahead.
**Next Session Action:** (1) Optionally re-verify live on srinidhibs.com (drop a real PDF + image, interleave, merge). (2) Carryover: Cooking **prerendering** (spawned task — CSR site, social/SEO bots see only homepage OG defaults). NOTES: host = **Vercel** (push = live); `npm run build` kills `npm start`; tests via `npm test -- --watchAll=false`; **the Claude preview's headless browser does NOT run the pdf.js worker → PDF page thumbnails never render in preview (image thumbnails + the merge itself DO work) — verify any pdf.js-rendering change in a REAL browser.**
