# Project Phases

## Phase 1: PDF Tools Implementation ✅
- PDF Merger
- PDF Splitter
- PDF to JPG Converter
- JPG to PDF Converter

## Phase 2: Content Pages ✅
- Home page
- Finance page
- Trading page

## Phase 3: UI/UX Enhancements ✅
- Responsive design
- Loading states
- Dark mode
- Animations and transitions

## Phase 4: Performance & Polish ✅
- Bundle cleanup & analysis tooling
- Caching & delivery optimization
- Core Web Vitals monitoring
- SEO & meta tags

## Phase 5: Capital Gains Tax Exemption Calculator ✅
- Step 1: Asset Details ✅
- Step 2: Dates & Holding Period ✅
- Step 3: Cost Computation ✅
- Step 4: Capital Gain Computation ✅
- Step 5: Exemption Options (Sec 54, 54EC, 54F) ✅
- Step 6: Results, Deadlines & Polish ✅

## Phase 6: Additional PDF Tools (in progress)
- PDF Page Numbers ✅

## Phase 7: Calculator Enhancements
- Capital Gains Calculator: PDF Report Generation ✅ (Session 38)
- Capital Gains Calculator: CII Fallback Bugfix ✅ (Session 38)
- Capital Gains Calculator: Comprehensive Test Suite (104 tests) ✅ (Session 38)

## Phase 8: Finance Calculator Additions
- SIP Comparison: FD vs Equity ✅ (Session 39)

## Phase 9: Income Tax Calculator — Multi-FY Support ✅ (complete, Session 42)
- IT-1: Extract `tax-config.js` with FY 2025-26 data ✅ (Session 40)
- IT-2: Parameterize `computeTaxForRegime` by FY + `reconcileDeductions()` ✅ (Session 41)
- IT-3: FY pill toggle + caption + `getCurrentFY()` default ✅ (Session 41)
- IT-4: Age-category pills (General/Senior/Super-senior) + senior slab schedules ✅ (Session 41)
- IT-5: Populate FY 2026-27 config (reference-reuse of FY 2025-26) ✅ (Session 42)
- IT-6: PDF generator: dynamic FY in header + filename ✅ (Session 42)
- IT-7: Auto-scroll results into view on regime change (mobile) ✅ (Session 42)
- IT-8: SEO meta mention both FYs + SEO render test ✅ (Session 42)
- IT-9: Tests (FY 2026-27, senior/super-senior, FY-invariant, 3 worked examples) ✅ (Session 42)
- IT-10: Manual smoke grid + bug fixes ✅ (Session 42)

## Phase 10: Test Infrastructure (Session 41)
- Fixed pre-existing broken Jest suite: react-router v7 resolution (craco moduleNameMapper) + jsdom polyfills (TextEncoder/matchMedia/scrollTo). 3 suites / 105 tests green. ✅

## Future Enhancements
- Blog integration
- Additional PDF tools
- Capital Gains Calculator: Save/Load, Visual Charts, STCG support, Worked Examples
- Income Tax Calculator: Year-over-year comparison toggle, "What's New" callout, localStorage scenario save, URL-shareable state
