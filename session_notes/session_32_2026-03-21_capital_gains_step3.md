# Session 32 - Capital Gains Calculator Step 3 (Cost Computation)
**Date:** 2026-03-21

## Task
Task CG-2: Implement Step 3 — Cost Computation for the Capital Gains Tax Exemption Calculator wizard.

## Changes
- Added CII_TABLE constant (FY 2001-02 to 2025-26, base year 100, CII 376 for FY 2025-26)
- Added getFYFromDate() helper to derive financial year from a date string
- Added formatCurrency() helper with Indian lakh/crore grouping (₹ prefix)
- Added CurrencyInput reusable component (₹ prefix, formatted display when unfocused, raw number when editing)
- Built Step3CostComputation component with 5 sections:
  - Cost of Acquisition: purchase price input, conditional FMV option for pre-2001 properties with toggle
  - Cost of Improvements: dynamic add/remove rows, date validation (must be after 01-04-2001)
  - Sale Price & Stamp Duty Value: side-by-side inputs with Section 50C check (10% tolerance)
  - Transfer Expenses: deducted from full value of consideration
  - Cost Summary Card: full breakdown with preliminary gain indicator
- Added Step 3 formData fields (purchasePrice, fmvOnApril2001, useFMV, improvements[], salePrice, stampDutyValue, transferExpenses)
- Added Step 3 validation and wired into wizard navigation (isStep3Valid, validation hints)
- Installed missing tesseract.js dependency (pre-existing issue blocking dev server)

## Files Modified
- src/components/finance/CapitalGainsCalculator.js (+737 lines)

## Key Tax Rules Implemented
- Section 55(2)(b): FMV as on 01-04-2001 option for pre-2001 properties
- Section 50C: Stamp duty value deemed as sale consideration when SDV > 110% of actual sale price
- Only improvements after 01-04-2001 are allowed (base year change by Finance Act 2017)
- Inherited/gifted/will: cost = cost to previous owner who purchased

## Next Session
- Task CG-3: Step 4 — Capital Gain Computation (CII indexation, Option A vs Option B comparison)
