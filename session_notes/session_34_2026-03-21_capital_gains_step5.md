# Session 34 - Capital Gains Calculator Step 5 — Exemption Options
**Date:** 2026-03-21

## Task
Implement Step 5 of the Capital Gains Tax Exemption Calculator wizard: let users claim tax exemptions under Sections 54, 54EC, and 54F based on their reinvestment plans.

## Changes
- Built `Step5ExemptionOptions` component with auto-filtering by asset type:
  - **Residential house sold** → Section 54 (house reinvestment) + Section 54EC (bonds)
  - **Plot / Commercial sold** → Section 54F (proportional formula) + Section 54EC (bonds)
- **Section 54** — Buy/construct new residential house:
  - Investment + CGAS deposit inputs
  - Exemption = min(Capital Gain, Investment + CGAS, Rs. 10 Cr cap)
  - Two-house option (Budget 2019) shown when LTCG ≤ Rs. 2 crore (one-time lifetime)
  - Key deadlines: 2yr purchase, 3yr construct, 3yr lock-in (auto-computed from sale date)
- **Section 54EC** — Invest in specified bonds:
  - Bond investment input with Rs. 50 lakh auto-cap
  - Eligible bonds list: REC, PFC, IRFC, HUDCO (Budget 2025), IREDA (Budget 2025)
  - 6-month deadline from sale date, no CGAS facility
  - 5-year lock-in, ~5.25% interest
- **Section 54F** — Proportional exemption for non-residential assets:
  - Proportional formula: Exemption = (CG × Investment) / Net Sale Consideration
  - Ownership condition checkboxes (≤1 other house, no future house purchase)
  - Validation warnings when conditions not met
  - CGAS deposit input, Rs. 10 Cr cap on investment
- **Running exemption total** at bottom:
  - Individual section breakdowns
  - Net taxable gain after exemption
  - Tax @ selected rate + 4% cess
  - Tax saved by claiming exemptions
  - "Your entire capital gain is exempt!" celebration banner when net gain = 0
- Beginner-friendly info boxes for each section and CGAS
- Added constants: `SEC54_54F_CAP`, `SEC54EC_MAX`, `TWO_HOUSE_LTCG_LIMIT`, `SEC54EC_BONDS`
- Added formData fields: `sec54Investment`, `sec54CGASDeposit`, `sec54TwoHouseOption`, `sec54ECInvestment`, `sec54FInvestment`, `sec54FCGASDeposit`, `sec54FOwnsMaxOneHouse`, `sec54FNoFutureHousePurchase`, `computedNetSaleConsideration`, `computedTotalExemption`
- Step 4 now also stores `computedNetSaleConsideration` in formData
- Added `isStep5Valid` (always true — exemptions are optional)
- Wired Step5 into `renderStep()`, replacing the placeholder

## Files Modified
- src/components/finance/CapitalGainsCalculator.js (+776 lines)
- CLAUDE.md (session status update)
- TODO_CURRENT.md (CG-4 marked complete)
- FUNCTION_MAP.md (Step5 + constants added)
- PROJECT_PHASES.md (Phase 5 added)

## Verified Test Case (Residential House)
- Bought Jan 2015 for ₹50L, sold Dec 2025 for ₹1.5Cr (expenses ₹1L)
- Capital Gain = ₹99,00,000 at 12.5% (grandfathered, Option A better)
- Tax before exemptions = ₹12,87,000
- Sec 54 investment: ₹50L → exemption ₹50L
- Sec 54EC bonds: ₹49L → exemption ₹49L
- Total exemption = ₹99L = full capital gain → Tax = ₹0, Saved = ₹12,87,000
- "Your entire capital gain is exempt!" banner shown correctly

## Next Session
- Task CG-5: Step 6 — Results, Deadlines & Polish
