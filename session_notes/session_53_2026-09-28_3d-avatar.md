# Session 53 — 3D Srinidhi on the Home page

**Date:** 2026-09-28 (Mon, ~13:00–18:30 IST), Lenovo
**Headline:** A drift from the plan. The session opened for the S2 phone check, but instead a 3D Srinidhi now lives on Home, **PUSHED & LIVE** (`c35752ea`). He floor-sits on the header line, stands, turns and leaps onto the ನಮಸ್ಕಾರ rule, walks right, stands 4 s, walks back, leaps onto the last T of ACCOUNTANT and sits there. Live-verified by Srinidhi on laptop Edge and his phone. 201/201 tests, `CI=true` build clean.

## What shipped (commits)
- `64cbb5fc` stand-in **robot engine** (CC0 RobotExpressive): `RobotCompanion` gate (no WebGL / reduced motion → skip; lazy chunk; error guard) + `RobotWalker` (plain three.js 0.186.1, small ortho canvas slid onto DOM lines measured every frame). The robot NEVER went live; he wanted only his own avatar there.
- `7c05be88` **portal to `<body>`**: Home's PageWrapper slides in with a CSS transform, and a transformed ancestor makes `position: fixed` relative to it, so he flashed about 140 px low on load.
- Branch `feature/3d-avatar` kept robot work off master until the avatar existed.
- `b107886d` **avatar swap**: `scripts/build_avatar_glb.py` + `public/models/srinidhi.glb` (2.16 → 2.30 MB) + footer credit "3D avatar by Avaturn (modified)".
- `acf3c6dc` floor-sit (chair-sit made standing up float), turn-and-leap (facing the reader while flying sideways looked like gliding); `5c66a568` size back to 80 px / 1.4× head (100 px + 1.8× looked wrong to him).
- `76afb660` **moonwalk fix** + new ending (walk back, leap onto the last T, sit). `c35752ea` box widened to his measured reach (head was clipped) + 4 s stand. `235e55b2` T lookup cached (review).

## Decisions (with Srinidhi)
- Tools: Blender MCP not connected (Blender 5.2 installed) → headless Blender scripts. Ready Player Me is dead (Netflix, 31 Jan 2026).
- **Free only.** Meshy/Tripo EXCLUDED on privacy (Tripo takes all rights to free users' photos; Meshy trains on uploads, no opt-out). Avaturn terms read first-hand: photos used for the avatar + anonymised internal R&D; download free via their Discord bot; **must credit + link + say "modified"; Avaturn keeps the avatar's IP** → he chose GO.
- Mixamo moves made on **Avaturn's sample FBX** (same skeleton), so his face never went to Adobe. (He first uploaded his own GLB by mistake; Mixamo rejected it.)
- Hair/specs: Avaturn had no salt-and-pepper hair or rectangular frames; recolouring stays an optional idea.
- Last T (not the middle one); sit-down = stand-up clip played backwards from the landing crouch.

## Lessons
- **Preview pane gives 0 animation frames.** The method that worked: patch `window.requestAnimationFrame` to a queue and `performance.now` to a fake clock, kick once with a screenshot, then step frames by hand. `canvas.toDataURL()` right after a stepped frame is truthful; page screenshots lag. The same stepping drove a 1,572-frame edge-pixel scan proving nothing clips.
- **Pin the feet, not the hips**, when making a travelling clip "in place". The jump's wind-up leans 0.36 m with feet planted; pinning hips made the feet slide back (moonwalk).
- Mixamo and Avaturn rest poses differ ~7° per bone → transfer the *turn from rest* in world space, never raw local rotations.
- A skeleton's reach sideways (1.19 m ahead mid-jump) sizes the canvas, not his standing width.
- Letter boxes are LINE boxes: the T's top = baseline − cap height (canvas `measureText` metrics).
- Office-hours reframed "show me both styles" → realistic avatar + bobblehead, avoiding a privacy trade for a comparison.

## Side ask
- Capital-gains checklist for his cousin's Ittamadu building sale (WhatsApp draft in his voice). Flagged: GF+1F built pre-2001 → FMV-as-on-1-4-2001 option; a 2026-27 sale falls under the new Income-tax Act 2025 → verify the calculator's rules before final numbers (TODO_FUTURE).

## Manual test plan
- ✅ Laptop Edge (Srinidhi) · ✅ his phone ("phone site also looks good").
- Pending (TODO_FUTURE): Safari / Firefox.
