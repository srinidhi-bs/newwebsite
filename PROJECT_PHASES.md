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

## Phase 11: Cooking Section ✅ (live, Session 43)
- `/cooking` recipe-hub landing with a tile per recipe ✅
- `/cooking/moringa-pizza` — whole-wheat moringa-pesto pizza writeup ✅
- `/cooking/roasted-veg` — steam-then-roast veg + khichdi (personal "alive" rewrite) ✅
- Shared `RecipeBits` components (hero, photo grid, ingredient tables, method steps, callout, "5-star menu" card) ✅
- Home "Cooking Adventures" tile + breadcrumbs + per-page SEO ✅
- SEO structured-data upgrade (full Recipe JSON-LD + per-page og:image) — **staged, not pushed**
- Prerendering for social/SEO on the CSR site — **spawned as a separate task**

## Phase 12: "Learn" Gate — hidden lessons link ✅ (live, Session 44)
- Invisible "Learn" nav link (right of Contact) + client-side password modal (`src/components/layout/LearnGate.js`) ✅
- Static intern lessons copied into `public/learn/` (served at `/learn/index.html`) ✅
- Modal rendered via React portal to `document.body` (escapes the header's `backdrop-blur` containing block) ✅
- "← Back to srinidhibs.com" exit link on the lessons home (teach-pannaga source + re-copied) ✅
- Mobile: full-row tap target below Contact (`w-full text-left`) ✅
- Tests 139/139 ✅ — **pushed & LIVE** (commits `52028fc2`, `d8888c9f`; confirmed Session 45)

## Phase 13: PDF Merger — images + unified cross-file page grid (Session 45, push held)
- Accept **JPG/PNG** alongside PDFs; each image embedded as a **fitted A4 page** (auto portrait/landscape, scaled-to-fit + centered) — reuses `pdf-lib`, no new deps ✅ (commit `989eaac1`)
- **Unified page grid:** every page of every file is one draggable tile in a single grid; drag any page to any position to interleave across files; merge follows grid order ✅ (commit `c737d27f`)
- Per-page include/exclude (big number = final page number; deselected dim) + per-file remove chips ✅
- Fixes: data-URL image thumbnails (no stale blob URL); `thumbnailCache` pruned on `removeFile`; pdf.js render-task cancelled on cleanup (no "same canvas" race) ✅
- Tests 139/139 ✅; headless interleave-order proof + real-component drag/merge verified; **user live-verified** — **committed locally (`989eaac1`, `c737d27f`); NOT pushed (awaiting go-ahead)**

## Future Enhancements
- Blog integration
- Additional PDF tools
- Capital Gains Calculator: Save/Load, Visual Charts, STCG support, Worked Examples
- Income Tax Calculator: Year-over-year comparison toggle, "What's New" callout, localStorage scenario save, URL-shareable state
