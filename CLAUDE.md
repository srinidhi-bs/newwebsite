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
- Adding FY 2026-27 to Income Tax Calculator (10-task plan, IT-1 complete)

## Session Status
**Last Updated:** 2026-05-05
**Last Session:** Session 40 - IT-1: Extract tax-config.js with FY 2025-26 data (foundation refactor)
**Next Session Action:** IT-2 — Parameterize `computeTaxForRegime` by FY (read slabs/rebate/surcharge/cess from `TAX_CONFIG[fy]` instead of hardcoded inline data) + add `reconcileDeductions()` for FY-change edge cases. See `docs/design-fy-2026-27-income-tax.md` for the full plan and `docs/research-fy-2026-27.md` for FY 2026-27 numbers (Finance Act 2026 made no changes to slabs/rebate/surcharge).
