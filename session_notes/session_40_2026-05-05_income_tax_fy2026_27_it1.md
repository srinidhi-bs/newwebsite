# Session 40 — Income Tax Calculator: FY 2026-27 (IT-1: Foundation Refactor)

**Date:** 2026-05-05
**Duration:** Standard session (started after recovery from a previous chat that crashed mid-response)
**Focus:** Add multi-FY support to Income Tax Calculator. This session: IT-1 only — pure data extraction (no behavior change). Foundation for IT-2 to IT-10.

## Context — recovered from a crashed chat

The user's previous Claude Code chat had completed `/office-hours_gstack` and `/autoplan_gstack` for this feature, generated a research prompt for Claude Chat, and was processing the returned research document when an "API Error: Stream idle timeout" cut off the response. The user exported that chat to `C:\Users\srini\Downloads\session-export-1777982407901` and asked us to pick up.

I parsed the exported JSONL transcript, recovered:
- The full design doc plan (10 tasks, build sequence)
- The research document path (`C:\Users\srini\OneDrive\Desktop\compass_artifact_wf-65d0072c-fe56-44e7-9b0a-6838ff1b7f84_text_markdown.md`)
- The user's autoplan decisions (Hold Scope, P1+P2+P3+P4 design improvements, all eng concerns absorbed into IT-2/IT-3/IT-9)

Saved the research to `docs/research-fy-2026-27.md` and resumed implementation.

## Key Research Finding — Finance Act 2026 (No. 4 of 2026)

Presidential assent: **30 March 2026.** Memorandum to Finance Bill 2026 explicitly states:

> "There is no change proposed in tax rates either in [115BAA/115BAB/115BAC/115BAD/115BAE] or in the First Schedule. The rates… for the assessment year 2026-27 would be same as already enacted."

So FY 2026-27 slabs / rebate / surcharge / cess / deduction caps are **identical** to FY 2025-26. IT-5 becomes a near-copy of FY 2025-26 config. Implementation risk dropped substantially.

The only substantive items that move:
- **HRA city list** expanded — Bengaluru, Hyderabad, Pune, Ahmedabad join the 50% list (Rule 279 of Income-tax Rules 2026). Doesn't affect this calculator since we don't model HRA.
- **Two parallel statutes** — Income-tax Act 1961 and Income-tax Act 2025 (operative 1-Apr-2026). Sec numbers renumber (115BAC→202, 80C→123, 80D→126, 80TTB→Sec 153). UI keeps familiar labels per user decision.
- **80TTB ambiguity** — Tier-3 blogs claim ₹50K → ₹1L raise. Verified against incometax.gov.in (₹50K), ClearTax 80TTB article (₹50K, no Budget 2026 mention), TaxGuru Finance Act 2026 reproduction (no 80TTB amendment). Concluded: ₹50K stands. The ₹1L confusion is the **TDS threshold under Sec 194A** (raised by Finance Act 2025, different statute).

## What Was Done

### 1. New file: `src/components/finance/tax-config.js` (184 lines)
Single source of truth for FY-keyed tax data. Exports:
- `TAX_CONFIG = { '2025-26': FY_2025_26 }` — keyed by FY string
- `FY_2025_26` (internal const) — full FY block with `newRegime`, `oldRegime`, `surcharge`, `cessRate`, display labels
  - Surcharge bracket structure includes `prevOldRate` and `prevNewRate` per bracket — supports the marginal-relief comparison that IT-2's parameterized engine will read
  - Old Regime slabs structured as `slabs: { general: [...] }` — IT-4 will add `senior` and `superSenior` keys
- `FY_LIST = ['2025-26']` — display order array (IT-3 reads this for the FY pill toggle)
- `DEDUCTION_SECTIONS` — the 6-section array (80C, 80CCD(1B), 80D, 80E, 80G, 80TTA/80TTB), moved from IncomeTaxCalculator.js
- `getCurrentFY(now = new Date())` — April 1 cutover; falls back to `FY_LIST[0]` if computed FY isn't yet configured (prevents blank-calculator UX when a new FY arrives before code is updated)

### 2. Edit: `src/components/finance/IncomeTaxCalculator.js`
- Added: `import { DEDUCTION_SECTIONS } from './tax-config';`
- Removed: the 60-line inline `DEDUCTION_SECTIONS` block (now lives in tax-config.js)
- All 6 references to `DEDUCTION_SECTIONS` continue to work via the import

### 3. Other files
- `TODO_CURRENT.md` — added Session 40 section with full 10-task plan + build sequence + research/design doc links
- `FUNCTION_MAP.md` — added `src/components/finance/tax-config.js` section; updated existing IncomeTaxCalculator entries to also list `computeBaseTaxFromSlabs` and `computeSurchargeWithRelief` (which had been there but not documented)
- `CLAUDE.md` — Session Status updated; Current Focus updated
- `PROJECT_PHASES.md` — added Phase 9 (Income Tax Calculator — Multi-FY Support)
- `docs/design-fy-2026-27-income-tax.md` — already in place from the dead chat
- `docs/research-prompt-fy-2026-27.md` — already in place
- `docs/research-fy-2026-27.md` — copied from OneDrive Desktop into project docs

## Testing
- Dev server compiles cleanly (no errors, no warnings beyond existing browserslist age notice)
- Calculator renders at `/finance/income-tax-calculator` with both regimes
- Old Regime sanity check (₹12L gross, default deductions ₹1.5L 80C + ₹25K 80D = ₹1.75L total):
  - Std Deduction ₹50K, deductions ₹1.75L → Taxable ₹9.75L
  - Base Tax ₹1,07,500 (₹12.5K + ₹95K) + Cess ₹4,300 = **₹1,11,800** ✅ matches pre-refactor baseline
- New Regime sanity check (₹12L gross): Std ₹75K → Taxable ₹11.25L → 87A rebate → ₹0 ✅
- All 6 deduction sliders/inputs render with correct max/step/defaultValue
- No console errors

## Files Created
- `src/components/finance/tax-config.js`
- `docs/research-fy-2026-27.md` (copied from OneDrive)
- `session_notes/session_40_2026-05-05_income_tax_fy2026_27_it1.md` (this file)

## Files Modified
- `src/components/finance/IncomeTaxCalculator.js`
- `TODO_CURRENT.md`
- `FUNCTION_MAP.md`
- `CLAUDE.md`
- `PROJECT_PHASES.md`

## Lessons / Notes for Future Sessions
- **Recovering a crashed chat is feasible** when the user exports the session — the JSONL contains everything needed (user messages, tool calls, assistant text, system reminders). Parse with a small Python script. Cost: maybe 20–30% of one session's context.
- **Always verify Tier-3 blog claims against primary statute** — the 80TTB ₹1L claim was widespread but wrong. Three independent authoritative sources resolved it.
- **A small foundation refactor is worth its own commit** — IT-1 has zero behavior change; if anything explodes in IT-2, we have a clean rollback boundary.
- **The autoplan pipeline (CEO + Design + Eng) was already done in the previous chat** — design doc captured all decisions, so this session went straight to implementation.

## Next Session
**IT-2 — Parameterize `computeTaxForRegime` by FY.** The engine currently hardcodes slabs/rebate/std-deduction/surcharge brackets. Replace those reads with `TAX_CONFIG[fy].newRegime.slabs`, `.oldRegime.slabs.general` (until IT-4 adds age categories), `.surcharge.brackets`, etc. Also add `reconcileDeductions(prevFy, nextFy, deductions)` for handling FY transitions where deduction sections might differ — currently a no-op since both FYs share `DEDUCTION_SECTIONS`, but the function exists for IT-5 forward-compat.

After IT-2: IT-3 (FY pill toggle UI) and IT-4 (age-category pills + senior/super-senior slabs) can run in parallel.
