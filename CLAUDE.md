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
- **"Learn" gate built (Session 44), NOT yet pushed:** an invisible "Learn" nav link (right of Contact) opens a client-side password box; password `Learn` → static intern lessons at `/learn/index.html` (copied from the separate `teach-pannaga` project into `public/learn/`). Weak gate is intentional (non-sensitive study material). Files: `src/components/layout/LearnGate.js` + `Navigation.js`. Commit `52028fc2` + uncommitted fixes (modal portal, mobile tap target, lessons exit link). `public/learn/` is a COPY — re-copy on lesson updates.
- **Cooking section SHIPPED & LIVE (Session 43).** Plus a **staged, NOT pushed** SEO structured-data follow-up in `seoConfig.js` (Recipe JSON-LD + per-page `og:image`) — commit `2570c272`. A push now ships this too.
- Phase 9 (Income Tax FY 2026-27) remains complete from Session 42.

## Session Status
**Last Updated:** 2026-05-28
**Last Session:** Session 44 — Built the "Learn" gate from the `teach-pannaga` handover spec: an invisible nav link (right of Contact) + a client-side password modal that opens copied static lessons under `public/learn/`. Verified in-browser (lessons paging/quiz, wrong/correct password, light+dark, mobile); 139/139 tests. Three fixes after self- + user-testing: (1) the modal's `position:fixed` was trapped by the header's `backdrop-blur` containing block → now rendered via React portal to `document.body`; (2) added a "← Back to srinidhibs.com" exit link on the lessons home (edited the **teach-pannaga source** + re-copied); (3) `w-full text-left` so the mobile tap target fills the row below Contact. Gate v1 committed (`52028fc2`); the 3 fixes + the teach-pannaga edit are **uncommitted**. **Push HELD** pending the user's manual phone test.
**Next Session Action:** (1) If user approves: commit the 3 fixes, commit + push the teach-pannaga source edit (separate repo), then push srinidhibs.com — which ALSO ships the held SEO commit `2570c272` → Vercel deploy. Re-verify live (real-mouse click on the invisible link, light+dark, phone). (2) Then the carried-over Cooking items (prerendering — spawned; ship SEO — now bundled into this push). NOTE: host is **Vercel** (push = live; the handover's "Apache" was outdated, but `/learn/index.html` works on both); `npm run build` kills `npm start`; tests via `npm test -- --watchAll=false`. `public/learn/` is a COPY of teach-pannaga — re-copy on lesson updates (the exit link is in the source now, so it survives).
