# Session 39 — SIP Comparison Calculator (FD vs Equity)

**Date:** 2026-03-28
**Duration:** Standard session
**Focus:** New finance tool — SIP Comparison Calculator comparing Fixed Deposit vs Equity Index Fund returns

## What Was Done

### 1. SIP Comparison Calculator Component
- Created `SIPComparisonCalculator.js` (~780 lines) with full TailwindCSS conversion
- Converted from standalone dark-only inline-style JSX to site-native patterns
- 5 interactive range sliders: Monthly SIP, Yearly Step-up, Investment Period, FD Rate, Equity Rate
- **Editable slider values**: Click any displayed number to type a precise value directly
  - Auto-focus + select-all on click, Enter commits, Escape cancels, blur commits
  - Values clamped to min/max and snapped to nearest step
  - `inputMode="decimal"` for mobile keyboard support
- SVG growth chart with gradient area fills, data dots, and end-value labels
- 4 metric summary cards: Total Invested, FD Corpus, Equity Corpus, Equity Advantage
- Year-by-year mini-bar breakdown (FD column + Equity column)
- Compounding gap section (wealth multipliers + extra wealth)
- Disclaimers section
- Light/dark mode via Tailwind `dark:` variants and CSS custom properties
- Responsive: grid stacking on mobile

### 2. Integration (6 files touched)
- `SIPComparisonCalculatorPage.js` — Page wrapper (PageWrapper + SEO)
- `Finance.js` — Added 4th tile "SIP Comparison: FD vs Equity"
- `AnimatedRoutes.js` — Lazy-loaded route at `/finance/sip-comparison`
- `seoConfig.js` — SEO metadata + JSON-LD WebApplication schema
- `Breadcrumbs.js` — Route label entry

### 3. Rename: Nifty → Equity
- User requested replacing "Nifty" with "Equity" throughout
- Updated all labels, variable names, comments, SEO config, tile text
- Kept "Nifty 50" only in the disclaimer (it's the actual index name for context)

## Files Created
- `src/components/finance/SIPComparisonCalculator.js`
- `src/components/pages/SIPComparisonCalculatorPage.js`

## Files Modified
- `src/components/pages/Finance.js` — new tile
- `src/components/layout/AnimatedRoutes.js` — new route
- `src/config/seoConfig.js` — new SEO entry
- `src/components/common/Breadcrumbs.js` — new route label

## Testing
- Dev server compiles successfully, no console errors
- All 104 existing tests pass
- Route `/finance/sip-comparison` returns HTTP 200
- Verified via browser: dark mode, light mode, sliders, chart, breakdown, compounding gap
- Finance page tile present and clickable

## Next Session
- Pick next feature: Save/Load for calculators, Visual Charts, STCG support, Worked Examples, blog, more PDF tools, or user request
