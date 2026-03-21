# Session 36 — New Tool: PDF Page Numbers
**Date:** 2026-03-21

## What Was Done
- Discussed different implementation approaches for PDF page numbering:
  1. Simple text stamp (pdf-lib) — chosen approach
  2. Custom fonts (pdf-lib + fontkit)
  3. Canvas-rendered overlay (pdfjs + pdf-lib) — overkill
  4. Header/footer bar with background — elements borrowed
- Built **PDF Page Numbers** tool combining Approach 1 + elements of Approach 4
- Full component: `src/components/tools/pdf-page-numbers/PDFPageNumbers.js`

## Features Implemented
- 6 position options (Top/Bottom × Left/Center/Right)
- 5 format presets + custom pattern using `{n}` and `{total}` placeholders
- 3 standard PDF fonts (Helvetica, Times Roman, Courier)
- Font size slider (8–24pt), 5 text color presets
- Margin control (10–100pt), custom start number (0–9999)
- Skip first page toggle (for cover pages)
- Optional background strip with 4 color presets
- Mini CSS preview showing number placement on a page mockup
- Consistent UI with other PDF tools (dropzone, file info bar, success/download section)

## Files Changed
- `src/components/tools/pdf-page-numbers/PDFPageNumbers.js` — **NEW** (full component)
- `src/components/layout/AnimatedRoutes.js` — added lazy import + route
- `src/components/pages/Tools.js` — added tool card
- `src/config/seoConfig.js` — added SEO entry with JSON-LD
- `src/components/common/Breadcrumbs.js` — added route label (also added missing PDF OCR label)

## Technical Notes
- Zero new dependencies — uses pdf-lib (already installed)
- Standard 14 PDF fonts only (no fontkit needed)
- Client-side processing, no server upload
- Follows existing PDF tool patterns (dropzone, formatSize, download, reset)

## Next Session
- Pick next feature from TODO_FUTURE.md
- Consider: more PDF tools, finance calculators, or content pages
