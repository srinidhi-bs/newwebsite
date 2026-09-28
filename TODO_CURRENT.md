# Current Tasks

## 🎯 NEXT SESSION BRIEF

**Session 53 (28 Sep 2026, Lenovo) put a 3D Srinidhi on the Home page — PUSHED & LIVE** (`c35752ea`; review-fix `235e55b2` + docs local, push only on his go-ahead). Live-checked on laptop Edge AND his phone ("phone site also looks good"). 201/201 tests, `CI=true` build clean.

**The avatar (done — don't re-open unless he asks):** Avaturn avatar + 7 Mixamo moves → `scripts/build_avatar_glb.py` (Blender 5.2 headless; inputs in `C:\Development\avatar-work\`, NOT in the repo) → `public/models/srinidhi.glb` (2.3 MB) → `src/components/robot/RobotWalker.js` (lazy, three.js 0.186.1). Script: floor-sit on header → stand → turn + leap → walk right → stand 4 s → walk back → leap onto ACCOUNTANT's last T → sit forever. 80 px / head 1.4× (100 px + 1.8× tried and REJECTED). Footer credits Avaturn (their terms). Tunables = constants at the top of RobotWalker.js.

**Next: the plan he parked this morning** — his phone walk-through of Sitting 2 + his remaining S2 observations, then **S3 "What is a share?"** (research agent → dual review → 2-4 storyline options IN CHAT → he picks → draft text → build).

**Open S2 suggestions awaiting yes/no:** (a) merge S2 screens 3+4 (same 7 options twice) → 13 screens; (b) `s2-line` opens "Remember Sitting 1?" — odd for a reader who skipped S1.

Decisions already made (don't re-litigate): reader pages show no sources/dates; Bengaluru named for the land example only; shares = ⅓ Nifty 50 + ⅓ Midcap 150 + ⅓ Smallcap 250; debt funds → Sitting 5; "Play again" is the answer-reset.

Caveats: preview pane gives 0 animation frames — test motion by patching `requestAnimationFrame` + `performance.now` to a manual clock and stepping it (S53 method, see session notes); screenshots there lag reality, but `canvas.toDataURL()` right after a stepped frame is truthful. After `npm install`: `rm -rf node_modules/canvas`.

## Active work — "Investing, from zero"

- [ ] **S2 live phone check + his remaining S2 observations**
- [ ] **S3 "What is a share?"** — research → options → build

---
See **TODO_COMPLETED.md** for finished work · **TODO_FUTURE.md** for the backlog · **PROJECT_PHASES.md** for the roadmap · **session_notes/** for per-session detail.
