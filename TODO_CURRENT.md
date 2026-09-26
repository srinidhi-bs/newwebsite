# Current Tasks

## 🎯 NEXT SESSION BRIEF

**Everything from Session 49 (2026-09-23, Lenovo) is LIVE. `master == origin/master`, working tree clean. Nothing blocked.**

Shipped in S49 (don't redo): typewriter masthead CODES→COOKS→TRADES · sitemap 25 URLs · Google Search Console property (`https://www.srinidhibs.com/`, mailsrinidhibs@gmail.com, HTML-tag verified, sitemap = Success/25) · deps pinned exact · landing restyle 1A (all 5 section pages on `SectionHeader` + `card-skin`/`tile-skin`) · Cooking cards with enhanced 4:3 covers.

Decisions already made (don't re-litigate): keep "One person, two minds" (it means the two themes); landing restyle = skin swap only, copy unchanged, headings stay `<h2>`; covers are edited COPIES (originals stay on recipe pages); kurma card uses the pan shot `s3_26` (page hero still the rice plate — Srinidhi may ask to switch it).

Best next candidates (pick ONE, small first):
1. **Finance/Tools tiles → real `<Link>`s** — keyboard-reachable + crawlable (Cooking already does it; `tile-skin` styles `:focus-visible`). ~30 min.
2. **Text-safe finance green** — `#06D6A0` on cream is ~1.7:1; add a darker Playground token for TEXT use (kicker + Home contents row).
3. Bigger: **prerendering** (react-snap or similar) — the real Google/WhatsApp/AI-crawler unlock; run `/office-hours` first.

Waiting on Srinidhi (content, not code): Trading page notes; Contact phone → WhatsApp button?

**Standing rules:** push = Vercel live → explicit go-ahead; before ANY ship `CI=true npm run build` + `CI=true npm test -- --watchAll=false` (expect 143/143); never force-push. NEVER remove the `google-site-verification` meta in `public/index.html`. Claude-in-Chrome browsers are Chrome (not Edge). Preview pane hidden ⇒ fade-ins freeze at opacity 0 (artefact).

## Active work — "Investing, from zero" (Session 50, 2026-09-26)

A time-machine story-game on `/trading/investing-from-zero` that teaches a first-time investor money → markets → mutual funds.
Design doc: `~/.claude/plans/srinidhibs.com/investing-from-zero.md`. **Locked:** Option D look · Approach B story engine ·
game = Time Machine + guess-then-reveal + level map · hero = "you" · text in `src/content/investing/en/`.
**Content and look of each sitting are decided WITH Srinidhi in that sitting's own session — never pre-write them.**

- [x] **E1 Engine skeleton** — route, content-file format, StoryPlayer (narration beat, Back/Next, end card), localStorage resume. 158 tests.
- [x] **E2 Interactive beats** — guess (slider → lock → count-up reveal; tap-option ✓/✗), choice (→ your consequence). Next locked until answered; answers saved + wiped on replay. 163 tests. **Awaiting Srinidhi's look-over.**
- [ ] **E3 Level map (~2h)** — Srinidhi's hand-drawn flow as the "you are here" map; locked/unlocked/current. Lift progress state to the page so map + player share ONE copy. EXIT: finishing a sitting unlocks the next node; keyboard reachable.
- [ ] **S1 Sitting 1 content + look (session WITH Srinidhi, ~3h)** — "Why invest at all" (inflation). Sourced data, dual-checked. EXIT: Srinidhi plays it on his phone and approves.
- [ ] **L1 Launch (~1h)** — entry card on /trading, sitemap URL, real share image (replace React-logo `logo512.png`). EXIT: CI build + tests green; WhatsApp preview correct.
- ⚠ Don't push while sitting 1 is placeholder text (the route is public once pushed).

---
See **TODO_COMPLETED.md** for finished work · **TODO_FUTURE.md** for the backlog · **PROJECT_PHASES.md** for the roadmap · **session_notes/** for per-session detail.
