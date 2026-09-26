# Session 50 — "Investing, from zero": story engine, notebook map, Sitting 1

**Date:** 2026-09-26 (Lenovo), ~10:55–15:20 IST
**Headline:** New story-game at `/trading/investing-from-zero` that teaches a first-time investor money → markets → mutual funds. Engine + level map + Sitting 1 are built and **committed, NOT pushed**. 177/177 tests, `CI=true` build clean.

## Why
Srinidhi's family friend (50-55, works for a US company) opened a Groww account and put ₹5k into a liquid fund without knowing how to withdraw. He wants fund names to buy; Srinidhi wants him (and "every ignorant person") to understand first. Talking him through it face to face stops working after ~30 min, so the idea is to build a game-like explainer instead. Srinidhi's hand-drawn flow (Me → Earn → Spend/Save → Why → Where → How much → Equity branch) is the spine.

## Decisions (with Srinidhi)
- **Look = Option D:** guided 2D story + a "you are here" map + ONE 3D set-piece later.
- **Build = Approach B:** a small story engine. Sittings are content files of "beats"; one StoryPlayer plays them. Options were first written only in the design doc; Srinidhi caught that → memory `feedback_options_in_chat`.
- **Game** = Time Machine + guess-then-reveal + level map. **Hero** = "you". **English first**, text kept in content files so it can be translated later.
- **Map** = the home screen, redrawn from his notebook (Caveat font, teal/red ink, ruled paper). Sittings unlock in order, with an "I know this — open it" skip. "How much?" moved to the end (sitting 7).
- **Content rules:** each sitting's content and look are decided with Srinidhi in its own session. Reader pages show **no sources, no city names, no dates** ("personal website"); the audit trail lives in code comments. Remembered ranges use the conservative end.
- **canvas fix:** remove the unbuilt `node_modules/canvas` rather than build it (ignore-scripts stays on).

## What shipped (commits)
- `3ac5ac8c` **E1** — route, StoryPlayer, localStorage resume, content-file format.
- `54b4b600` **E2** — `guess` (slider with count-up reveal / tap ✓✗) and `choice` beats; Next stays locked until answered; answers saved.
- `7dedd51f` **E3** — `LevelMap` SVG; page flow map → `?sitting=N` → finish → celebration + unlock pop; progress lifted to the page via `useStoryProgress`. Adds `@fontsource/caveat` 5.3.0 (pinned exact).
- `097f5e45` **S1 engine** — `split` (spend/save pie), `basket` (one guess, then the prices flip in; multiple computed from the items), `storyText` {placeholders} filled from `derive(answers)`.
- `24a5ef3f` / `cfb443a1` / `46e87e49` **Sitting 1** — 10 screens: salary → pie → why save → steel cupboard → 2026 → basket → cupboard shrinks → inflation → the rule → cliffhanger.

## Data (dual-review)
- CPI-IW Jan 2000 → Jul 2026 = **4.74×** (431 ÷ 4.63 ÷ 2.88 → 153.2). Cross-checks: OECD/FRED 4.72×, World Bank ~6.0%/yr. ₹1 lakh → ~₹21,100 of buying power (~79% lost).
- Basket: petrol ₹28.94 → ₹102.12 and LPG ₹223.30 → ₹942 (PIB Nov 2001 → 2026); milk ₹13 (2004) → ₹46; dosa ₹10–15 → ₹100–150 and BMTC bus ₹1.50–2 → ₹6 (dosa and 2000 bus fare from Srinidhi's memory). Basket = **4.2×**, consistent with CPI (later start years). Petrol-now and milk-now re-verified by Claude.
- Full working: `~/.claude/plans/srinidhibs.com/research/s1_inflation_research.md`.

## Lessons
- Year-2000 Indian retail prices are barely online: newspaper archives before 2008 are blocked or missing. Official records exist only for administered prices (petrol/LPG via PIB).
- A subagent's own helper agents report to the MAIN session, not to the subagent → it waits forever. Forward the results with SendMessage, or don't let research agents spawn helpers.
- The preview pane freezes Framer exit animations too (not just fade-ins): the counter advances but the old beat stays on screen. Verify via DOM.
- `npm install` with ignore-scripts leaves `canvas` unbuilt → jsdom crashes → `rm -rf node_modules/canvas`.

## Manual test plan (live-verify, after push)
1. Phone, real browser: map glows on ①, tap → play all 10 screens, pie drag, basket flips, cupboard numbers match your pie choice.
2. Close the tab mid-sitting → reopen → resumes on the same screen, locked guesses stay locked.
3. Finish → back on the map, "Sitting done ✨", ① shows DONE. Back button from a story → map.
4. Dark mode: night notebook, cyan ink.
5. WhatsApp share of the link → preview image (after L1).

## Evening addendum (17:40–18:00)
- **Pushed** on Srinidhi's go-ahead (fetch showed 8 ahead / 0 behind → clean push; `origin == local`). Sitting 1 is live.
- Made two PDFs for the 6 pm visit (HTML → headless Chrome; Edge headless silently failed while Edge was open): a **1-page handout** (map, inflation, basket, where money lives, his liquid fund, 3 questions before any fund, the 7-sitting road) and a **6-page full plan** (all 17 topics across the 7 sittings; unverified figures marked "to verify"). Sources: `~/.claude/plans/srinidhibs.com/handouts/`.
- Caught while drafting: "invest double the amount 5 years later" does NOT lose to starting early at 12% (₹10.9L vs ₹9.6L), so the line was rewritten. Srinidhi's chat said market hours end at 3:15; the actual close is **3:30 pm**.
- **Outcome:** the meeting went well; Nagendra was very happy.
