# Session 17 — PDF Unlock Tool
**Date:** 2026-02-27
**Commit:** 15145e38

## What was done
- Added PDF Unlock tool: removes password protection from PDFs client-side
- Uses `@neslinesli93/qpdf-wasm@0.3.0` (QPDF v12.2.0 compiled to WebAssembly via Emscripten)
- All content preserved (text, images, fonts, vectors — no rasterization)
- WASM module lazy-loaded and cached after first use (~1.3 MB)

## Files changed
- `package.json` / `package-lock.json` — added @neslinesli93/qpdf-wasm (pinned exact)
- `craco.config.js` — copy qpdf.wasm to build output + webpack fallbacks (process, fs, path, crypto)
- `src/components/tools/pdf-unlock/PDFUnlock.js` — new tool component
- `src/components/layout/AnimatedRoutes.js` — lazy route at /tools/pdf-unlock
- `src/components/pages/Tools.js` — tool card with lock-open icon

## Notes
- The qpdf-wasm package was security-reviewed: transparent Emscripten compile of official QPDF source, zero runtime deps, pinned exact version with sha512 integrity in lockfile
- Needed `crypto: false` in webpack fallbacks (in addition to process, fs, path) for clean compilation

## Next session
- Decide on next feature or tool to add
