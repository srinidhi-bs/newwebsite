# Session 54 — Avatar loop, scroll glide, Capital Gains calculator

**Date:** 2026-09-28 (evening) → 2026-10-03, Lenovo
**Headline:** Four small ships, all **PUSHED & LIVE**. 3D Srinidhi now loops forever (whole S53 show, then down the stairs). The Avaturn credit shows on Home only. Investing-game Next/Back glide to the card top. The Capital Gains calculator was fixed for Tax Year 2026-27 after a real client computation exposed three gaps. 201 → 214 tests, `CI=true` build clean.

## What shipped (commits)
- `25a443e8` stairs-only avatar (**superseded**). He had picked option "2A", and its text said the walk and T-sit would go; he wanted them kept. → `e74f886c` restores the S53 code exactly (git checkout of `235e55b2`'s file) and adds, after the T-sit: rest 4 s → `standT` → `hop`/`perch` down every `.rule` + footer line visible on screen (sideways hop, turn at a line's end; lines within `robotPx×0.5` of the header are skipped) → `hop (exit)` out the bottom → `fall` (Jump clip frozen at 50%, k² drop) → `land` → `resit` (stand-up clip reversed) → `sit` → whole show again.
- `a7f0ed9f` Avaturn credit Home-only, 10 px. He first asked to remove it; the options showed that removing it breaks Avaturn's terms.
- `b7843e47` → `a7e126aa` StoryPlayer: Next/Back `scrollTo` smooth, then stop where the card top sits 16 px under the fixed header, moving up only (his two screenshots).
- `db45b162` Capital Gains calculator:
  - CII 2026-27 = **384** (Notif. 85/2026, 15-07-2026); the table had stopped at 376.
  - Step 4 stores BOTH gains. `computeFinalOutcome` compares A (12.5%) and B (20% indexed) **after** exemptions, as s.197 / the old s.112 proviso does. Steps 5 and 6 and the PDF all use it.
  - `sectionLabel()` gives 82/85/86 for sales from 1-Apr-2026.

## The client side job (Guruprasad / C Prasadhu — cousin's building)
- Facts:
  - site 19-12-1997 ₹50,000;
  - GF+FF 2000 ₹3,50,000;
  - SF 2014 ₹5,80,000;
  - expenses ₹2 L;
  - house budget ₹75 L;
  - guidance value ₹5,000/sq ft (he corrected it from ₹8,000).
- **Dual review:** my script (calculator formulas) and a blind agent working from the law agreed to the rupee.
  - At ₹1.9 cr: gain A ₹1,78,20,000, gain B ₹1,63,36,000.
  - House + bonds → tax ₹7,60,760, including surcharge.
  - Nil tax needs bonds ₹50 L + house ₹1,13,36,000, because the B leg is zero.
- **FMV-2001 sensitivity** (₹10 L): exemptions flip the answer to B (₹3,18,656). This is the case the old calculator got wrong.
- **PDF redone at 4 sale values (1.75 / 1.5 / 1.25 / 1 cr).**
  - Surcharge band uses **A's taxable gain = total income**; the indexed computation only caps the tax.
  - At ≤1.5 cr, house 75 L + bonds 50 L → nil.
- **He trimmed the requests:** no sale-deed check (we trust what the client says), no other-income question. Still awaited from him: the 1-4-2001 guidance value and the areas.

## Lessons
- **An option that REMOVES existing behaviour must say so on its own line.** "2A … the walk and T-sit go away" was buried in a sentence, and it cost one rebuild.
- **Hidden preview pane:** smooth scroll never animates there (it's rAF-driven). Prove the call by wrapping `window.scrollTo`, and prove the pane can scroll with an instant `behavior:'auto'` probe.
- **Reading a pdf-lib report in the preview:** capture the blob via `URL.createObjectURL`, then decode it outside. `DecompressionStream` hung in the hidden pane.
- **Live-chunk check:** Vercel's chunk hash can differ from the local build. Read the live `main.*.js` chunk map (`149:"c45dbfe7"`), then grep that file.

## Manual test plan (pending — his devices)
- [ ] Phone: one full avatar cycle (~30 s) on www.srinidhibs.com.
- [ ] Phone: Next on a long S2 screen → glides to card top under the header.
- [ ] Live calculator: Guruprasad at ₹1.9 cr, cost 4 L + SF 5.8 L (Oct-2014), house 75 L + bonds 50 L → Option A ₹6,91,600; with FMV 10 L → Option B ₹3,18,656 and the "now gives the lower tax" note.
