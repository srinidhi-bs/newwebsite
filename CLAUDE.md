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
- Adding FY 2026-27 to Income Tax Calculator (10-task plan; IT-1–IT-4 complete, 4 of 10)

## Session Status
**Last Updated:** 2026-05-23
**Last Session:** Session 41 — IT-2 (parameterize engine by FY, reading slabs/rebate/surcharge/cess from `TAX_CONFIG[fy]`), IT-4 (senior/super-senior age-category pills + slabs), IT-3 (FY pill toggle + caption). Also fixed a pre-existing broken Jest suite (react-router v7 `main`-field resolution via craco `moduleNameMapper` + jsdom polyfills for TextEncoder/matchMedia/scrollTo) — `npm test` now 3 suites / 105 tests green. 4 commits, all verified live in the browser.
**Next Session Action:** IT-7 — Auto-scroll results into view on FY/regime change (mobile, ~30m). Then IT-5 — Populate FY 2026-27 config from `docs/research-fy-2026-27.md` (near-copy of FY 2025-26; this is what turns the FY toggle from a single inert pill into a real 2-option switch). Build sequence: IT-7 → IT-5 → IT-6 (PDF dynamic FY) → IT-9 (tests) → IT-8 (SEO) → IT-10 (manual smoke). NOTE: running `npm run build` kills the `npm start` dev server — restart it before live-viewing.
