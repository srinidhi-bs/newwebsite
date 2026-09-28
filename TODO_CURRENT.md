# Current Tasks

## 🎯 NEXT SESSION BRIEF

**Session 52 (27–28 Sep 2026, Lenovo) shipped Umami analytics + Sitting 2 "Where can money live?" — PUSHED & LIVE** (`48bf7461`, Vercel success, live-checked in a browser). 201/201 tests, `CI=true` build clean. Pushes still need Srinidhi's explicit go-ahead.

**First: Srinidhi's phone walk-through of Sitting 2 (PENDING — preview can't judge animation).** Ask for his findings: race speed (0.9 s/yr ≈ 24 s — one number, `STEP_MS` in `RaceBeat.js`), the moving prices marker + notes, land "?" → ₹1.5 crore ✱, bet descriptions + compare cards readable on a phone. He also said he has more S2 observations — take those next, same flow (edit → test → preview-check → commit → ask to push).

**Open suggestions awaiting his yes/no:** (a) merge S2 screens 3 "Your options are" + 4 "Your bet" (same 7 options twice, back to back) → 13 screens; (b) `s2-line` opens "Remember Sitting 1?" — odd for a reader who skipped S1 via "open it anyway".

**Then: S3 "What is a share?"** — same flow as S1/S2: research agent first (two sources each, file in `~/.claude/plans/srinidhibs.com/research/`), dual-review cross-check, then 2-4 storyline options IN CHAT → he picks → draft screen text for approval → build.

Decisions already made (don't re-litigate): reader pages show no sources/dates (audit trail in content-file comments); **Bengaluru is named for the land example — deliberate exception; locality/family NEVER on the page**; shares = ⅓ Nifty 50 + ⅓ Midcap 150 + ⅓ Smallcap 250 TRI, Nifty 50 alone before 1 Apr 2005, split once, never rebalanced; debt funds belong in Sitting 5; "Play again" is the answer-reset (no per-question change button).

Caveats: preview pane is often hidden → Framer animations freeze (counter advances, old screen stays) — verify via DOM or by loading a screen directly through localStorage `ifz-progress-v1`. Srinidhi's Edge runs uBlock → Umami blocked there (his visits don't count — by choice). The Claude extension browser "Google Sheets here" IS his Edge (use `switch_browser` popup). After `npm install`: `rm -rf node_modules/canvas`.

## Active work — "Investing, from zero"

- [ ] **S2 live phone check + his remaining S2 observations**
- [ ] **S3 "What is a share?"** — research → options → build

---
See **TODO_COMPLETED.md** for finished work · **TODO_FUTURE.md** for the backlog · **PROJECT_PHASES.md** for the roadmap · **session_notes/** for per-session detail.
