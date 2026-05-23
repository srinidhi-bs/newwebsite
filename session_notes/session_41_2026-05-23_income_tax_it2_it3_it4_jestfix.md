# Session 41 — Income Tax Calculator: IT-2 + IT-4 + IT-3 + Jest Suite Fix

**Date:** 2026-05-23
**Duration:** Extended session (spanned the 05-22→05-23 boundary)
**Focus:** Continue the FY 2026-27 multi-FY plan. Shipped IT-2 (engine parameterization), then the parallel-eligible IT-4 (age categories) and IT-3 (FY toggle). Also fixed a pre-existing broken Jest suite discovered during IT-2 verification.

## What Was Done — 4 commits

### IT-2 — Parameterize the engine by FY (commit `d403064a`)
- `computeTaxForRegime(fy, regime, ageCategory, grossIncome, oldRegimeDeductions)` — now reads standard deduction, slabs, rebate threshold/label, and cess rate from `TAX_CONFIG[fy]`. No hardcoded slab data left.
- `computeSurchargeWithRelief(fy, regime, taxableIncome, baseTax, slabs)` — selects the applicable bracket by walking `TAX_CONFIG[fy].surcharge.brackets` in ascending order (replaces the hardcoded if/else ladder). Proven equivalent to the old logic across all ranges (the only intermediate difference — new-regime >5Cr crossedThreshold — doesn't affect output because marginal relief is 0 that far from any threshold).
- Unified the two near-identical regime slab loops into one shared loop (per-regime differences now resolve to config lookups).
- Added `reconcileDeductions(currentDeductions)` + `useEffect([fy])` (design-doc edge case #4 — structural no-op today since DEDUCTION_SECTIONS is FY-independent; load-bearing once a future FY changes the section list).
- Introduced `fy` and `ageCategory` state (defaults: `getCurrentFY()` → `'2025-26'`, `'general'`). Locked the engine call sites so IT-3/IT-4 only add UI.
- **Verified live** (no IncomeTax unit tests exist yet — that's IT-9): 4 scenarios all exact: ₹12L New → ₹0 (rebate); ₹20L New → ₹1,92,400; ₹20L Old +₹1.75L ded → ₹3,58,800; ₹60L New → ₹15,52,980 (10% surcharge). Plus marginal-relief case ₹51L New → MR −₹91,250, total ₹11,49,200.

### IT-4 — Senior / super-senior age categories (commit `103947c6`)
- `tax-config.js`: added `senior` (₹3L exemption: 0-3L/3-5L/5-10L/>10L) and `superSenior` (₹5L: 0-5L/5-10L/>10L) slab schedules to FY 2025-26 oldRegime; exported new `AGE_CATEGORIES` (single source of truth, keys match slab keys). Source: research-fy-2026-27.md §4.
- UI: age-category pills (General/Senior/Super Senior) at the top of the Old Regime panel, progressive disclosure (Old Regime only), `setAgeCategory` wired.
- **Verified live** @ gross ₹15L (default ded ₹1.75L, taxable ₹12.75L): General ₹2,02,800 / Senior ₹2,00,200 / Super Senior ₹1,89,800; breakdown labels update per band (0-3L, 0-5L); pills hidden in New regime (age-agnostic ₹97,500); selection persists across regime toggle.

### IT-3 — Financial Year pill toggle (commit `89021656`)
- FY pills generated from `FY_LIST` (one per configured FY). Today a single active `FY 2025-26 (AY 2026-27)` pill; becomes a real 2-option switch the moment IT-5 lands FY 2026-27. `setFy` re-added.
- Made hardcoded "FY 2025-26" UI references dynamic via `TAX_CONFIG[fy].shortLabel` (card heading + disclaimer note); dropped the now-redundant FY tag from the regime caption; added a beginner FY-vs-AY caption (P3).
- PDF generator's FY label intentionally left hardcoded — that's IT-6's scope.
- **Verified live**: toggle renders, heading dynamic, default ₹12L → ₹0 unchanged, no console errors.

### Jest suite fix (commit `846610e0`) — pre-existing, unrelated to IT work
Discovered during IT-2 verification that `App.test.js` had been failing to even load. Root cause (3 layers, each found after fixing the prior):
1. **react-router v7 resolution** — v7's `package.json` sets `main: ./dist/main.js` (a nonexistent file) and relies solely on its `exports` map. Webpack honors `exports` (build works); Jest 27's resolver in react-scripts 5 falls back to `main` → "Cannot find module". **Fix:** craco `jest.moduleNameMapper` → real CJS builds for `react-router-dom` + the `react-router/dom` subpath.
2. **jsdom globals** — react-router v7 uses `TextEncoder` at import time; the app uses `matchMedia` and `scrollTo` on render. **Fix:** polyfills in `src/setupTests.js`.
3. **Over-strict assertion** — `getByText(/Srinidhi BS/i)` matched header + footer → threw. **Fix:** `getAllByText`.
- **Result:** `npm test` → 3 suites / 105 tests green (was: App.test.js failing to run). Confirmed pre-existing via `git stash` on the clean IT-1 tree.

## Files Modified
- `src/components/finance/IncomeTaxCalculator.js` (IT-2, IT-4, IT-3)
- `src/components/finance/tax-config.js` (IT-4: senior/superSenior slabs + AGE_CATEGORIES)
- `craco.config.js` (Jest moduleNameMapper)
- `src/setupTests.js` (TextEncoder/matchMedia/scrollTo polyfills)
- `src/App.test.js` (getAllByText)
- Docs: TODO_CURRENT.md, CLAUDE.md, PROJECT_PHASES.md, TODO_FUTURE.md, FUNCTION_MAP.md

## Lessons / Notes for Future Sessions
- **`npm run build` kills the `npm start` dev server.** Hit this repeatedly — after a build, the dev server is gone and an open browser tab throws `ChunkLoadError` on lazy-route navigation. Restart `npm start` (and hard-refresh the tab) before live-viewing. For future verification, prefer keeping ONE dev server up and not running production builds alongside it.
- **A "missing module" in Jest can be a packaging quirk, not a missing dep.** react-router v7's deliberate dead-`main` trap only bites resolvers that don't support `exports` (Jest 27). Always check the package's `exports`/`main` and whether the prod build resolves it before assuming a bad install.
- **Verify a refactor's behavior live when there are no unit tests for it.** IT-2 was a substantial engine rewrite with zero unit coverage; build-green + tests-green did NOT prove the numbers. Driving the real calculator (rebate, slabs, surcharge, marginal relief) was the only thing that did. IT-9 will add the missing tests.
- **Config-vs-engine equivalence needs an argument, not a vibe.** Before trusting the surcharge bracket-walk, traced every income range to confirm identical output to the old hardcoded ladder.
- **Lock a function signature once, early.** IT-2 set `computeTaxForRegime(fy, regime, ageCategory, …)` with `ageCategory` defaulted, so the parallel IT-3/IT-4 only added UI and never touched call sites — zero merge friction.

## Next Session
**IT-7** — Auto-scroll results into view on FY/regime change (mobile, P4, ~30m; depends on IT-3 ✓). Then **IT-5** — populate `TAX_CONFIG['2026-27']` from `docs/research-fy-2026-27.md` (near-copy of FY 2025-26 per Finance Act 2026; add `'2026-27'` to `FY_LIST`). IT-5 is what turns the FY toggle from one inert pill into a working 2-option switch. Then IT-6 (PDF dynamic FY) → IT-9 (tests, incl. the 3 worked examples to ±₹1) → IT-8 (SEO) → IT-10 (manual smoke).
