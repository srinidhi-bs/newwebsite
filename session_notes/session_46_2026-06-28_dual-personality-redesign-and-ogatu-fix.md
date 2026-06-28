# Session 46 — Radical "Dual Personality" redesign (RD-1→RD-4) + Ogatu web-game fix
**Date:** 2026-06-28

A long, two-thread session: the radical UI redesign (the main work) plus an
interruption to diagnose & fix the live Ogatu web game.

## Thread A — Radical Redesign "Dual Personality" (RD-1 → RD-4)

**Concept (user-approved via office-hours + autoplan):** the light/dark theme
toggle becomes a full personality switch — **light = neo-brutalist "Playground"**
(cream, chunky black borders, hard offset shadows, tilted sticker cards, Archivo
Black), **dark = glass "Laboratory"** (deep-space navy, aurora glows, frosted
glass, cyan neon, mono accents). The duality *is* the person (playful cook /
precise finance-tools builder). Design doc:
`~/.claude/plans/srinidhibs.com/radical-redesign-dual-personality.md`.

Pipeline: `/office-hours_gstack` → interactive mockup → `/autoplan_gstack`
(CEO: Hold Scope + 2 tweaks · Design: 7 dims, P1–P4 folded in · Eng: 4 concerns
absorbed). v1 scope = "Face first" (tokens + shell + Home; landings inherit).

**RD-1 — token foundation** (`48960834`):
- `src/styles/tokens.css` — both personality token sets; colors as **RGB channel
  triplets** so Tailwind opacity modifiers (`/<alpha>`) keep working; compound
  tokens for border/shadow/radius (structure changes per personality, not just
  color); accent-per-section map.
- `src/styles/motion.js` — `usePersonalityMotion()` → {transition, isLab,
  reduced}; Playground spring / Lab tween / reduced-motion instant.
- `tailwind.config.js` — semantic utilities mapped to tokens (bg-surface,
  text-ink, font-display, shadow-card, accent-*).
- `index.css` — component "skins" in `@layer components` (card/btn/badge/display).
- self-hosted fonts via @fontsource (Archivo Black, Space Grotesk, JetBrains Mono).

**RD-2 — anti-flash + morph** (`cfb4b197`):
- Inline `<head>` script in `public/index.html` applies `.dark` before first
  paint (mirrors ThemeContext init exactly; try/catch) → a dark user never
  glimpses the Playground while React boots.
- `.theme-morph` class on `<html>` for 650ms around the toggle → every element
  transitions colors/borders/shadows/radii (the Playground *melts* into the
  Laboratory). Skipped under reduced motion. transform + font-family excluded
  (Framer owns transforms; fonts can't interpolate).
- Fixed focus rings → layered box-shadows (index.html kills outlines globally).

**RD-3 — shell** (`65d243fb`): nav/footer/toggle wear both skins. Header = yellow
slab + ink rule ☀ / glass strip + luminous hairline 🌙. Toggle = signature chip
("Enter the lab" / "Playground"). Active nav link = CTA-accent underline. Mobile
panel = card-skin. Footer = mono "Made in Bengaluru · ಬೆಂಗಳೂರು". PageWrapper
canvas = ink halftone dots ☀ / static aurora gradients 🌙. LearnGate invisibility
+ body-portal modal preserved.

**RD-4 — Home "SRINIDHI VOL.01"** (`c8f54c4a`): direction chosen via a
**design-panel workflow** (4 divergent concepts → 3 judges on wow/feasibility/
anti-slop → synthesized). Editorial contents-index skeleton with three grafts:
- Masthead per-letter "print registration" reveal — two accent ghost layers
  converge (riso CMYK misprint correcting itself ☀ / sensor calibrating 🌙). One
  Framer mechanism, two readings. Tilt/x via Framer variants only (never CSS).
- Two-voices identity card — same 5 facts re-voiced (warm human sheet ☀ / cold
  mono spec-sheet with dotted leaders 🌙) via AnimatePresence keyed on theme;
  the toggle becomes the bio.
- Live Bengaluru clock (1Hz IST, interval cleared on unmount).
- Four sections as a ruled contents-index (01–04, accent numbers), not a grid.
- Back-cover ad-bar with deep-linked tool chips (badge-skin).
- New CSS helpers: `.rule` (morphing hairline), `.baseline-grid` (zine texture).
- Cut the slop the judges flagged: fake terminal boot, drag-to-fling, fake
  metrics, "counts beans" copy.

**Verification:** both personalities confirmed via computed-style audits (per-theme
reload — the preview can't re-resolve CSS vars on a *live* flip); no horizontal
overflow at 375/desktop; `feature-dev:code-reviewer` second pass = **no
high-severity bugs**; **139/139 tests green** after every task.

**State:** RD-1→RD-4 committed on **local master, NOT pushed** (unfinished; push =
live). RD-5 (landings) + RD-6 (real-browser verify + ship) remain.

## Thread B — Ogatu web game (live at /ogatu) fixed + deployed

A separate "game project" (`C:\Development\games\game-digger`, pygbag/pygame web
build) had pushed the game to **origin/master** (the live branch) — diverging it
from the redesign on local master. The live game was stuck-on-loading.

**Diagnosis (live, via claude-in-chrome on real Edge):** the env was healthy
(crossOriginIsolated:true, all self-hosted assets 200). The **real bug = the bare
path `/ogatu` (no trailing slash)**: `document.baseURI` = `/ogatu`, so the loader's
relative `fopen("ogatu.tar.gz")` resolved to `/ogatu.tar.gz` (site root); that's
not a real file, so the **SPA catch-all rewrite served React `index.html` (200
HTML)** instead of the gzip → game got HTML, couldn't unpack, hung. **`/ogatu/`
(trailing slash) always worked** — the user discovered this, which cracked it.
(An earlier COEP/require-corp/pygame-wheel hypothesis was WRONG — the remote
wheel's `transfer:0` was just an opaque-response size, not a block. Corrected in
memory. Lesson: wait for slow ~20MB WASM loads; don't read cross-origin
`transfer:0` as failure.)

**Fix (DEPLOYED + verified live):** scoped **307 redirect `/ogatu`→`/ogatu/`** in
`vercel.json` (redirects run before the SPA rewrite; a rewrite wouldn't fix
baseURI). Committed **`cdd60156` on origin/master via a temp worktree** (redesign
on local master untouched), pushed with explicit go-ahead → Vercel deployed →
bare URL now 307→/ogatu/ and loads. Game repo CLAUDE.md updated (Session 14,
`b206e2e`, local). Players are on Android/Chrome/Edge.

## Decisions / guidance captured this session
- Keep the game in its **own repo** (different stack; website only hosts the build).
- For Avni & Avyan: a **PyInstaller `.exe`** beats "install Python + run .py"
  (native sound/keyboard, zero install). Web build = "anyone, any device, a link".
- Web-build polish (filed in game `TODO_FUTURE`): on-screen B/R buttons (also
  enables touch), canvas focus + preventDefault, audio-gesture-resume, loading bar.

## ⚠ Carryover / hazards
- **DIVERGENCE:** local master (redesign) vs origin/master (game + /ogatu
  redirect). **MERGE origin/master before pushing the redesign; NEVER force-push**
  (memory: `ogatu-branch-divergence`).
- Redesign is local-only; do not push until RD-5/RD-6 done and the user approves.
- Cooking prerendering (older spawned task) still pending.
