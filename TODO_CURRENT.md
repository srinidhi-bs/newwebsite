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

## Active work

_None in flight._

---
See **TODO_COMPLETED.md** for finished work · **TODO_FUTURE.md** for the backlog · **PROJECT_PHASES.md** for the roadmap · **session_notes/** for per-session detail.
