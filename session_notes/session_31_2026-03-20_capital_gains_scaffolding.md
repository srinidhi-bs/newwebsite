# Session 31 - Capital Gains Tax Exemption Calculator: Scaffolding + Steps 1-2
**Date:** 2026-03-20
 
## Task
CG-1: Build the Capital Gains Calculator wizard scaffolding and implement Steps 1 & 2 (Asset Details and Sale Details).
 
## Changes
- Created wizard-pattern calculator with 6-step flow (Asset Details → Sale Details → Cost Computation → Exemptions → Results → Report)
- Step 1 (Asset Details): Asset type selection (land/building, listed shares, unlisted shares, other), acquisition date, sale date, auto-computed holding period with short/long-term classification
- Step 2 (Sale Details): Sale consideration, sale expenses, auto-computed net sale consideration
- Built reusable ProgressIndicator component for wizard step navigation
- Added route `/finance/capital-gains-calculator` and integrated into Finance page tile grid
- Fixed ESLint CI build failure: removed unused `hasExistingText` variable in PDFOcr.js
 
## Files Created
- src/components/finance/capital-gains/CapitalGainsCalculator.js (main wizard container)
- src/components/finance/capital-gains/ProgressIndicator.js (step progress bar)
- src/components/finance/capital-gains/Step1AssetDetails.js
- src/components/finance/capital-gains/Step2SaleDetails.js
- src/components/finance/capital-gains/constants.js (CII table, asset types, thresholds)
 
## Files Modified
- src/App.js (added route)
- src/components/finance/Finance.js (added tile)
- src/components/tools/pdf-ocr/PDFOcr.js (lint fix)
 
## Next Session
- Start Task CG-2: Step 3 — Cost Computation (indexed cost of acquisition/improvement using CII table)
 