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
- **Results panel hardcodes the standard deduction** — the sticky results panel renders the SD (`? 75000 : 50000`) and recomputes taxable income inline, instead of using the `standardDeduction`/`taxableIncome` the engine already returns from `TAX_CONFIG[fy]`. Correct today (both FYs use ₹75k/₹50k) but will silently mis-display whenever a future FY changes the SD. Fix: surface engine values into state + render those. Flagged Session 42 (spawned task). (`src/components/finance/IncomeTaxCalculator.js`)
- **87A rebate marginal relief** — the calculator treats the 87A rebate as a hard cliff (taxable ≤ threshold → ₹0, else full tax). Real law gives *marginal relief* just above the rebate threshold so tax never exceeds the income excess. New Regime: relief band ends at taxable ₹12,70,588 (gross ~₹13,45,588 salaried); Old Regime: above ₹5L. Exact formula in `docs/research-fy-2026-27.md` §10. Discovered Session 41; flagged to user, deferred as separate enhancement.
- Year-over-year comparison toggle (compare FY 2025-26 vs FY 2026-27 side by side) — now actionable (IT-5 shipped Session 42; both FYs configured).
- "What's New for FY 2026-27" callout — rejected from current scope.
- localStorage scenario save + URL-shareable state.

### Cooking Section (Session 43)
- **Prerendering (highest value — spawned task).** Site is client-side rendered, so non-JS link-preview bots (WhatsApp/Slack/Twitter) and the per-page `og:image` only ever see `public/index.html`'s static homepage OG defaults. Add react-snap (or similar) + reconcile that static OG/Twitter block so per-page title/description/og:image/JSON-LD reach all crawlers + social bots. The recipe pages already carry full Recipe JSON-LD + a per-page dish `og:image`, so prerendering is what unlocks them. Site-wide, separate session.
- **Ship the staged SEO structured-data change.** `seoConfig.js` already has the enhanced Recipe JSON-LD (image, recipeIngredient, recipeInstructions, prep/cook/totalTime) + per-page og:image for both recipes — committed-not-pushed. Push (→ Vercel deploy) when ready, or bundle with prerendering. Verify after with Google's Rich Results Test.
- **Optional polish** (from the pizza-page review): a "Jump to recipe" link atop each long recipe page; a one-line moringa/amla nutrition nod (also helps "healthy pizza" search).
- **Adding a new recipe** = new page (data + `RecipeBits`) + route + breadcrumb label + `seoConfig` entry + a tile in `Cooking.js`'s `RECIPES`. Carry the playful voice + the "5-star menu" card.

### Learn Gate (Session 44)
- **`public/learn/` is a COPY of teach-pannaga.** When the lessons change there, re-run the copy step (handover Step 1) and redeploy. The "← Back to srinidhibs.com" exit link now lives in the **teach-pannaga source**, so it survives re-copy. If new topics/subjects are added, they appear automatically after re-copy (no srinidhibs.com code change needed).
- **Optional:** opening the gate doesn't close the mobile hamburger menu (the modal covers it; the menu is still open underneath after Cancel). Harmless; add `setMenuOpen(false)` to `openGate` if it bugs you. (`LearnGate.js` would need the `setMenuOpen` prop threaded from `Navigation.js`.)
- **If the lessons ever hold sensitive material**, the client-side gate is NOT enough — would need real auth/backend. Flagged & rejected for current (non-sensitive) scope.

### Tech Debt / Cleanup
- **Dead duplicate file** `src/components/calculators/IncomeTaxCalculator.js` — the live calculator is `src/components/finance/IncomeTaxCalculator.js` (imported by `IncomeTaxCalculatorPage`). The `calculators/` copy is not referenced anywhere. Verify and delete. (Noticed Session 41.)
- **Test deprecation noise** — `ReactDOMTestUtils.act is deprecated` warnings in the Capital Gains suites (React 18 + older `@testing-library/react`). Tests pass, but consider upgrading `@testing-library/react` (v14+) to silence. (Noticed Session 41.)
- **Leftover git worktrees** under `.claude/worktrees/` (elastic-cannon, awesome-bell) from prior sessions — clean up if no longer needed.
