/**
 * RobotWalker — a small 3D Srinidhi who lives on the Home page's black lines.
 * (File keeps its S53 "robot" name: it began with a stand-in robot model.)
 *
 * MODEL: public/models/srinidhi.glb — his Avaturn avatar (Avaturn terms:
 * credited + linked in the footer, marked "modified") with 5 Mixamo moves,
 * packed by scripts/build_avatar_glb.py (Blender, headless).
 *
 * THE SCRIPT (plays once per visit to Home):
 *   1. SIT     — he sits on the header's bottom border, knees up (floor-sit)
 *                (desktop: left of "Home"; phones: in the gap between the
 *                logo and the theme button).
 *   2. STAND   — he stands up on that line.
 *   3. JUMP    — he turns right and leaps forward-and-down onto the ruled
 *                line above "ನಮಸ್ಕಾರ".
 *   4. WALK    — he walks right along that line.
 *   5. IDLE    — at the right end he turns to face you and idles, forever.
 *
 * HOW IT'S DRAWN ("small moving box"):
 *   He is rendered into a tiny see-through <canvas> (about 60×150 px).
 *   Every animation frame we MEASURE where the black lines are on screen
 *   (getBoundingClientRect) and slide the canvas so his feet/seat touch the
 *   line. Measuring every frame is what makes him stick to the lines at any
 *   screen width, while scrolling, and even though the header is FIXED
 *   (never scrolls) while the ನಮಸ್ಕಾರ line DOES scroll.
 *
 *   The canvas ignores the mouse (pointer-events: none) so he never blocks a
 *   click, and is hidden from screen readers (aria-hidden) — he's decoration.
 *
 * Numbers about the model (printed by build_avatar_glb.py, metres):
 *   • he is 1.885 m tall; floor-sitting, his hips are ~0.1 m off the ground.
 *   • "Walking" moves his feet ~1.69 m per second along the ground.
 *   • "Jump" (Mixamo "Jumping Down"): feet leave at 41% of the clip, land at 61%.
 */
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// ── Tunables (change these, not the logic) ────────────────────────────────
const MODEL_URL = `${process.env.PUBLIC_URL}/models/srinidhi.glb`;
const MODEL_HEIGHT = 1.885;        // metres, measured (see header)
const SEAT_Y = 0;                  // seat height above his feet when sitting (metres) — 0 = floor-sit:
                                   // bum AND feet on the line, so standing up needs no float
const HEAD_SCALE = 1.4;            // "bobblehead": bigger head = recognisable at 80 px, and fun
const DESKTOP_MIN_WIDTH = 1024;    // Tailwind "lg" — below this the nav collapses into ☰
const ROBOT_PX_DESKTOP = 80;       // his standing height on screen, desktop (100 tried S53: too big)
const ROBOT_PX_PHONE = 52;         // …and on phones/tablets
const SIT_HOLD_MS = 2500;          // how long he sits before getting up
const STAND_TIME_SCALE = 1;        // <1 = slower stand-up (clip is 2.27 s)
const JUMP_TIME_SCALE = 1;         // <1 = floatier jump (clip is 2.63 s)
const JUMP_TAKEOFF = 0.41;         // fraction of the Jump clip when his feet leave the ledge (measured)
const JUMP_LANDING = 0.61;         // …and when they touch down (measured)
const JUMP_ARC = 0.5;              // extra hop height, × his height in px
const JUMP_HOP = 0.8;              // how far FORWARD (right) he leaps, × his height in px
const WALK_TIME_SCALE = 1;         // leg speed (1 = the clip's natural pace)
const WALK_UNITS_PER_SEC = 1.69;   // ground speed of the clip at time-scale 1 (metres/s, measured)
const TURN_SEC = 0.3;              // how long a 90° turn takes
const FADE_SEC = 0.25;             // cross-fade between animation clips

// The camera's view box, as multiples of his height. Wide enough for his
// arms, tall enough for dangling feet below the line, his hop above it and
// the bigger head.
const WORLD_W = MODEL_HEIGHT * 0.75;
const WORLD_H = MODEL_HEIGHT * 1.9;
const LOOK_Y = MODEL_HEIGHT * 0.5; // camera aims at this height on his body
const CAM_ELEVATION = THREE.MathUtils.degToRad(8);   // looking slightly down
const CAM_AZIMUTH = THREE.MathUtils.degToRad(18);    // from a little to his right

const clamp01 = (t) => Math.min(1, Math.max(0, t));
const easeInOut = (t) => t * t * (3 - 2 * t);   // "smoothstep": slow–fast–slow

// ── Where are the lines? (all in viewport pixels; y = TOP surface of the line) ──

/** The header's bottom border: where he sits at the start. */
function findHeaderSpot(robotPx) {
  const header = document.querySelector('header.nav-skin');
  if (!header) return null;
  const hr = header.getBoundingClientRect();
  const borderPx = parseFloat(getComputedStyle(header).borderBottomWidth) || 0;
  const y = hr.bottom - borderPx;               // top of the black border

  const logo = header.querySelector('button');  // "SRINIDHI BS" is the header's first button
  if (!logo) return null;
  const lr = logo.getBoundingClientRect();

  if (window.innerWidth >= DESKTOP_MIN_WIDTH) {
    // Desktop: left of "Home" — the page margin, if it's wide enough for him.
    if (lr.left >= robotPx * 0.9) return { x: lr.left - robotPx * 0.5, y };
    // Narrow desktop (margin too thin): sit just right of the last nav link.
    const links = header.querySelectorAll('nav li button');
    const last = links[links.length - 1];
    if (last) return { x: last.getBoundingClientRect().right + robotPx * 0.6, y };
    return { x: lr.left + robotPx * 0.5, y };
  }

  // Phones/tablets: the empty gap between the logo and the theme button.
  const toggle = header.querySelector('[aria-label="Toggle dark mode"]');
  const gapRight = toggle ? toggle.getBoundingClientRect().left : window.innerWidth;
  return { x: (lr.right + gapRight) / 2, y };
}

/** The ruled line above "ನಮಸ್ಕಾರ" (Home marks it with data-robot-anchor). */
function findDatelineLine() {
  const rule = document.querySelector('[data-robot-anchor="dateline"]');
  if (!rule) return null;
  const r = rule.getBoundingClientRect();
  return { left: r.left, right: r.right, y: r.top };  // .rule = border-TOP, so the line starts at r.top
}

/** His size + his box size, chosen once from the screen width at load. */
function measureBox() {
  const robotPx = window.innerWidth >= DESKTOP_MIN_WIDTH ? ROBOT_PX_DESKTOP : ROBOT_PX_PHONE;
  const pxPerUnit = robotPx / MODEL_HEIGHT;
  return {
    robotPx,
    pxPerUnit,
    boxW: Math.round(WORLD_W * pxPerUnit),
    boxH: Math.round(WORLD_H * pxPerUnit),
  };
}

const RobotWalker = () => {
  const canvasRef = useRef(null);
  // Measured once (a rotate/resize later keeps this size; positions still track live).
  const [box] = useState(measureBox);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const { robotPx, pxPerUnit, boxW, boxH } = box;
    console.log(`[Robot] Starting: ${robotPx}px tall robot in a ${boxW}×${boxH}px box`);

    // ── three.js basics: renderer (draws), scene (holds things), camera (views) ──
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch (err) {
      console.warn('[Robot] WebGL could not start — robot hidden:', err);
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); // sharp on retina, capped for battery
    renderer.setSize(boxW, boxH, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3)); // soft sky/ground light
    const sun = new THREE.DirectionalLight(0xffffff, 3);         // one key light for shape
    sun.position.set(3, 10, 8);
    scene.add(sun);

    // Orthographic = no perspective shrink, so "1 model unit = pxPerUnit pixels" everywhere.
    const camera = new THREE.OrthographicCamera(
      -WORLD_W / 2, WORLD_W / 2, WORLD_H / 2, -WORLD_H / 2, 0.1, 100
    );
    const target = new THREE.Vector3(0, LOOK_Y, 0);
    camera.position.set(
      Math.sin(CAM_AZIMUTH) * Math.cos(CAM_ELEVATION) * 20,
      LOOK_Y + Math.sin(CAM_ELEVATION) * 20,
      Math.cos(CAM_AZIMUTH) * Math.cos(CAM_ELEVATION) * 20
    );
    camera.lookAt(target);
    camera.updateMatrixWorld();

    // The "contact point" (his feet, or his seat when sitting) is always kept
    // at the world origin. Find which pixel of the box that origin lands on —
    // we then slide the box so this pixel sits exactly on the black line.
    const originNdc = new THREE.Vector3(0, 0, 0).project(camera);
    const contactPx = { x: ((originNdc.x + 1) / 2) * boxW, y: ((1 - originNdc.y) / 2) * boxH };

    // ── State shared by the loader and the per-frame loop ──
    let model = null;          // the robot (a THREE.Group)
    let mixer = null;          // plays animation clips on the model
    let headBone = null;       // scaled up every frame (bobblehead)
    const actions = {};        // clip name → AnimationAction
    let current = null;        // the action playing now
    let phase = 'loading';     // loading → sit → stand → jump → walk → idle
    let phaseStart = 0;        // seconds (clock time) when this phase began
    let walkProgress = 0;      // 0 = landing spot, 1 = right end (a fraction survives resizes)
    let jumpFrom = null;       // where the hop started (header spot, captured at take-off)
    let landOffset = 0;        // landing spot, px from the line's left end (survives resizes)
    let rafId = 0;
    let disposed = false;
    const clock = new THREE.Clock();

    /** Switch to another clip. once=true plays it one time and holds the last pose. */
    function play(name, { once = false, timeScale = 1, fade = FADE_SEC } = {}) {
      const next = actions[name];
      if (!next || next === current) return;
      next.reset();
      next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity);
      next.clampWhenFinished = once;
      next.timeScale = timeScale;
      next.play();
      if (current && fade > 0) current.crossFadeTo(next, fade, false);
      else if (current) current.stop();
      current = next;
    }

    function setPhase(name, now) {
      phase = name;
      phaseStart = now;
      console.log(`[Robot] Phase → ${name}`);
    }

    /** Where does he land, and where does he stop? (live, so resizes are fine) */
    function walkEnds(rule) {
      const inset = robotPx * 0.45;              // keep his body on the line, not hanging off the end
      return { startX: rule.left + inset, endX: rule.right - inset };
    }

    // ── The per-frame loop: advance the script, place the box, draw ──
    function frame() {
      if (disposed) return;
      rafId = requestAnimationFrame(frame);
      const dt = Math.min(clock.getDelta(), 0.1);  // cap: a background tab returning shouldn't teleport him
      const now = clock.elapsedTime;
      if (!model) return;

      // The header spot only matters until he leaves it (sit/stand/jump).
      // Skipping it afterwards saves a getComputedStyle + layout read on every
      // frame for as long as he idles (review finding, Session 53).
      const onHeader = phase === 'sit' || phase === 'stand' || phase === 'jump';
      const seat = onHeader ? findHeaderSpot(robotPx) : null;
      const rule = findDatelineLine();             // still needed: the line scrolls
      if ((onHeader && !seat) || !rule) return;    // page not ready (or navigated away)
      const { startX, endX } = walkEnds(rule);
      const t = now - phaseStart;

      // walk/idle overwrite these with the line position below.
      let x = seat ? seat.x : 0;
      let y = seat ? seat.y : 0;
      let yOffset = 0;                             // model lift/drop inside the box (model units)

      if (phase === 'sit') {
        yOffset = -SEAT_Y;                         // seat on the line → feet dangle below it
        if (t * 1000 >= SIT_HOLD_MS) {
          // Longer blend: the stand-up starts from a crouch (hips 0.40 m) while
          // the floor-sit is lower (0.10 m) — 0.6 s lets him shift into it.
          play('Standing', { once: true, timeScale: STAND_TIME_SCALE, fade: 0.6 });
          setPhase('stand', now);
        }
      } else if (phase === 'stand') {
        const dur = actions.Standing.getClip().duration / STAND_TIME_SCALE;
        yOffset = -SEAT_Y * (1 - easeInOut(clamp01(t / dur)));   // rise from seat to feet
        if (t >= dur) {
          jumpFrom = { ...seat };
          // Land a short hop FORWARD (right) of where he stood — never behind
          // him — clamped onto the line. (On narrow laptops he sits right of
          // the nav links, so "the line's left end" would be a leap backwards.)
          const landX = Math.min(endX, Math.max(startX, seat.x + JUMP_HOP * robotPx));
          landOffset = landX - rule.left;
          play('Jump', { once: true, timeScale: JUMP_TIME_SCALE, fade: 0.1 });
          setPhase('jump', now);
        }
      } else if (phase === 'jump') {
        const dur = actions.Jump.getClip().duration / JUMP_TIME_SCALE;
        // The clip winds up first and recovers after landing; the box only
        // travels while his feet are off the ground (JUMP_TAKEOFF→JUMP_LANDING,
        // measured by the pack script) so he neither skates on take-off nor
        // "lands" in mid-air. Linear k = a ballistic hop.
        const k = clamp01((t / dur - JUMP_TAKEOFF) / (JUMP_LANDING - JUMP_TAKEOFF));
        const from = jumpFrom || seat;
        const landX = rule.left + landOffset;
        x = from.x + (landX - from.x) * k;
        // Turn to face right during the wind-up, so he leaps the way he faces
        // (facing the reader while flying sideways looked like gliding).
        model.rotation.y = (Math.PI / 2) * easeInOut(clamp01(t / TURN_SEC));
        y = from.y + (rule.y - from.y) * k - JUMP_ARC * robotPx * Math.sin(Math.PI * k);
        if (t >= dur) {
          // Landed: he's now part of the PAGE, so drop below the fixed header
          // (z-50) — when the reader scrolls he slides under it like the text
          // does, instead of floating over the menu.
          canvas.style.zIndex = '40';
          play('Walking', { timeScale: WALK_TIME_SCALE });
          setPhase('walk', now);
        }
      } else if (phase === 'walk') {
        const pxPerSec = WALK_UNITS_PER_SEC * WALK_TIME_SCALE * pxPerUnit;
        const walkFrom = rule.left + landOffset;   // he starts where he landed
        const distance = Math.max(1, endX - walkFrom);
        walkProgress = Math.min(1, walkProgress + (pxPerSec * dt) / distance);
        x = walkFrom + (endX - walkFrom) * walkProgress;
        y = rule.y;
        model.rotation.y = Math.PI / 2;            // already facing right since the jump
        if (walkProgress >= 1) {
          play('Idle');
          setPhase('idle', now);
        }
      } else if (phase === 'idle') {
        x = endX;
        y = rule.y;
        model.rotation.y = (Math.PI / 2) * (1 - easeInOut(clamp01(t / TURN_SEC))); // turn back to you
      }

      model.position.y = yOffset;
      mixer.update(dt);
      // Bobblehead AFTER the mixer (the clips also key the head's scale to 1).
      // Hair and specs ride on the Head bone, so they grow with it.
      if (headBone) headBone.scale.setScalar(HEAD_SCALE);

      // Slide the box so the contact pixel sits on (x, y).
      const left = Math.round(x - contactPx.x);
      const top = Math.round(y - contactPx.y);
      canvas.style.transform = `translate3d(${left}px, ${top}px, 0)`;

      // Off-screen (e.g. scrolled far down)? Skip the drawing to save battery.
      const onScreen = top < window.innerHeight && top + boxH > 0;
      if (onScreen) renderer.render(scene, camera);
    }

    // ── Load the model, then start the script ──
    new GLTFLoader().load(
      MODEL_URL,
      (gltf) => {
        if (disposed) return;
        model = gltf.scene;
        scene.add(model);
        headBone = model.getObjectByName('Head');
        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => { actions[clip.name] = mixer.clipAction(clip); });
        console.log(`[Robot] Model loaded (${gltf.animations.length} clips)`);

        // He starts already seated: the floor-sit is a gentle looping idle.
        play('Sitting', { fade: 0 });
        clock.getDelta();                          // reset the frame timer
        setPhase('sit', clock.elapsedTime);
        canvas.style.opacity = '1';                // fade in (CSS transition)
      },
      undefined,
      (err) => console.warn('[Robot] Model failed to load — robot hidden:', err)
    );
    rafId = requestAnimationFrame(frame);

    // ── Clean up when leaving Home: stop the loop, free GPU memory ──
    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      if (mixer) mixer.stopAllAction();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          [].concat(obj.material).forEach((m) => {
            // Textures aren't freed by material.dispose(). The robot has none,
            // but the future 3D-Srinidhi model (skin/face photos) will.
            Object.values(m).forEach((v) => { if (v && v.isTexture) v.dispose(); });
            m.dispose();
          });
        }
      });
      renderer.dispose();
      console.log('[Robot] Cleaned up');
    };
  }, [box]);

  // PORTAL to <body>: Home's page wrapper slides in with a CSS transform, and
  // a transformed ancestor makes position:fixed measure from THAT box instead
  // of the screen — he flashed ~140 px lower (above ನಮಸ್ಕಾರ) until the slide
  // ended (Srinidhi spotted it, Session 53). Living directly under <body>,
  // no page animation can shift him.
  return createPortal(
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      // fixed + top/left 0: we position it purely with transform (cheap to animate).
      // z-[60] = above the header (z-50) so he can sit ON its border
      // (lowered to 40 once he lands on the page line — see the jump phase).
      className="fixed top-0 left-0 z-[60] pointer-events-none"
      style={{
        opacity: 0,
        transition: 'opacity 400ms ease',
        width: `${box.boxW}px`,
        height: `${box.boxH}px`,
      }}
    />,
    document.body
  );
};

export default RobotWalker;
