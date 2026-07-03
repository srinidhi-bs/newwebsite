# Project: Srinidhi BS Personal Website

## Overview
React-based personal website showcasing informational content and PDF utility tools.
Styled with TailwindCSS.

## Architecture
- **Frontend**: React (Create React App)
- **Styling**: TailwindCSS
- **Routing**: React Router
- **PDF Processing**: pdf-lib, pdfjs-dist, qpdf-wasm (client-side)

## Build & Run
- `npm start`: Run dev server
- `npm test`: Run tests
- `npm run build`: Build for production
- `npm run analyze`: Visualize bundle chunks (requires build first)

## Key Features
- Informational pages (Home, Finance, Trading)
- PDF Tools (Merge — accepts PDF + JPG/PNG with a unified drag-reorder page grid, Split, PDF↔JPG conversion, PDF Resizer, PDF Unlock, PDF Lock, PDF Rearrange, PDF Page Numbers)
- Dark mode support
- Responsive design
- **Animations**: Framer Motion integration
- **SEO**: react-helmet-async for per-page meta tags, Open Graph, Twitter Cards, JSON-LD structured data, sitemap.xml, 404 page
- **Navigation**: Breadcrumb navigation (auto-generated from route, JSON-LD BreadcrumbList)
- **Error Handling**: Global + route-level error boundaries with friendly fallback UI
- **Performance**: Core Web Vitals monitoring, optimized caching headers

## Current Focus
- **Radical Redesign — "Dual Personality" (Session 46), IN PROGRESS, LOCAL ONLY — do NOT push (push = deploy the unfinished redesign live):** the light/dark toggle becomes a full personality switch — light = neo-brutalist **Playground**, dark = glass **Laboratory**. RD-1 design tokens (`src/styles/tokens.css` + `motion.js`, Tailwind mapping, @fontsource fonts), RD-2 anti-flash script + cross-personality morph, RD-3 shell (nav/footer/toggle), RD-4 Home ("SRINIDHI VOL.01" editorial) — all committed on **local master** (`c8f54c4a` + earlier). Component "skins" in `src/styles/index.css`. Design doc: `~/.claude/plans/srinidhibs.com/radical-redesign-dual-personality.md`. **Update (found in 2026-07-02 audit): RD-5 (`4024b06b`) and RD-6 ship-hardening (`283d74fc`) were ALSO committed on 2026-06-28 evening, after the Session-46 wrap** — the redesign is code-complete on local master; what remains is merge-with-origin → real-browser verify → push (= deploy, only with explicit go-ahead). **139/139 tests.**
- **PDF Merger enhanced (Session 45) — PUSHED & LIVE:** the Merger now accepts **JPG/PNG** alongside PDFs (each image embedded as a fitted A4 page) **and** has a **unified cross-file page grid** — every page of every file is one draggable tile; drag any page anywhere (e.g. an image between two PDF pages); the merge follows the grid order. Per-page select + per-file remove preserved. Commits `989eaac1` + `c737d27f` (only `src/components/tools/pdf-merger/PDFMerger.js`) + docs `de0fe1ba`, pushed to origin → Vercel. User live-verified "works as intended."
- **Learn gate (Session 44) + Cooking section & SEO (Session 43): LIVE.** All pushed (origin == local at `041d4fe6` as of Session-45 start; the earlier "push held" notes were stale — the user had pushed intentionally). `public/learn/` is a COPY of `teach-pannaga` — re-copy on lesson updates.
- Phase 9 (Income Tax FY 2026-27) complete from Session 42.

## Session Status
**Last Updated:** 2026-06-28
**Last Session:** Session 46 — two threads.
**(A) Radical "Dual Personality" redesign** (office-hours + autoplan both approved; design doc in `~/.claude/plans/srinidhibs.com/`). Shipped RD-1→RD-4, **all on local master, NOT pushed (unfinished — push = live deploy):**
- RD-1 `48960834` — design-token foundation: `tokens.css` (both personality sets as RGB triplets), `motion.js` (Playground springs / Lab tweens / reduced-motion), `tailwind.config` token mapping, @fontsource fonts (Archivo Black, Space Grotesk, JetBrains Mono).
- RD-2 `cfb4b197` — anti-flash inline theme script in `index.html` + 600ms cross-personality CSS morph on toggle (reduced-motion-safe). Also reworked focus rings to layered box-shadows (index.html nukes outlines globally).
- RD-3 `65d243fb` — shell wears both skins: header (yellow slab ☀ / glass+blur 🌙), the toggle as a labeled signature chip, CTA-accent active underline, card-skin mobile panel, footer rule + ಬೆಂಗಳೂರು mono sign-off, PageWrapper canvas (ink dots ☀ / aurora 🌙). LearnGate invisibility + body-portal preserved.
- RD-4 `c8f54c4a` — Home rebuild "SRINIDHI VOL.01": editorial masthead with a per-letter print-registration reveal (riso misprint ☀ / sensor calibration 🌙), two-voices identity card (same facts re-voiced on toggle = the bio), live Bengaluru clock, ruled contents-index (not a grid), back-cover ad-bar. Direction chosen via a **design-panel workflow** (4 concepts judged → synthesized). `feature-dev:code-reviewer` = no high-sev bugs. Both personalities + mobile/desktop verified via computed styles. **139/139 tests.**
**(B) Ogatu web game — fixed + DEPLOYED.** The live game at `/ogatu` was stuck-on-loading: the **bare path `/ogatu` (no trailing slash)** made the game's relative `ogatu.tar.gz` fetch resolve to the site root, where the SPA catch-all rewrite served React `index.html` (200 HTML) instead of the gzip → game hung. `/ogatu/` always worked. Fixed with a scoped **307 redirect `/ogatu`→`/ogatu/`** in `vercel.json`, committed `cdd60156` on **origin/master** via a temp worktree (redesign on local master untouched), pushed with go-ahead, **verified live**. (Game source stays in its own repo `C:\Development\games\game-digger`; my COEP/wheel hypothesis along the way was wrong — corrected in memory.)
**Next Session Action:** pick a thread. *(Corrected by the 2026-07-02 audit: RD-5 + RD-6 are already committed — see Current Focus.)*
- **Redesign (actual next step):** `git merge origin/master` into local master (see ⚠ CRITICAL below) → re-run tests → real-browser verify (theme-morph + pdf.js; the live clock blocks the headless preview from settling) → push to deploy, ONLY with Srinidhi's explicit go-ahead.
- **Game:** root Claude Code in `game-digger`; fix S12 dynamite/store bugs + L5/L6 tuning; for Avni & Avyan build a **PyInstaller `.exe`** (native sound+keyboard, no Python install); web-build polish (on-screen B/R buttons, canvas focus + preventDefault, audio-gesture-resume, loading bar).
- **⚠ CRITICAL:** local master (redesign) and **origin/master (game + the /ogatu redirect) have DIVERGED** — `git merge origin/master` BEFORE ever pushing the redesign; **NEVER force-push** or the live game is wiped (see memory `ogatu-branch-divergence`).
NOTES: host = **Vercel** (push = live); tests via `npm test -- --watchAll=false`; the Claude preview **can't run the pdf.js worker** and **can't re-resolve CSS vars on a live theme flip** → verify pdf.js rendering AND the theme-morph in a REAL browser.
