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
- PDF Tools (Merge, Split, PDF↔JPG conversion, PDF Resizer, PDF Unlock, PDF Lock, PDF Rearrange)
- Dark mode support
- Responsive design
- **Animations**: Framer Motion integration
- **SEO**: react-helmet-async for per-page meta tags, Open Graph, Twitter Cards, JSON-LD structured data, sitemap.xml, 404 page
- **Navigation**: Breadcrumb navigation (auto-generated from route, JSON-LD BreadcrumbList)
- **Error Handling**: Global + route-level error boundaries with friendly fallback UI
- **Performance**: Core Web Vitals monitoring, optimized caching headers

## Current Focus
- Capital Gains Tax Exemption Calculator (multi-session wizard feature)

## Session Status
**Last Updated:** 2026-03-21
**Last Session:** Session 34 - Task CG-4 complete (Step 5 — Exemption Options)
**Next Session Action:** Start Task CG-5 (Step 6 — Results, Deadlines & Polish)

## Capital Gains Calculator Reference
- **Research doc**: `capital-gains-research-prompt.md` (detailed tax rules for Sections 54, 54EC, 54F)
- **Research output**: `C:\Users\srini\OneDrive\Desktop\compass_artifact_wf-bfaf4981-c6be-43b4-a208-c8424eb974e8_text_markdown.md`
- **Plan file**: `.claude/plans/snug-meandering-goblet.md`
- **CII FY 2025-26 = 376** (old code had 381, must correct)
- **Key**: Wizard pattern (6 steps), beginner-friendly, no new dependencies
