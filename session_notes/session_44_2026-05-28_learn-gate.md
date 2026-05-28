# Session 44 — "Learn" gate (hidden password link to intern lessons)

**Date:** 2026-05-28
**Duration:** Medium, interactive (resumed mid-implementation; "Let's run" called partway).
**Focus:** Surface a separate project's study lessons (`teach-pannaga`, for intern Pannaga) inside this site behind a **hidden, password-protected "Learn" link** in the top nav. Driven by a complete handover spec at `C:\Development\teach-pannaga\handover\srinidhibs-learn-gate.md`.

## What Was Done

### Commit `52028fc2` — Learn gate v1
- **Copied lesson files** → `public/learn/`: `index.html`, `business-entities.html`, `css/style.css`, `js/lesson.js`, `topics/{proprietorship,partnership,company}.html`. CRA serves `public/` at the domain root, so they're live at `/learn/...` after deploy.
- **`src/components/layout/LearnGate.js`** (new): an invisible `<button>` (`opacity-0`, `aria-hidden`, `tabIndex -1`) rendered as the last nav `<li>` (right of Contact). Click → small password modal. Password `Learn` → `window.location.href = '/learn/index.html'` (leaves React, loads the static lessons). Wrong password → inline error. Secret + URL are plain constants.
- **`Navigation.js`**: import + `<LearnGate />` after the `menuItems.map(...)` (NOT added to `menuItems`, so it stays invisible and out of the active-highlight logic).
- **Security is intentionally weak** (client-side word, public lesson files) — non-sensitive study material; no backend/hardening, per the spec.

### Uncommitted fixes (after self- + user-testing) — pending the push
1. **Modal clipping (bug).** "Enter the password" was cut off at the top; the dark backdrop only covered the header band. **Root cause:** the site `<header>` uses `backdrop-blur-sm` (`backdrop-filter: blur(4px)`), and a CSS backdrop-filter **creates a containing block for `position: fixed` descendants** — so the modal (rendered inside the nav, inside the header) sized to the 112px header instead of the viewport. **Fix:** render the modal via `createPortal(..., document.body)` so it escapes the header. Verified: backdrop now covers the full viewport, form centered, heading visible; React events still bubble through the portal (wrong-password path confirmed).
2. **Exit link (request).** The lessons home had no way back to the main site. Added "← Back to srinidhibs.com" (`href="https://srinidhibs.com/"`, absolute) reusing the lessons' existing `.lesson-top`/`.home-link` styles. User chose: add it in the **teach-pannaga source** (so it survives re-copy) + re-copy; **scope = learning home only**.
3. **Mobile tap target (UX).** On mobile the invisible link was only 71px wide (left-aligned below Contact) vs the full-width nav rows — easy to miss. Added `w-full text-left` (mirrors the visible buttons): mobile → full 343px row below Contact is tappable; desktop → unchanged 39px spot right of Contact (flex row shrinks it to content).

## Verification (all programmatic via preview MCP; screenshots timed out — a known renderer quirk here)
- `/learn/index.html` → "Let's Learn" home; `business-entities.html` → 3 topics; `proprietorship.html` paging 1→6 + quiz (correct=green `option correct`, wrong=red `option wrong`); partnership/company serve 200 with resolved relative assets.
- Invisible "Learn" is the 7th nav button (`opacity:0`, `aria-hidden`, `tabIndex -1`), right of Contact; click opens modal (autofocus + backdrop); wrong pw → error, stays on `/`; `Learn` → navigates to `/learn/index.html`.
- Modal styling: dark (`gray-800` form / `gray-700` input / white text) + light (white / `gray-900`).
- Mobile (375px): lessons responsive (`max-width:520px` media query); modal centered & fits; full-row tap target below Contact. Desktop (1280px) unchanged.
- **Tests 139/139** green after every change.

## Files
- **New:** `src/components/layout/LearnGate.js`, `public/learn/**` (7 files).
- **Modified (this repo):** `src/components/layout/Navigation.js`.
- **Modified (teach-pannaga repo):** `index.html` (exit link in the source).

## Lessons / Notes
- **`backdrop-filter` traps `position: fixed`.** Any ancestor with `transform`, `filter`, `perspective`, `will-change`, OR **`backdrop-filter`** becomes the containing block for fixed descendants. The header's `backdrop-blur` did this. A modal living inside a blurred/transformed header MUST portal to `<body>`. (My first hypothesis only checked `transform` and missed it — confirmed by walking ancestors for `backdropFilter`.)
- **Handover facts can be stale — sanity-check.** The spec said hosting = **Apache** (`.htaccess`); the repo actually deploys on **Vercel** (`vercel.json` catch-all rewrite, plus a `gh-pages` script). Implementation was unaffected: on Vercel the filesystem is checked before `rewrites`, so a real file `/learn/index.html` is served directly (same logic as Apache `!-f`). The handover's optional `.htaccess !-d` edit is moot.
- **`preview_click` can't actuate an `opacity:0` element** (the tool's actionability check), but a real mouse can (opacity-0 keeps `pointer-events:auto` + layout box). Drove the gate via the element's real `.click()` to test the React handler; flagged the real-mouse-click as the one thing for the user to confirm by hand.
- **`public/learn/` is a COPY** of teach-pannaga; a future re-copy overwrites edits here. The exit link now lives in the **source**, so it survives. Re-copy command is in the handover Step 1 / maintenance note.

## Next Session
1. **If user approves the push:** commit the 3 fixes (this repo), commit + push the teach-pannaga source edit (separate repo), then push srinidhibs.com — which also ships the **held SEO commit `2570c272`** and triggers the Vercel deploy. Then re-verify live at `https://srinidhibs.com/learn/index.html` and via the hidden link (real mouse, light+dark, phone).
2. Tell the teach-pannaga project that Pannaga reaches the lessons via this hidden gate.
3. Carryover from Session 43: prerendering (spawned) + ship the staged Cooking SEO (now bundled into this push).
4. **Optional polish noticed:** opening the gate doesn't close the mobile hamburger menu (modal covers it; menu still open underneath after Cancel). Harmless; could `setMenuOpen(false)` in `openGate` if it bugs you.
