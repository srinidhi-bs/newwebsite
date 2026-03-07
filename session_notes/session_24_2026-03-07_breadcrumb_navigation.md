# Session 24 — Breadcrumb Navigation & Fixes
**Date:** 2026-03-07

## What was done
- Created Breadcrumbs component with auto-generated trail from URL path
- Route-to-label mapping for all 16 pages
- JSON-LD BreadcrumbList structured data for SEO
- Integrated into PageWrapper (auto-appears on all pages except Home and 404)
- Dark mode support, responsive design
- Fixed contact page email: srinidhi.bs@outlook.com -> srinidhibs@outlook.com
- Fixed WSL2 hot-reload: added webpack polling (1s) in craco.config.js

## Files created (1)
- src/components/common/Breadcrumbs.js

## Files modified (3)
- src/components/layout/PageWrapper.js (import + render Breadcrumbs)
- src/components/pages/Contact.js (email fix)
- craco.config.js (webpack watchOptions polling for WSL2)

## Testing
- Build compiles successfully with zero errors
- Dev server starts correctly

## Next session
- Consider: back-to-top button, keyboard shortcuts, error boundaries, or new tool
