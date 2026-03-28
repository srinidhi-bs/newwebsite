# Session 33 - Capital Gains Calculator Step 4 — Capital Gain Computation
**Date:** 2026-03-21

## Task
Implement Step 4 of the Capital Gains Tax Exemption Calculator wizard: compute the actual capital gain and compare tax options based on Budget 2024 grandfathering rules.

## Changes
- Added `GRANDFATHERING_CUTOFF` constant (23-Jul-2024) at module level
- Built `Step4CapitalGainComputation` component with three tax scenarios:
  - **Old regime** (sold before 23-Jul-2024): 20% with indexation only
  - **Grandfathered** (acquired before, sold on/after 23-Jul-2024): lower of Option A (12.5% no indexation) vs Option B (20% with indexation)
  - **New regime** (acquired on/after 23-Jul-2024): 12.5% without indexation only
- Side-by-side comparison cards for grandfathered cases with green "Better Option" banner showing exact savings
- Expandable step-by-step calculation breakdowns (CII lookup, indexed costs, tax + 4% cess)
- Per-improvement CII indexation with individual FY/CII details in breakdown
- Summary card (Capital Gain, Tax Before Exemptions, Tax Rate Applied) for handoff to Step 5
- Collapsible CII reference table (FY 2001-02 to 2025-26) with highlighted buy/sale FYs
- Beginner info boxes explaining indexation and scenario context
- Added Step 4 validation (`isStep4Valid`) to wizard flow
- Added `computedCapitalGain`, `computedTaxBeforeExemption`, `selectedTaxOption`, `selectedTaxRate` to formData state
- Wired Step4 into `renderStep()`, replacing the placeholder
- Edge case: Option B loss cannot offset Option A gain (per tax rules)

## Files Modified
- src/components/finance/CapitalGainsCalculator.js (+639 lines)

## Verified Math (Grandfathered Test Case)
- Bought Jun 2015 (FY 2015-16, CII=254) for ₹50L, sold Jan 2025 (FY 2024-25, CII=363) for ₹1.2Cr
- Option A: (1.2Cr - 50L) × 12.5% + 4% cess = ₹9,10,000
- Option B: Indexed cost = 50L × 363/254 = ₹71,45,669; Gain = ₹48,54,331; Tax = 20% + cess = ₹10,09,701
- Correctly picks Option A, saving ₹99,701

## Next Session
- Task CG-4: Step 5 — Exemption Options (Sections 54, 54EC, 54F)
