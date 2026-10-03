# Current Tasks

## 🎯 NEXT SESSION BRIEF

**Session 54 (28 Sep → 3 Oct 2026, Lenovo) shipped four things — all PUSHED & LIVE** (`origin == local` at the close-out commit). 214/214 tests, `CI=true` build clean.
1. **3D Srinidhi loops forever** — the whole S53 show (sit → leap → walk → pause → back → T-sit) + 4 s on the T → leaps down every line *visible on screen* → out the bottom → falls in from the top → sits on the header → whole show again. Code: `RobotWalker.js` phases `standT / hop / perch / fall / land / resit` (S53 phases untouched).
2. **Avaturn credit** only on Home, 10 px (`Footer.js`, `useLocation`). Terms still met (credit + link + "modified").
3. **Investing game:** Next/Back glide UP until the card's top sits 16 px under the header (`StoryPlayer.js`, `CARD_GAP_PX`); never scrolls down.
4. **Capital Gains calculator:** CII 2026-27 = 384; Option A vs B compared AFTER exemptions (`computeFinalOutcome`, used by Steps 5, 6 + PDF); sales from 1-Apr-2026 show "Section 82 (old 54)" / 85 / 86.

**PENDING live checks (his real devices):** (a) phone: one full avatar cycle (~30 s); (b) phone: the glide on a long S2 screen; (c) the calculator on the live site with Guruprasad's case — expect A ₹6,91,600 at ₹1.9 cr with house 75 L + bonds 50 L.

**Then: the plan parked since S52** — his S2 phone walk-through + notes, then **S3 "What is a share?"** (research agent → dual review → 2-4 storyline options IN CHAT → he picks → draft → build). Open S2 yes/no: (a) merge S2 screens 3+4 → 13 screens; (b) `s2-line` "Remember Sitting 1?" reads oddly for a reader who skipped S1.

**Side job (not code):** Guruprasad (C Prasadhu) capital-gains draft PDF sent — 4 sale values (1.75/1.5/1.25/1 cr). Awaiting from him: 1-4-2001 guidance value + site/built-up area. Working: scratchpad `cg_prasadhu.py`, `cg_table3.py` (session-only) — the method + figures are in session_notes/session_54.

Decisions already made (don't re-litigate): avatar opening + T-sit stay, the loop comes AFTER them; credit Home-only (removing it breaks Avaturn's terms); glide not jump; trust client-given facts (no deed check); surcharge in client PDFs uses A's taxable gain as total income.

Caveats: preview pane = 0 animation frames → step a fake rAF/performance.now clock (S53/S54 notes); smooth scroll can't be seen there either. After `npm install`: `rm -rf node_modules/canvas`.

## Active work — "Investing, from zero"

- [ ] **S2 live phone check + his remaining S2 observations**
- [ ] **S3 "What is a share?"** — research → options → build

---
See **TODO_COMPLETED.md** for finished work · **TODO_FUTURE.md** for the backlog · **PROJECT_PHASES.md** for the roadmap · **session_notes/** for per-session detail.
