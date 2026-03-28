# Session 29 - PDF OCR Tool (Tesseract.js)
**Date:** 2026-03-19
 
## Task
Add a PDF OCR tool that extracts text from scanned PDFs using client-side OCR.
 
## Changes
- Created `PDFOcr.js` component at `/tools/pdf-ocr` using Tesseract.js v7 for browser-based OCR
- Two output modes:
  - **Extract Text**: Get plain text that can be copied or downloaded as .txt
  - **Searchable PDF**: Creates a PDF with invisible text layer (PDF rendering mode `3 Tr`) overlaid on original pages
- Supports 18 languages with language selector
- Per-page progress tracking with cancel support
- Existing-text detection: warns users if the PDF already contains selectable text
- Disclaimers about OCR accuracy limitations (scan quality, handwriting, complex layouts)
- Added route, Tools page tile, and SEO config for the new tool
 
## Key Debugging
- Fixed "Cannot perform Construct on a detached ArrayBuffer" — pdfjs-dist transfers ArrayBuffer to its worker; fixed by passing `.slice()` copy
- Fixed searchable PDF not producing selectable text — pdf-lib's `drawText` with `opacity: 0.01` doesn't make text selectable; switched to raw PDF content stream with `3 Tr` (invisible rendering mode)
- Fixed empty word data from Tesseract.js — `result.data.words` was empty despite text being extracted; switched to parsing words from `result.data.lines[].words[]`
 
## Files Modified
- src/components/tools/pdf-ocr/PDFOcr.js (new - 1071 lines)
- src/components/layout/AnimatedRoutes.js
- src/components/pages/Tools.js
- src/config/seoConfig.js
- package.json (added tesseract.js)
- CLAUDE.md, FUNCTION_MAP.md, TODO_CURRENT.md
 
## Next Session
- Consider back-to-top button, accessibility improvements, or performance optimization