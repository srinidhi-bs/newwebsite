# Session 52 — Umami analytics + Sitting 2 "Where can money live?" (the race)

**Date:** 2026-09-27 (Sun, cross-check) → 2026-09-28 (Mon, ~08:10–13:00 IST), Lenovo
**Headline:** Visitor analytics (Umami) and the whole of Sitting 2 are **PUSHED & LIVE** (`48bf7461`). 201/201 tests, `CI=true` build clean. The phone walk-through of S2 is pending.

## What shipped (commits)
- `e9d5d230` S2 research **dual-review**: independent recompute (FD, PPF, gold, Nifty all match) + sources the agent didn't use (ANI, LatestLY, stockpricearchive, Finnovate, Stable Investor). Recorded as §13 of the research file.
- `c365691f` **Umami Cloud analytics**: cookieless Hobby plan (100K events/month, 6 months kept), `data-domains="www.srinidhibs.com"` so local dev sends nothing; `src/utils/analytics.js` `trackEvent` (no-op if blocked); StoryPlayer sends `ifz-sitting-start`, `ifz-screen` ("S1 · 04/10", forward-only, StrictMode-safe refs), `ifz-sitting-finish`.
- `65800ac1` **S2 engine**: `RaceBeat` (lanes race 2000→2026, per-lane prices marker, notes, land `finalOnly` lane "no price until you sell", off-chart, Skip / Watch again, reduced motion) + `CompareBeat` (phone-friendly place cards).
- `3cdfe59a` **Sitting 2 content** — 14 screens, yearly series generated from the researched rates; guard tests keep the finish text equal to the race data.
- Review rounds with Srinidhi: `13451a1c` (S1 "all of your other expenses for a month"; **multi-select "Why save?"**; S2 "The line to beat"), `ac2f372d` (**shares = ⅓ Nifty 50 + ⅓ Midcap 150 + ⅓ Smallcap 250**), `f7511455` (screen order, "Your options are", bet descriptions, FD "in 2000", finish one per line), `23814d38` (race 0.9 s/yr), `48bf7461` (land ✱ + 5-factor footnote).

## Decisions (with Srinidhi)
- Analytics option 2 (visits + game progress) → **Umami**. Blocked visitors aren't counted (accepted). His Edge's uBlock blocks it — confirmed by toggling; keeps his own visits out.
- S2 storyline **A "the race"**; debt funds → Sitting 5; land INCLUDED as his family's real example.
- **Land:** 30×40 site, J P Nagar 8th Phase, **private purchase** (not BDA), B-khata 2001 ≈ ₹1.2 L → A-khata now ≈ ₹1.8 cr (150×). Page says only "a family in Bengaluru"; the story credits the area developing + papers being regularised. Now-value cross-checked: Phase 8 A-khata ₹14,000–16,500/sq ft.
- **Shares mix:** Midcap 150 / Smallcap 250 start 1 Apr 2005 → Nifty 50 alone before, split once, never rebalanced. Result ≈ ₹34 L vs gold ≈ ₹35 L (neck and neck); end-2023 shares ≈ ₹27 L vs gold ₹15 L. Dual review: chained yearly 34.06× vs NSE since-inception CAGRs 34.01×.
- "Play again" already resets answers → no per-question change button.

## Lessons
- **The preview pane is often hidden → Framer animations freeze**, so a click-through test sees the counter advance while the old screen stays. Verify by loading a screen directly (localStorage `ifz-progress-v1`) or reading the DOM.
- **A resource's status 0 in `performance` entries is NOT proof of blocking** — browsers hide it for cross-origin scripts. The real test was `window.umami` never existing.
- The land cross-check changed the story: ₹100/sq ft in 2001 only fit a BDA allotment — asking the family turned it into a truer lesson (B→A khata, a legal gamble that paid off).
- The Claude extension browser "Google Sheets here" is Srinidhi's **Edge** (memory corrected).
- A "DNS_PROBE" error on the site was his router's DNS timing out (site fine on 8.8.8.8 / 1.1.1.1) — diagnose before blaming a deploy.

## Manual test plan (PENDING — Srinidhi's phone)
1. Trading → card → map "Where?" → play S2 end to end.
2. Race: ~24 s feels right; dashed prices marker moves in every lane; notes change (2008, Covid, gold's run); land "?" → ₹1.5 crore ↗.
3. Bet descriptions + compare cards readable; finish ✱ footnote readable.
4. S1 "Why save?": tick several → "That's my answer" → each message shows.
5. Umami dashboard: a phone visit appears with S2 events.
