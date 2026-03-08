# Session 27 - Income Tax Calculator PDF Multi-Page Fix
**Date:** 2026-03-08

## Task
Fix: PDF comparison report was clipped to 1 page when content exceeded A4 height (e.g., high income with surcharge + all deductions filled).

## Changes
- Added `checkPageBreak(spaceNeeded)` helper to `generatePDF` in IncomeTaxCalculator.js
- Changed `const page` to `let page` so it can be reassigned on page break
- Integrated page-break checks into `drawText`, `drawRow`, `drawLine`, and `drawSlabTable` helpers
- When remaining vertical space is insufficient, a new A4 page is automatically added

## Files Modified
- src/components/finance/IncomeTaxCalculator.js

## Next Session
- Consider back-to-top button, accessibility improvements, or performance optimization
