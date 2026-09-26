# Completed Tasks

## Phase 2: Content Pages (Completed 2026-01-17)
- [x] Task 2.1: Implement Home Page Content & Design
- [x] Bug Fix: Production routing issue for Tools pages
- [x] Task 2.2: Implement Finance Page Content
- [x] Task 2.2.1: Update Income Tax Calculator for FY 2025-26
- [x] Task 2.2.2: Implement Capital Gains Calculator
- [x] Task 2.2.3: Add slab-wise breakdown to Income Tax Calculator
- [x] Task 2.2.4: Modify Finance Page (remove HRA/Resources, hide Capital Gains)
- [x] Task 2.3: Implement Trading Page Content (Animations with Framer Motion)
- [x] Task 2.4: Implement Travel Page & Northeast India Sub-page (Cancelled)
- [x] Task 2.5: Implement Image Resizer Tool

## Phase 7: PDF Tools Implementation (Completed)
- PDF Merger Tool
- PDF Splitter Tool
- PDF to JPG Converter
- JPG to PDF Converter
## Phase 0: Maintenance & Hosting Setup (Completed 2025-11-19)
- [x] Task 0.1: Remove authentication and compliance features (commit: 05a862e)
- [x] Task 0.2: Test website functionality after cleanup (commit: 05a862e)
- [x] Task 0.3: Install dependencies and verify build (commit: 05a862e)
- [x] Task 0.4: Configure Vercel hosting

## Sessions 38–48 — completed & LIVE (detail in `session_notes/` + `PROJECT_PHASES.md`)
- **S38** Capital Gains: PDF report generation, CII fallback bugfix, 104-test suite.
- **S39** SIP Comparison calculator (FD vs Equity index fund).
- **S40–42** Income Tax multi-FY (FY 2025-26 + 2026-27): FY-keyed `tax-config.js`, senior/super-senior slabs, FY pill toggle, dynamic-FY PDF. Tests 105 → 139.
- **S41** Test-infra fix: react-router v7 Jest resolution (craco moduleNameMapper) + jsdom polyfills.
- **S43, S47** Cooking section: `/cooking` hub + moringa-pizza, roasted-veg, soya-kurma recipe pages on shared `RecipeBits`.
- **S44** "Learn" gate — invisible nav link + client-side password modal (body-portal), lessons under `public/learn/`.
- **S45** PDF Merger — accept JPG/PNG (fitted A4 pages) + unified cross-file drag page grid.
- **S46–48** **Dual-Personality redesign — SHIPPED & LIVE:** RD-1→RD-6 (tokens/skins/fonts, anti-flash + 600ms morph, shell, "SRINIDHI VOL.01" Home, landing graceful-inherit, ship-hardening) + teal CTA `#0891B2` + masthead desktop fix; merged with origin's Ogatu game, pushed → Vercel. `origin == local`.

## Session 49 (2026-09-23, Lenovo) — polish, SEO, landing restyle (all LIVE)
- [x] Home masthead typewriter: CODES → COOKS → TRADES loop, per-word accent, caret, reduced-motion still (`a42377a7`, +3 tests)
- [x] Sitemap: +9 missing live pages (5 cooking, 2 calculators, 2 tools) → 25 URLs (`43b75a9b`)
- [x] Google Search Console: URL-prefix property added + HTML-tag verified (`2664ad3f`); sitemap submitted → Success, 25 pages
- [x] Dependencies pinned to exact installed versions; lock root synced (`6627eef0`)
- [x] Landing restyle 1A: Finance/Trading/Tools/Cooking/Contact on `SectionHeader` + `card-skin`/`tile-skin` (`6f3a13d4`)
- [x] Cooking cards: finished-dish photo on top, emoji dropped (`aa940509`); kurma pan shot (`f612f40f`)
- [x] Cooking covers: colour-enhanced 4:3 copies + `scripts/make_cooking_covers.py` (`da0f7bb5`)

## Session 50 (2026-09-26, Lenovo) — "Investing, from zero": engine + map + Sitting 1 (committed, NOT pushed)
- [x] Design: /office-hours → Option D look · Approach B story engine · game = Time Machine + guess-then-reveal + level map · hero "you" · text in content files. Doc: `~/.claude/plans/srinidhibs.com/investing-from-zero.md`
- [x] **E1** engine skeleton — route `/trading/investing-from-zero`, StoryPlayer, localStorage resume (`3ac5ac8c`)
- [x] **E2** guess (slider count-up / tap ✓✗) + choice beats; Next locked until answered (`54b4b600`)
- [x] **E3** level map = home screen, redrawn from Srinidhi's notebook sketch (Caveat font, teal/red ink), in-order unlock + "I know this — open it" (`7dedd51f`)
- [x] **S1 engine** — split (spend/save pie), basket (one guess, flips), {placeholders} from derive(answers) (`097f5e45`)
- [x] **Sitting 1** "Why invest at all?" — 10 screens, CPI 4.74× (two sources), 5-item basket 4.2× (`24a5ef3f`, `cfb443a1`, `46e87e49`)
- Tests 143 → 177. Known fix for unbuilt `canvas` after npm install noted in CLAUDE.md.
