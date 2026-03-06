# Session 22 - Income Tax Calculator Enhancements
**Date:** 2026-03-06

## What was done
1. Added slab-wise tax breakdown display for Old Regime (was only available for New Regime)
2. Extracted `computeTaxForRegime()` pure helper function for reuse across UI and PDF generation
3. Added PDF comparison report download feature:
   - Generates A4 PDF comparing both Old and New regime tax calculations
   - Shows input summary, slab breakdowns, cess, and total tax for each regime
   - Comparison summary with recommendation on which regime is better
   - Uses pdf-lib with StandardFonts (Helvetica) — no new dependencies
   - Uses "Rs." instead of "₹" in PDF (WinAnsi encoding limitation)
4. Fixed PDF line spacing issues through multiple iterations

## Files modified
- `src/components/finance/IncomeTaxCalculator.js` (major rewrite — 340 lines)

## Key decisions
- Used `formatCurrencyPDF()` with "Rs." prefix for PDF text (pdf-lib standard fonts don't support ₹ Unicode)
- Placed download button below the disclaimer note for always-visible access
- Extracted tax calculation into pure function so PDF can compute both regimes regardless of UI selection

## Next session
- Decide on next feature or tool to add
