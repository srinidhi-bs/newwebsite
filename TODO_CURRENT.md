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

- [ ] Task CG-1: Scaffolding + Steps 1–2 (Asset Details + Dates/Holding Period)
  - Create CapitalGainsCalculatorPage.js page wrapper
  - Add route `/finance/capital-gains-calculator`, Finance tile, SEO config, breadcrumb label
  - Replace CapitalGainsCalculator.js with new wizard skeleton
  - Step 1: Asset type, acquisition mode, taxpayer type, conditional previous-owner date
  - Step 2: Purchase/sale dates, holding period, STCG/LTCG determination
  - Wizard navigation (step indicator, Next/Back), placeholders for Steps 3–6
- [ ] Task CG-2: Step 3 — Cost Computation
  - Purchase price, conditional FMV (pre-2001), dynamic improvements array
  - Sale price, stamp duty value + Section 50C check (10% tolerance)
  - Transfer expenses, summary card
- [ ] Task CG-3: Step 4 — Capital Gain Computation
  - CII table (2001-02 to 2025-26), grandfathering logic (pre-23-Jul-2024)
  - Option A (12.5% no indexation) vs Option B (20% with indexation)
  - Side-by-side comparison cards, expandable breakdowns, "Better Option" banner
- [ ] Task CG-4: Step 5 — Exemption Options (Sections 54, 54EC, 54F)
  - Auto-filter by asset type (Residential → 54+54EC, Plot/Commercial → 54F+54EC)
  - Sec 54: investment + CGAS, Rs. 10Cr cap, two-house option
  - Sec 54EC: bond investment (max Rs. 50L), 6-month deadline, eligible bonds
  - Sec 54F: proportional formula, ownership condition validation
  - Beginner info boxes, running exemption total
- [ ] Task CG-5: Step 6 — Results, Deadlines & Polish
  - Results summary (Gross CG → Exemptions → Net CG → Tax + 4% cess)
  - Timeline with computed deadlines from sale date
  - Beginner FAQ section, disclaimer text
  - End-to-end testing of all 6 steps
