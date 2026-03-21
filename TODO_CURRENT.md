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
