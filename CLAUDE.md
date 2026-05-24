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
- Phase 9 COMPLETE (Session 42): FY 2026-27 added to the Income Tax Calculator (multi-FY, 10/10 tasks). No feature in flight — next candidates in TODO_FUTURE.md / the flagged SD-display fix.

## Session Status
**Last Updated:** 2026-05-23
**Last Session:** Session 42 — Completed Phase 9 (FY 2026-27 multi-FY): IT-5 (FY 2026-27 config via reference-reuse of FY 2025-26 — Finance Act 2026 changed nothing modelled), IT-6 (dynamic FY in the PDF report), IT-7 (mobile auto-scroll, later scoped to regime-only per live feedback), IT-9 (32-test suite + exported the pure `computeTaxForRegime`), IT-8 (SEO both-FY meta + render test). IT-10 smoke grid clean. Investigated an "empty `<head>`" in the preview → **preview artifact** (helmet flushes via `requestAnimationFrame`, throttled in the hidden preview tab), not a bug. 6 commits; tests 105 → **139** (5 suites); user ran the manual checklist ("everything works").
**Next Session Action:** No feature in flight. Candidates: (1) the flagged latent SD-display fix (results panel hardcodes ₹75k/₹50k instead of the engine's config value — spawned task); (2) TODO_FUTURE Income Tax items (87A marginal relief; year-over-year FY comparison toggle; localStorage/URL state); (3) delete the dead duplicate `src/components/calculators/IncomeTaxCalculator.js`. NOTE: `npm run build` kills the `npm start` dev server; `npx jest` bypasses craco's Babel config (use `npm test -- --watchAll=false`).
