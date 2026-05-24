# Current Tasks

- ✅ Phase 0: Maintenance & Hosting Setup (4 tasks, completed 2025-11-19)
- ✅ Phase 2: Content Pages (10 tasks, completed 2026-01-17)

## Completed Phases (see TODO_COMPLETED.md for details)

- ✅ Task 3.1: Responsive Design Audit & Fixes (Home, Finance, Trading, Tools)
- ✅ Task 3.2: Enhanced Dark Mode Implementation
- ✅ Task 3.3: Implement Global Loading States
- ✅ New Tool: PDF Resizer (compress PDFs to target file size)
- ✅ Task 3.4: Add Page Transitions (Framer Motion)

## Phase 4: Performance & Polish

- ✅ Task 4.1: Bundle Analysis & Cleanup (removed nodemailer, added source-map-explorer)
- ✅ Task 4.2: Caching & Delivery (.htaccess security headers, HTML no-cache, font/SVG/JSON caching)
- ✅ Task 4.3: Core Web Vitals Monitoring (color-coded console logging)
- ✅ Task 4.4: SEO & Meta Tags (OG, Twitter, JSON-LD, per-page titles, manifest)
- ✅ Cleanup: Deleted unused travel images (5.8 MB)

## New Tools

- ✅ New Tool: PDF Unlock (remove password protection, qpdf-wasm)
- ✅ New Tool: PDF Lock (add password protection, qpdf-wasm, AES-256)
- ✅ New Tool: PDF Rearrange (drag-and-drop visual mode + manual input mode)
- ✅ Enhancement: PDF Rearrange — page rotation (per-page + bulk, visual mode only)
- ✅ Enhancement: Finance page — converted from tabs to tiles (matching Tools page pattern)
- ✅ Enhancement: Income Tax Calculator — old regime slab breakdown + PDF comparison report download
- ✅ Enhancement: SEO — per-page meta tags (react-helmet-async), sitemap.xml, 404 page, JSON-LD structured data
- ✅ Enhancement: Breadcrumb navigation (auto-generated, JSON-LD BreadcrumbList, dark mode)
- ✅ Fix: Contact page email corrected to srinidhibs@outlook.com
- ✅ Fix: WSL2 hot-reload (webpack polling in craco.config.js)
- ✅ Feature: Error boundaries (global + route-level, custom class component, dark mode fallback UI)
- ✅ Enhancement: Income Tax Calculator — surcharge with marginal relief (AY 2026-27, both regimes)
- ✅ Enhancement: Income Tax Calculator — results UI reordered (Gross → Deductions → Taxable → Tax)
- ✅ Enhancement: Income Tax Calculator — individual deduction sections (80C, 80CCD(1B), 80D, 80E, 80G, 80TTA/TTB) with auto-capping, sticky results panel
- ✅ Fix: Income Tax Calculator — PDF multi-page support (content no longer clipped to 1 page)
- ✅ Fix: Footer year updated from 2025 to 2026
- ✅ Fix: Light mode footer contrast (light gray bg + border instead of dark bar)
- ✅ Fix: Trading page excessive empty space above heading (reduced hero height)
- ✅ Fix: Nav active page indicator now derived from URL (useLocation) instead of manual state
- ✅ New Tool: PDF OCR (Tesseract.js, extract text or create searchable PDF, 18 languages, client-side)

## Feature: Capital Gains Tax Exemption Calculator (Wizard)

Beginner-friendly, step-by-step calculator for computing capital gains on property sales and claiming exemptions under Sections 54, 54EC, 54F. Research doc: `capital-gains-research-prompt.md`. Plan: `.claude/plans/snug-meandering-goblet.md`.

**CII for FY 2025-26 = 376** (CBDT Notification No. 70/2025). Old code had 381 — must be corrected.

- [x] Task CG-1: Scaffolding + Steps 1–2 (Asset Details + Dates/Holding Period) ✅ Session 31
- [x] Task CG-2: Step 3 — Cost Computation ✅ Session 32
  - Purchase price, conditional FMV (pre-2001), dynamic improvements array
  - Sale price, stamp duty value + Section 50C check (10% tolerance)
  - Transfer expenses, summary card, CurrencyInput component, CII table, formatCurrency helper
- [x] Task CG-3: Step 4 — Capital Gain Computation ✅ Session 33
  - Three scenarios: old_regime / grandfathered / new_regime (based on 23-Jul-2024 cutoff)
  - Option A (12.5% no indexation) vs Option B (20% with indexation)
  - Side-by-side comparison cards, expandable step-by-step breakdowns, "Better Option" banner
  - Per-improvement CII indexation, collapsible CII reference table
  - Computed values stored in formData (computedCapitalGain, selectedTaxOption, selectedTaxRate)
- [x] Task CG-4: Step 5 — Exemption Options ✅ Session 34
  - Auto-filter by asset type (Residential → Sec 54 + 54EC, Plot/Commercial → Sec 54F + 54EC)
  - Sec 54: investment + CGAS inputs, Rs. 10Cr cap, two-house option (LTCG ≤ Rs. 2Cr)
  - Sec 54EC: bond investment (max Rs. 50L auto-cap), 6-month deadline, eligible bonds list (REC, PFC, IRFC, HUDCO, IREDA)
  - Sec 54F: proportional formula, ownership condition checkboxes, validation warnings
  - Running exemption total with tax savings, "entire gain exempt" celebration banner
  - Key deadlines computed from sale date (2yr purchase, 3yr construct, 3yr lock-in, 6mo bonds)
  - Beginner info boxes for each section, CGAS explanation
  - computedNetSaleConsideration stored in formData for Sec 54F formula
  - computedTotalExemption stored in formData for Step 6
- [x] Task CG-5: Step 6 — Results, Deadlines & Polish ✅ Session 35
  - Results waterfall: Sale Price → Transfer Expenses → Net Sale → LTCG → Exemptions → Net CG → Tax + Cess → Final Payable
  - Tax savings banner (compares before/after exemptions), full exemption celebration
  - Deadline timeline with visual vertical line: 6mo bonds, CGAS deposit, 2yr purchase, 3yr construction, lock-in periods
  - Deadlines conditionally shown based on which exemptions were claimed
  - Beginner FAQ (6 items): LTCG, indexation, CGAS, combining exemptions, lock-in, advance tax
  - Detailed disclaimer (surcharge not included, CA consultation, informational only)
  - "Start Over" button on Step 6 resets wizard to blank Step 1
  - Removed StepPlaceholder component (no longer needed)

## New Tools (cont.)

- ✅ New Tool: PDF Page Numbers ✅ Session 36
  - Add page numbers to PDFs using pdf-lib (no new dependencies)
  - 6 positions (Top/Bottom × Left/Center/Right), 5 formats + custom pattern
  - 3 standard PDF fonts, font size slider (8–24pt), 5 text colors
  - Margin control, custom start number, skip first page option
  - Optional background strip (4 color presets) for readability
  - Mini preview showing number placement, consistent UI with other PDF tools
  - SEO config, breadcrumb entry, routing, Tools page card all added

## Bug Fixes

- ✅ Fix: Capital Gains Calculator dark mode — Tax Comparison stat boxes ✅ Session 37
  - Fixed `dark:bg-gray-750` (non-existent Tailwind class) → `dark:bg-gray-700`
  - Affected "Capital Gain" and "Tax + Cess" boxes in Option A/B comparison cards

## Session 38: Testing, PDF Report Generation & CII Bugfix

- ✅ Testing: Created comprehensive test suite for Capital Gains Calculator (104 tests, all pass)
  - `CapitalGainsCalculator.test.js` (101 tests): 12 describe blocks covering all 6 steps, validation, navigation, edge cases, PDF button
  - `CapitalGainsCalculator.improvements.test.js` (3 tests): improvements + dual-option display
- ✅ Feature: PDF Report Generation — download complete tax computation as PDF
  - `generatePDF()` in Step6Results, using pdf-lib (same pattern as IncomeTaxCalculator)
  - 8 PDF sections: Header, Asset Summary, Cost Computation, Capital Gain (both options), Exemptions, Final Tax Waterfall, Deadlines, Disclaimer
  - Both Option A (12.5%) and Option B (20%) shown in PDF with [SELECTED] tag and reason text
  - Download button with SVG icon at bottom of Step 6
- ✅ Bugfix: CII fallback for future FYs — Option B was hidden when sale date fell in FY 2026-27
  - Root cause: `CII_TABLE` only goes to FY 2025-26, `getFYFromDate('2026-05-28')` returned '2026-27' → CII lookup returned null → `optionBResult` was null → Option B card not rendered
  - Fix: Added `getCII()` helper with fallback to latest CII (376 for FY 2025-26) + warning InfoBox
  - Added `LATEST_CII_FY` and `LATEST_CII_VALUE` constants
- ✅ Fix: PDF blob URL revocation timing — added 1s delay before `revokeObjectURL` to prevent incomplete downloads

## Session 39: SIP Comparison Calculator (FD vs Equity)

- ✅ New Finance Tool: SIP Comparison Calculator (/finance/sip-comparison)
  - Compares Fixed Deposit vs Equity Index Fund SIP returns
  - 5 adjustable parameters (monthly SIP, step-up, years, FD rate, equity rate)
  - Editable slider values — click any number to type a precise value
  - SVG growth chart with gradient fills, year-by-year mini-bar breakdown
  - 4 metric summary cards, compounding gap analysis (wealth multipliers)
  - Disclaimers section, fully responsive, light/dark mode
  - Converted from standalone dark-only JSX → TailwindCSS site-native component
  - Page wrapper, route, SEO config (JSON-LD), breadcrumb all added
  - Finance page tile added (4th calculator)

## Session 40: FY 2026-27 in Income Tax Calculator

Add FY 2026-27 alongside FY 2025-26 in Income Tax Calculator. FY-keyed config refactor (Approach A). Senior + Super-senior slab schedules added (Old Regime). Default FY = current FY by date.

**Reviews:** CEO APPROVED (Hold Scope) · Design APPROVED (P1+P2+P3+P4) · Eng APPROVED_WITH_CONCERNS (3 NEEDS_WORK absorbed)

**Design doc:** `docs/design-fy-2026-27-income-tax.md`
**Research doc:** `docs/research-fy-2026-27.md` (Finance Act 2026, assent 30-Mar-2026)

**Finding from research:** Finance Act 2026 makes **NO change** to slabs / rebate / surcharge / cess / deduction caps for FY 2026-27. Memorandum to Finance Bill 2026 explicitly states "no change proposed in tax rates." This means IT-5 is mostly a copy of FY 2025-26 config with FY-label change.

**80TTB cap verified ₹50,000** from incometax.gov.in + ClearTax + TaxGuru Finance Act 2026 reproduction (Tier-3 ₹1L claims confuse Sec 194A TDS-threshold with Sec 80TTB deduction-limit).

**Build sequence:** IT-1 → IT-2 → (IT-3 ‖ IT-4) → IT-7 → IT-5 → IT-6 → IT-9 → IT-8 → IT-10

| ID | Task | Est | Prereqs | Status |
|----|------|-----|---------|--------|
| IT-1 | Extract `tax-config.js` with FY 2025-26 data; existing tests pass | 2h | — | ✅ Session 40 |
| IT-2 | Parameterize `computeTaxForRegime` by FY; add `reconcileDeductions()` | 1h | IT-1 | ✅ Session 41 |
| IT-3 | FY pill toggle (P1) + caption (P3) + `getCurrentFY()` default helper | 1h | IT-2 | ✅ Session 41 |
| IT-4 | Age-category pills (P2) + senior/super-senior slab schedules (FY 25-26) | 1.5h | IT-2 | ✅ Session 41 |
| IT-5 | Populate FY 2026-27 config from research doc | 1.5h | research | ✅ Session 42 |
| IT-6 | PDF generator: dynamic FY in header + filename | 1h | IT-3, IT-5 | ✅ Session 42 |
| IT-7 | Auto-scroll results into view on regime change (P4, mobile) | 30m | IT-3 | ✅ Session 42 |
| IT-8 | SEO: page title/description mention both FYs | 30m | — | ✅ Session 42 |
| IT-9 | Tests: FY 2026-27 + senior/super-senior + FY-switch + 3 worked examples | 2h | IT-5 | ✅ Session 42 |
| IT-10 | Manual smoke grid + bug fixes | 1h | all above | ✅ Session 42 |

## Session 41: IT-2 + IT-4 + IT-3 + Jest suite fix

Three IT tasks shipped in one session (parallel-eligible IT-3 ‖ IT-4 done after IT-2), plus a pre-existing test-infra fix.

- ✅ **IT-2** — engine reads slabs/SD/rebate/surcharge brackets/cess from `TAX_CONFIG[fy]`; `computeTaxForRegime(fy, regime, ageCategory, gross, deductions)` and `computeSurchargeWithRelief(fy, …)` (ascending bracket walk). Two identical regime slab loops unified. Added `reconcileDeductions()` + `useEffect([fy])`, and `fy`/`ageCategory` state. Output verified identical for FY 2025-26 across 4 live scenarios (rebate, slabs, old-regime deductions, 10% surcharge w/ marginal relief). Commit `d403064a`.
- ✅ **IT-4** — `senior` (₹3L exemption) + `superSenior` (₹5L) slabs added to FY 2025-26; exported `AGE_CATEGORIES`; age-category pills (progressive disclosure, Old Regime only); selection persists across regime toggle. Verified: General ₹2,02,800 / Senior ₹2,00,200 / Super Senior ₹1,89,800 @ gross ₹15L. Commit `103947c6`.
- ✅ **IT-3** — FY pill toggle (pills from `FY_LIST`), FY/AY caption, dynamic FY in heading + disclaimer. Single inert pill today; becomes a real 2-option switch once IT-5 lands. PDF FY left hardcoded (IT-6's scope). Commit `89021656`.
- ✅ **Jest fix** — `App.test.js` had been failing to even load (pre-existing, since react-router v7 upgrade): v7's `main` points to a nonexistent file, so Jest 27's resolver couldn't find it. Fixed via craco `moduleNameMapper` (→ CJS builds) + jsdom polyfills (TextEncoder/matchMedia/scrollTo) + `getAllByText` for the brand. Now 3 suites / 105 tests green. Commit `846610e0`.

## Session 42: IT-5 → IT-10 — Phase 9 COMPLETE (10/10)

Shipped the remaining six tasks of the FY 2026-27 plan in one session + a post-test UX tweak. 6 commits; tests 105 → **139** (5 suites). Full detail: `session_notes/session_42_2026-05-23_income_tax_fy2026_27_complete.md`.

- ✅ **IT-7** — Mobile auto-scroll: results scroll into view on toggle change (mobile only, StrictMode-safe prev-value guard, respects reduced-motion). Commit `3f6c90cb`.
- ✅ **IT-5** — `FY_2026_27` added to `tax-config.js` (reuses FY 2025-26 rate structures by reference — Finance Act 2026 changed nothing modelled; verified ±₹1). FY toggle now a real 2-option switch; default flips to FY 2026-27. Commit `16102606`.
- ✅ **IT-6** — PDF report header/disclaimer/filename now read the selected FY from config. Commit `1ada4e56`.
- ✅ **IT-9** — `IncomeTaxCalculator.test.js` (32 tests): 3 worked examples both regimes, age categories, FY-identical invariant (16 combos), getCurrentFY, RTL smoke. Exported pure `computeTaxForRegime`. Commit `38712748`.
- ✅ **IT-8** — SEO title/description mention both FYs + `SEO.test.js` (2 tests). Investigated an "empty `<head>`" in preview → **preview artifact** (helmet flushes via rAF, throttled in the hidden preview tab), not a bug. Commit `66728b8c`.
- ✅ **IT-10** — Smoke grid across FY × regime × age: all correct, no bugs. Manual real-browser checklist run by user ("everything works as intended"). Flagged a latent SD-display hardcode (spawned task).
- ✅ **IT-7 follow-up** — Per live feedback, scoped auto-scroll to the **regime** toggle only (FY/age scrolling felt too disruptive). Commit `55c15502`.

## Session 43: Cooking Section — recipe hub + 2 illustrated recipe pages

Built a new Cooking section from the separate `srinidhi-cooks` cooking-journal content. Two commits PUSHED + LIVE; an SEO follow-up staged-not-pushed.

- ✅ **Cooking landing** (`/cooking`) — intro + a tile per recipe (real Links, green accent), mirrors Finance/Tools. Commit `0ed1d5a7`.
- ✅ **Moringa-pizza page** (`/cooking/moringa-pizza`) — pizza writeup moved off the old flat `/cooking`. Commit `0ed1d5a7`.
- ✅ **Roasted-veg page** (`/cooking/roasted-veg`) — new, from cooking-journal Session 01; later rewritten (per a relayed brief) into a personal, "as it happened" story — opening, in-the-moment `Aside`s, the parchment near-fire as a scene, a feeling-led close. Commits `0ed1d5a7`, `18bf5d01`.
- ✅ **Shared `RecipeBits`** + 40 web photos + routes/breadcrumbs/SEO + Home "Cooking Adventures" tile. Commit `0ed1d5a7`.
- ✅ **Comedic "5-star menu" `FancyMenu`** card on both recipes.
- ✅ **Photo polish** — user-directed rotations (lossless `transpose`, regenerated from higher-res sources), bigger single-photo display (`max-w-2xl`), and a masonry → **row-major grid** so step photos read in order. Commit `18bf5d01`.
- ✅ Removed the "I'm an accountant" repeat from the cooking pages (Home keeps the identity).
- 🟡 **SEO structured-data (STAGED, not pushed):** full Recipe JSON-LD (image, recipeIngredient, recipeInstructions, prep/cook/totalTime) + per-page og:image, both recipes. Verified live in the DOM. Awaits a ship call (push = deploy).
- ⏭ **Spawned task:** prerendering — the CSR site means non-JS link-preview bots only see `index.html` homepage defaults; needed for real social previews + full per-page SEO.
