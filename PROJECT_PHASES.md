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
- IT-1→IT-10 ✅ (Sessions 40–42): FY config extracted + FY 2026-27, FY/age pills, senior slabs, dynamic-FY PDF, mobile auto-scroll, SEO, tests + smoke grid — detail in TODO_COMPLETED / session notes

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
- Invisible nav link + client-side password modal (`LearnGate.js`); lessons copied into `public/learn/`. Detail: session notes 44.

## Phase 13: PDF Merger — images + unified cross-file page grid ✅ (live, Session 45)
- JPG/PNG as fitted A4 pages + one draggable page grid across files (`989eaac1`, `c737d27f`). Detail: session notes 45.

## Phase 14: Radical Redesign — "Dual Personality" ✅ SHIPPED & LIVE (Session 48)
- Concept: theme toggle = personality switch — light = neo-brutalist Playground, dark = glass Laboratory
- Reviewed via office-hours + autoplan (CEO/Design/Eng all approved); doc in `~/.claude/plans/srinidhibs.com/`
- RD-1: Design-token foundation (tokens, skins, fonts, motion vocabularies, tailwind mapping) ✅ (Session 46, `48960834`)
- RD-2: Anti-flash inline theme script + theme-morph transition ✅ (Session 46, `cfb4b197`)
- RD-3: Shell (nav/footer/toggle) in both personalities ✅ (Session 46, `65d243fb`)
- RD-4: Home page rebuild ("SRINIDHI VOL.01" editorial — design-panel workflow) ✅ (Session 46, `c8f54c4a`)
- RD-5: Landings graceful-inherit ✅ (`4024b06b`) — 404 watermark + breadcrumbs retokened; landing seams deferred
- RD-6: Ship-hardening ✅ (`283d74fc`) — Vercel CI build, localStorage crash guard, focus ring
- Teal recolor ✅ (`f3adc66c`) — Playground CTA pink → teal `#0891B2`; masthead desktop fix ✅ (`4f8782dd`)
- ✅ **Merged with origin's Ogatu game (`5303b168`, clean) + PUSHED → LIVE on Vercel** (Session 48). `origin == local`.
- Landing restyle 1A ✅ (Session 49, `6f3a13d4`) — all 5 section pages on `SectionHeader` + `card-skin`/`tile-skin`; typewriter masthead ✅ (`a42377a7`)
- Deferred (TODO_FUTURE): tool/calculator token migration, brand refresh, showpiece layer.

## Cooking Section (ongoing)
- Recipe pages: moringa-pizza ✅, roasted-veg ✅, soya-kurma ✅ — **all LIVE** (soya-kurma shipped with the redesign, Session 48); paneer-ghee-roast ✅ (live)
- Cooking cards show enhanced 4:3 photo covers ✅ (Session 49, `scripts/make_cooking_covers.py`)
- Pattern per recipe: content-only page + 4 registrations (route, breadcrumb, SEO, RECIPES tile)
- Sitemap now lists all cooking URLs ✅ (Session 49); site verified in Google Search Console ✅

## Phase 15: "Investing, from zero" — story-game explainer (in progress, Session 50)
- Design via /office-hours ✅ (Option D: guided story + notebook map + later ONE 3D set-piece)
- E1 engine skeleton ✅ · E2 guess/choice beats ✅ · E3 notebook level map ✅ · S1 engine pieces (pie, basket, placeholders) ✅
- Sitting 1 "Why invest at all?" ✅ (committed, not pushed)
- L1 launch plumbing (Trading card, sitemap, share image) — next
- Sittings 2-7 (Where money lives · What is a share · What moves prices · Mutual funds · The ride · Your plan) — one per session, content decided with Srinidhi
- Later: 3D set-piece (Nifty 25-yr mountain range), Kannada/Hindi

## Future Enhancements
- Blog integration
- Additional PDF tools
- Capital Gains Calculator: Save/Load, Visual Charts, STCG support, Worked Examples
- Income Tax Calculator: Year-over-year comparison toggle, "What's New" callout, localStorage scenario save, URL-shareable state
