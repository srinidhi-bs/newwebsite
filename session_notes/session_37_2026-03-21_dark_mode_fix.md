# Session 37 — Capital Gains Calculator Dark Mode Fix
**Date:** 2026-03-21

## What Was Done
- Fixed dark mode styling in Capital Gains Calculator Step 4 (Tax Comparison section)
- The "Capital Gain" and "Tax + Cess" stat boxes inside Option A/B comparison cards had no visible background in dark mode
- Root cause: `dark:bg-gray-750` is not a valid Tailwind CSS class (Tailwind has `gray-700` and `gray-800`, but no `750`)
- Fix: Changed both instances to `dark:bg-gray-700`

## Files Modified
- `src/components/finance/CapitalGainsCalculator.js` (lines 1601, 1616)

## Testing
- Verified fix in browser — dark mode stat boxes now have proper dark background
- Light mode unaffected (uses `bg-gray-50` which was already correct)
