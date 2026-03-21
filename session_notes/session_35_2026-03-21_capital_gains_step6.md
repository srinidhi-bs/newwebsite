# Session 35 — Capital Gains Calculator Step 6: Results, Deadlines & Polish

**Date:** 2026-03-21
**Task:** CG-5 — Step 6: Results, Deadlines & Polish
**Status:** Complete ✅

## What Was Done

### Step 6 — Results Component (`Step6Results`)
- **Results waterfall**: Clean step-by-step breakdown from Sale Consideration down to Final Tax Payable
  - Sale Consideration → Transfer Expenses → Net Sale Consideration → LTCG → Exemptions → Net Taxable CG → Tax @ rate% → Cess @ 4% → Total Tax Payable
  - Section 50C annotation when stamp duty value applies
  - Indexed/non-indexed annotation based on selected tax option
  - Color-coded: green for zero tax, red/orange gradient for non-zero
- **Tax savings banner**: Shows amount saved by claiming exemptions (before vs after)
- **Full exemption celebration**: Green banner when entire capital gain is exempt
- **Deadline timeline**: Visual vertical timeline with color-coded nodes
  - 54EC bond investment deadline (6 months, amber)
  - CGAS deposit deadline (before ITR due date, blue)
  - House purchase deadline (2 years, green)
  - House construction deadline (3 years, teal)
  - House lock-in warning (3 years from purchase, purple)
  - Bond lock-in warning (5 years from investment, purple)
  - All deadlines conditionally shown based on which exemptions were claimed
- **Beginner FAQ section**: 6 collapsible Q&A items
  - LTCG definition, indexation explanation, CGAS, combining exemptions, lock-in consequences, advance tax
- **Important Disclaimer**: Surcharge not included, CA consultation, informational only
- **"Start Over" button**: Replaces disabled "Done" button, resets wizard to blank Step 1

### Other Changes
- Removed `StepPlaceholder` component (no longer needed — all 6 steps implemented)
- Added `handleStartOver` callback to reset all formData and step state
- Updated Next/Done button logic: Steps 1-5 show "Next →", Step 6 shows "Start Over"

## Files Modified
- `src/components/finance/CapitalGainsCalculator.js` — Added Step6Results component, handleStartOver, updated renderStep and button logic
- `CLAUDE.md` — Updated session status
- `TODO_CURRENT.md` — Marked CG-5 complete
- `FUNCTION_MAP.md` — Added Step6Results and handleStartOver entries
- `PROJECT_PHASES.md` — Marked Phase 5 complete

## Test Case Verified
- Residential house, purchased 2005, sold Dec 2025 (grandfathered, 20% with indexation)
- Purchase Rs. 30L, Sale Rs. 1.2Cr, Transfer expenses Rs. 2L
- Sec 54 investment Rs. 15L + Sec 54EC bonds Rs. 10L = full exemption
- Result: Tax payable Rs. 0, saved Rs. 4,49,067
- Deadlines: Bonds by 1 Jun 2026, Purchase by 1 Dec 2027, Construction by 1 Dec 2028
- Lock-in warnings displayed for both house and bonds

## Next Session
- Capital Gains Calculator feature is complete (all 6 steps)
- Pick next feature from TODO_FUTURE.md
