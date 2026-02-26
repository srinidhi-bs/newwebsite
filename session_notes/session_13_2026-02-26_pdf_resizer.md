# Session 13: PDF Resizer Tool
**Date:** 2026-02-26

## Task Completed
- New Tool: PDF Resizer — compress PDFs to a user-specified target file size

## Files Created
- `src/components/tools/pdf-resizer/PDFResizer.js` — Main component with iterative compression algorithm

## Files Modified
- `src/App.js` — Added lazy import and route for PDFResizer
- `src/components/pages/Tools.js` — Added PDF Resizer card to tools grid

## Key Decisions
- **Approach:** Renders each PDF page to canvas via pdfjs-dist, converts to JPEG, rebuilds PDF via pdf-lib
- **Trade-off:** Output PDF loses text selectability (pages become images) — user approved
- **Quality-first algorithm:** Always starts at full resolution (scale 1.0), only reduces JPEG quality to hit target size. Scale is reduced only as absolute last resort to keep text sharp and readable
- Used react-dropzone for file upload (consistent with other PDF tools)

## Algorithm Details
- Iterative compression: up to 10 attempts with dampening factor (0.5) to prevent oscillation
- Tolerance: ±5% of target size
- Quality range: 0.05 to 1.0 (exhausted before touching scale)
- Scale minimum: 0.5 (keeps text somewhat readable even in extreme compression)

## Bug Fix During Session
- Initial version used `sqrt(targetSize/originalSize)` for starting scale — caused blurry text
- Fixed by always starting at scale 1.0 and adjusting quality only

## Next Session
- Task 3.4: Add Page Transitions (Framer Motion)
