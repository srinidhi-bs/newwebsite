# Session 48 — Ship the Dual-Personality redesign (+ teal recolor + masthead fix)

**Date:** 2026-08-04 (Lenovo) — this thread spanned the gap: RD-5/RD-6 were done 2026-06-28, the **ship** happened 2026-08-04.
**Headline:** The redesign is **LIVE on Vercel.** `origin == local`.

## What shipped
- **RD-5 — landings graceful-inherit** (`4024b06b`, done 2026-06-28): a 9-agent parallel audit of every landing/content route confirmed they all survive the new cream/navy canvas (their original authors paired `dark:` variants on every colour). Only **one** genuine break: the 404 watermark (`text-gray-200 dark:text-gray-700`, ~1.15:1 on cream → invisible) → `text-ink/20`. Also retokened `Breadcrumbs.js` (`text-ink-muted` → hover `text-accent-cta`, `text-ink` current). Landing card/CTA seams **consciously deferred** (user chose strict scope).
- **RD-6 — ship-hardening** (`283d74fc`, done 2026-06-28): a pre-ship adversarial review + shared-chrome audit found 3 issues, all fixed:
  1. **CRITICAL deploy-blocker** — an unused `transition` var in `Home.js` → `CI=true npm run build` (what Vercel runs) failed as "warnings-as-errors". The redesign could not have deployed. Removed it.
  2. **HIGH crash** — `ThemeContext` read `localStorage` unguarded in a synchronous render-path initializer → crashes the whole app in Safari "Block All Cookies"/private modes. Added a `safeStorage` try/catch helper (mirrors the anti-flash script).
  3. **MEDIUM** — the legacy global `button { focus:ring-gray-500 }` leaked a gray focus ring onto the new bare buttons → replaced with `button:focus-visible { box-shadow: var(--focus-shadow) }` (personality ring; skins + nav's `focus:ring-0` still win by specificity).
- **Teal recolor** (`f3adc66c`, 2026-08-04): per live review, the Playground CTA accent flipped pink `#FF5D8F` → **teal `#0891B2`**. One token (`--c-accent-cta`) drives the masthead "CODES", primary buttons, nav underline, breadcrumb hovers. First tried `#14B8A6` but it collided with the finance-green (`#06D6A0`) that `badge-skin` uses for the Home tool chips → went **bluer** to separate them. Dark mode already cyan (unchanged). Swept the stale "pink" comments across 5 files.
- **Merge + ship** (`5303b168` merge, pushed): `git fetch` → confirmed origin's 6 commits are the **Ogatu game** (`public/ogatu/**` + `vercel.json`) with **zero file overlap** with the redesign → clean auto-merge (both preserved) → tests + CI build green on the merged tree → `git push` (fast-forward, no force). Vercel deployed.
- **Masthead fix** (`4f8782dd`, 2026-08-04): user viewed production at 100% zoom and "ACCOUNTANT" broke mid-word into "ACCOUNTA / NT". Root cause: `clamp(2.5rem, 13vw, 9rem)` — `13vw` is too big for a 10-letter word (~104vw wide), and the `overflow-wrap:anywhere` safety broke it. Both big lines → `clamp(2.25rem, 8vw, 7.5rem)`. User-verified on localhost at 100%.

## Key decisions
- **Strict RD-5 scope** (asked the user): fix only the one real break + shell breadcrumbs; defer the landing card/CTA restyle to a later session (matches the CEO-review deferral). No scope creep.
- **Bluer teal over greener** — separates the CTA from the finance-green tool chips; a design clash the user spotted immediately at the back-cover ad bar.
- **Merge, never force-push** — origin carried the live Ogatu game; verified disjoint file sets before merging.

## Lessons
- **Vercel builds with `CI=true` → ESLint warnings FAIL the deploy.** A plain local build masks it. ALWAYS `CI=true npm run build` before shipping. (memory: `project-vercel-ci-build`.) This caught the deploy-blocker.
- **Oversized `clamp()`/vw display type overflows on desktop** — `13vw × ~0.8em × 10 chars ≈ 104vw`, and Tailwind's stepped `container` caps below the viewport at breakpoint boundaries so vw type overflows there. My RD-6 responsive check only tested 360px mobile; the user's **80% browser zoom masked it** locally. Verify hero type at desktop widths (~1024/1280/1440) AT 100% zoom. (memory: `project-masthead-vw-overflow`.)
- **The ship-readiness review earned its keep** — found a deploy-blocker + a crash + a focus bug that 139 green tests never would have.

## Verification
- **139/139 tests** at every step; `CI=true` build clean (exit 0, "Compiled successfully", 108.7 kB main) on the merged tree.
- Programmatic (dev server): morph mechanism (class add/flip/self-remove), CWV (CLS 0.000 / LCP 180ms), no console errors, 360px no-overflow both themes.
- Real-browser (user, Edge): teal + masthead + overall look at 100% zoom.

## Still open (TODO_FUTURE)
- Landing restyle (adopt tokens) — the deferred seams; best next task.
- `public/sitemap.xml` still has **no /cooking URLs** (4 missing) — cheap SEO win.
- Prerendering for social/SEO on the CSR site; dead-file cleanup (`calculators/IncomeTaxCalculator.js`, `layout/ThemeToggle.js`).
