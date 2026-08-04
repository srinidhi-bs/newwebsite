# Current Tasks

## 🎯 NEXT SESSION BRIEF

**The Dual-Personality redesign is SHIPPED & LIVE. Nothing is blocked — pick a task.**

As of **Session 48 (2026-08-04):** `master == origin/master`; the redesign + teal CTA + soya-kurma page + the Ogatu game are all live on Vercel. Working tree clean.

Best next candidates (none urgent):
1. **Landing restyle** — the natural follow-up; the seams RD-5 consciously deferred. Make Finance / Trading / Tools / Cooking / Contact + the tool & calculator pages adopt the token system: `bg-white dark:bg-gray-800…` cards → `card-skin`, gray text → `text-ink` / `text-ink-muted`, blue/indigo CTAs → `text-accent-*`. Page-by-page; run `/office-hours` + `/autoplan` if scope grows. **Guardrail: 139/139 tests after each page.**
2. **Sitemap `/cooking` URLs** — cheap SEO win. `public/sitemap.xml` still has NO cooking URLs; add `/cooking`, `/cooking/moringa-pizza`, `/cooking/roasted-veg`, `/cooking/soya-kurma`.
3. Deeper backlog (prerendering for social/SEO, Capital Gains / Income Tax calculator enhancements, dead-file cleanup) → see **TODO_FUTURE.md**.

**Standing rules:** host = **Vercel**, push = live deploy → **needs explicit go-ahead**; before ANY ship run `CI=true npm run build` (Vercel treats ESLint warnings as errors) AND `CI=true npm test -- --watchAll=false` (expect 139/139). Never force-push (origin carries the Ogatu game — although `origin == local` now).

## Active work

_None in flight — the redesign sprint closed in Session 48._

---
See **TODO_COMPLETED.md** for finished work · **TODO_FUTURE.md** for the backlog · **PROJECT_PHASES.md** for the roadmap · **session_notes/** for per-session detail.
