# Future Tasks

## Backlog

### Capital Gains Calculator Enhancements
- Save/Load Calculation — persist formData to localStorage, resume later, compare scenarios
- Visual Comparison Chart — Chart.js bar/pie comparing Option A vs B in Step 4
- STCG Support — add slab-rate computation for short-term capital gains (≤24 months)
- Surcharge Calculation — add income input, compute surcharge (10%/15%/25%) for high earners
- "What-If" Slider — drag slider in Step 5 to see real-time tax impact of investment amounts
- Worked Examples — pre-filled sample scenarios users can load to learn the calculator
- Advance Tax Schedule — show quarterly payment dates and amounts in Step 6
- Print-Friendly View — clean print stylesheet for Step 6 Results
- Multiple Property Support — aggregate LTCG from multiple property sales in one year

### Income Tax Calculator
- **87A rebate marginal relief** — the calculator treats the 87A rebate as a hard cliff (taxable ≤ threshold → ₹0, else full tax). Real law gives *marginal relief* just above the rebate threshold so tax never exceeds the income excess. New Regime: relief band ends at taxable ₹12,70,588 (gross ~₹13,45,588 salaried); Old Regime: above ₹5L. Exact formula in `docs/research-fy-2026-27.md` §10. Discovered Session 41; flagged to user, deferred as separate enhancement.
- Year-over-year comparison toggle (compare FY 2025-26 vs FY 2026-27 side by side) — rejected from current scope; revisit after IT-5.
- "What's New for FY 2026-27" callout — rejected from current scope.
- localStorage scenario save + URL-shareable state.

### Tech Debt / Cleanup
- **Dead duplicate file** `src/components/calculators/IncomeTaxCalculator.js` — the live calculator is `src/components/finance/IncomeTaxCalculator.js` (imported by `IncomeTaxCalculatorPage`). The `calculators/` copy is not referenced anywhere. Verify and delete. (Noticed Session 41.)
- **Test deprecation noise** — `ReactDOMTestUtils.act is deprecated` warnings in the Capital Gains suites (React 18 + older `@testing-library/react`). Tests pass, but consider upgrading `@testing-library/react` (v14+) to silence. (Noticed Session 41.)
- **Leftover git worktrees** under `.claude/worktrees/` (elastic-cannon, awesome-bell) from prior sessions — clean up if no longer needed.
