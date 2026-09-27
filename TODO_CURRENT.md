# Current Tasks

## 🎯 NEXT SESSION BRIEF

**Session 51 (2026-09-26 night, Lenovo) shipped L1 — PUSHED & LIVE, WhatsApp-verified.** Trading page now leads with an "Investing, from zero" card; sitemap = 26 URLs; notebook share image; and a post-build "envelope" script (`scripts/write-share-pages.mjs`) gives every seoConfig page its own `build/<route>/index.html` so WhatsApp shows the right title + picture (cooking pages fixed as a bonus). 178/178 tests, CI build clean. Future pushes still need Srinidhi's explicit go-ahead.

**Next: S2 "Where can money live?"** — research is DONE (background agent, S51): read `~/.claude/plans/srinidhibs.com/research/s2_where_money_lives_research.md` FIRST (summary table + gaps at the bottom; §13 = dual-review cross-check done 27 Sep — all figures CONFIRMED, so don't redo it). Then: storyline options in chat (2-4, plain words, recommend one) → Srinidhi picks → build beats in `src/content/investing/en/sitting2.js` (same flow as S1: content + look decided WITH him).

Decisions already made (don't re-litigate): all S50 rules stand — Option D look, story engine, map home screen, hero = "you", English first, **reader pages show NO sources / city names / dates** (audit trail in code comments), conservative end of ranges. S2 compares places by the three-way trade-off (return · safety · get-money-back) from the full-plan handout.

Caveats: share envelopes need a FRESH build/ (`npm run build` always is). WhatsApp caches previews — test with `?v=N`. After any `npm install`: `rm -rf node_modules/canvas`. Preview pane freezes Framer animations → verify via DOM.

## Active work — "Investing, from zero"

- [ ] **S2 "Where can money live?"** — research ready → storyline options → Srinidhi picks → build → test → ask to push.
- Optional polish: share image's centre square (WhatsApp desktop crops to a square: "…esting, from z…") — see TODO_FUTURE.

---
See **TODO_COMPLETED.md** for finished work · **TODO_FUTURE.md** for the backlog · **PROJECT_PHASES.md** for the roadmap · **session_notes/** for per-session detail.
