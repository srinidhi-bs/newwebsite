# Current Tasks

## 🎯 NEXT SESSION BRIEF

**Session 50 (2026-09-26, Lenovo) built "Investing, from zero" — engine + notebook map + Sitting 1, **PUSHED & LIVE** at 17:40 (`origin == local`; future pushes still need Srinidhi's explicit go-ahead). Nagendra visit (6 pm) went well — he was very happy. 177/177 tests, `CI=true` build clean.

What it is: a story-game at `/trading/investing-from-zero` teaching a first-time investor (first reader: Nagendra, family friend, 50-55) money → markets → mutual funds. Design doc `~/.claude/plans/srinidhibs.com/investing-from-zero.md`; S1 research `~/.claude/plans/srinidhibs.com/research/s1_inflation_research.md`.

Decisions made (don't re-litigate): Option D look; Approach B story engine (beats in `src/content/investing/en/`); map = home screen drawn from Srinidhi's notebook, in-order unlock + skip-ahead; "How much?" = last sitting (7); hero = "you"; English first, text in content files; **reader-facing pages show NO sources lists, NO city names, NO dates** — audit trail lives in code comments; conservative end of remembered ranges; each sitting's content + look is decided WITH Srinidhi in its own session.

Next (pick with Srinidhi, max 1-2): **L1** — Trading-page card + sitemap + real share image (WhatsApp currently shows the React logo `logo512.png`), then ask to push (makes WhatsApp previews show a real image). **S2** "Where can money live?" (savings a/c, FD, gold, land, shares since 2000 — which beat ~6%?): start a research agent on 26-yr returns first (two sources each), then storyline options. SBI rates already found: SB 4.5%→2.5%, 1-yr FD 9%→6.25% (see research file).

Caveats: after any `npm install`, tests fail on `canvas.node` → `rm -rf node_modules/canvas` (decided). Preview pane freezes Framer exit/fade animations → verify via DOM, not screenshots. Basket prices with pending hikes: Nandini milk (+₹4-5), BMTC fare.

## Active work — "Investing, from zero"

- [ ] **L1 Launch plumbing (~45 min)** — card on /trading, sitemap URL, proper share image. EXIT: CI build + tests green; push only on Srinidhi's go-ahead; then check the WhatsApp preview.
- [ ] **S2 "Where can money live?"** — research agent first, then options → Srinidhi picks → build (same flow as S1).
- Handouts made for the visit (1-page + 6-page full plan PDFs); HTML sources in `~/.claude/plans/srinidhibs.com/handouts/`. The full plan lists every "to verify" figure for S2-S7 — a ready research checklist.

---
See **TODO_COMPLETED.md** for finished work · **TODO_FUTURE.md** for the backlog · **PROJECT_PHASES.md** for the roadmap · **session_notes/** for per-session detail.
