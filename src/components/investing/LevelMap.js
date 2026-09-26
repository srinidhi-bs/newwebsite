/**
 * LevelMap — Srinidhi's notebook sketch, redrawn as the game's world map (E3)
 * ===========================================================================
 * The original is a hand-drawn page from Srinidhi's notes:
 *
 *        🧍 Me
 *         ┊
 *        Earn
 *        (pie)  ──  Spend (hatched) / Save ──▶ Why? ──▶ Where?
 *                                                        - Cash
 *                                                        - Savings a/c
 *        ╭──────── red curve ────────────────────────── (Equity) circled red
 *        ▼
 *     ③ What is a share?  ④ What moves prices?  ⑤ Mutual funds
 *     ⑥ The ride          ⑦ How much?
 *
 * Each sitting OWNS a part of the drawing. That part is one big tappable
 * button; its ink shows its state:
 *   current → full colour + glowing badge + "PLAY ▸"   (tap = play)
 *   done    → full colour + ✓ badge                    (tap = replay)
 *   locked  → grey pencil + 🔒                          (tap = "skip ahead?")
 *   soon    → grey pencil, "SOON" (no content written yet)
 * Ink colours copy the notes: teal for why/where/how-much, RED for the
 * equity branch (sittings 3-6).
 *
 * Everything is ONE <svg> with a fixed coordinate system (viewBox 400×1110),
 * so the drawing scales down to any phone width without re-layout.
 * The drawing's WORDS come from content/investing/<lang>/sittings.js.
 *
 * @param {Array}    props.sittings  - ordered sittings (content file)
 * @param {Object}   props.words     - mapWords (content file)
 * @param {Object}   props.progress  - shared progress (useStoryProgress)
 * @param {Object}   props.ui        - button/frame words
 * @param {Function} props.onOpen    - (index) play an unlocked/done sitting
 * @param {Function} props.onLocked  - (index) reader tapped a locked/soon one
 * @param {number}   [props.celebrateIndex] - index whose badge should "pop"
 *                                            (just unlocked) — or null
 * ===========================================================================
 */
import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import '@fontsource/caveat/600.css'; // handwriting font — loaded only with this page
import { getSittingProgress, isSittingUnlocked, isSittingPlayable } from './storyProgress';

// ── Inks (currentColor is set per part via these text-* classes) ───────────
const TEAL = 'text-[#0E7490] dark:text-[#22D3EE]';
const RED = 'text-[#DC2626] dark:text-[#F87171]';
const PENCIL = 'text-[#78716C] dark:text-[#71717A]';
// The notebook paper itself
const PAPER_FILL = 'fill-[#FFFDF7] dark:fill-[#0B1220]';
const RULE_STROKE = 'stroke-[#DCE7F5] dark:stroke-[#1E293B]';

const HAND = { fontFamily: "'Caveat', cursive", fontWeight: 600 };
const MONO = { fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, letterSpacing: '0.12em' };

// Which ink a sitting uses when it's alive (index 0-based): 2..5 = red branch.
const inkFor = (index) => (index >= 2 && index <= 5 ? RED : TEAL);

// Layout for the equity-branch trail (sittings 3-7): badge centres on the left.
const TRAIL_X = 58;
const TRAIL_Y = [740, 820, 900, 980, 1060];

// ── Small drawing pieces ───────────────────────────────────────────────────

// Circled number, like the reader would circle it in a notebook.
const Badge = ({ cx, cy, number, state, pulse }) => (
  <g>
    {pulse && (
      pulse === 'static'
        ? <circle cx={cx} cy={cy} r={25} fill="currentColor" opacity={0.18} />
        : (
          <motion.circle
            cx={cx} cy={cy} fill="currentColor"
            initial={{ r: 19, opacity: 0.45 }}
            animate={{ r: 32, opacity: 0 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
          />
        )
    )}
    <circle cx={cx} cy={cy} r={18} className={PAPER_FILL} stroke="currentColor" strokeWidth={2.5} />
    {/* second, slightly-off circle = the "drawn twice by hand" look */}
    <circle cx={cx + 1.5} cy={cy - 1} r={19.5} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.45} />
    <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="central" fill="currentColor" style={{ ...HAND, fontSize: 24 }}>
      {state === 'done' ? '✓' : number}
    </text>
  </g>
);

// Tiny status tag: "PLAY ▸" (filled), "DONE ✓", "🔒 LOCKED", "SOON".
const Pill = ({ x, y, anchor = 'start', state, ui }) => {
  const label = { current: ui.play, done: ui.done, locked: `🔒 ${ui.locked}`, soon: ui.soon }[state];
  const width = label.length * 8 + 18; // rough text width for the background
  const left = anchor === 'middle' ? x - width / 2 : x;
  return (
    <g>
      {state === 'current' && <rect x={left} y={y - 13} width={width} height={20} rx={10} fill="currentColor" />}
      <text
        x={anchor === 'middle' ? x : x + 9}
        y={y + 2}
        textAnchor={anchor}
        className={state === 'current' ? 'fill-[#FFFDF7] dark:fill-[#0B1220]' : ''}
        fill={state === 'current' ? undefined : 'currentColor'}
        style={{ ...MONO, fontSize: 11 }}
      >
        {label}
      </text>
    </g>
  );
};

// Radiating strokes around a badge — the "level unlocked!" burst.
const Sparkle = ({ cx, cy }) => (
  <g>
    {Array.from({ length: 8 }).map((_, i) => {
      const a = (i * Math.PI) / 4;
      return (
        <motion.line
          key={i}
          x1={cx + Math.cos(a) * 26} y1={cy + Math.sin(a) * 26}
          x2={cx + Math.cos(a) * 36} y2={cy + Math.sin(a) * 36}
          stroke="currentColor" strokeWidth={3} strokeLinecap="round"
          initial={{ opacity: 0, pathLength: 0 }}
          animate={{ opacity: [0, 1, 0], pathLength: 1 }}
          transition={{ duration: 1.4, delay: 0.3, repeat: 2 }}
        />
      );
    })}
  </g>
);

/**
 * One sitting's part of the drawing = one accessible button.
 * `box` is its tappable area (also where the keyboard-focus outline goes).
 */
const Part = ({ index, box, state, ink, label, onActivate, pop, children }) => {
  const [focused, setFocused] = useState(false);
  const alive = state === 'current' || state === 'done';
  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); // stop Space from scrolling the page
      onActivate();
    }
  };
  return (
    <motion.g
      role="button"
      tabIndex={0}
      aria-label={label}
      data-testid={`map-sitting-${index + 1}`}
      data-state={state}
      onClick={onActivate}
      onKeyDown={handleKey}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={`cursor-pointer outline-none ${alive ? ink : PENCIL}`}
      // Just-unlocked part grows in with a springy "pop"
      initial={pop ? { scale: 0.8, opacity: 0.3 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.25 }}
      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
    >
      {/* Invisible hit area — makes the whole part tappable, not just ink */}
      <rect x={box.x} y={box.y} width={box.w} height={box.h} fill="transparent" />
      {focused && (
        <rect
          x={box.x} y={box.y} width={box.w} height={box.h} rx={14}
          fill="none" stroke="currentColor" strokeWidth={2} strokeDasharray="6 5"
        />
      )}
      {children}
    </motion.g>
  );
};

// ── The map ────────────────────────────────────────────────────────────────
const LevelMap = ({ sittings, words, progress, ui, onOpen, onLocked, celebrateIndex = null }) => {
  const reduceMotion = useReducedMotion();

  // current / done / locked / soon for each sitting
  const stateOf = (i) => {
    const s = sittings[i];
    if (!isSittingPlayable(s)) return 'soon';
    if (getSittingProgress(progress, s.id).completed) return 'done';
    return isSittingUnlocked(progress, sittings, i) ? 'current' : 'locked';
  };

  const stateWords = { current: ui.play, done: ui.done, locked: ui.locked, soon: ui.soon };
  const labelOf = (i) => `${ui.sittingLabel} ${sittings[i].number}: ${sittings[i].title} — ${stateWords[stateOf(i)]}`;

  const activate = (i) => {
    const st = stateOf(i);
    console.log(`[InvestingStory] Map: tapped sitting ${i + 1} (${st})`);
    if (st === 'current' || st === 'done') onOpen(i);
    else onLocked(i);
  };

  // Common props for every Part
  const partProps = (i, box) => ({
    index: i,
    box,
    state: stateOf(i),
    ink: inkFor(i),
    label: labelOf(i),
    onActivate: () => activate(i),
    pop: celebrateIndex === i,
  });
  const pulseOf = (i) => (stateOf(i) === 'current' ? (reduceMotion ? 'static' : 'live') : null);
  const sparkleAt = (i, cx, cy) => (celebrateIndex === i && !reduceMotion ? <Sparkle cx={cx} cy={cy} /> : null);

  const ruledLines = [];
  for (let y = 40; y < 1110; y += 36) ruledLines.push(y);

  return (
    <svg
      viewBox="0 0 400 1110"
      className="w-full h-auto block"
      role="group"
      aria-label="Level map"
    >
      {/* Notebook paper: background + faint ruled lines */}
      <rect x={0} y={0} width={400} height={1110} className={PAPER_FILL} />
      {ruledLines.map((y) => (
        <line key={y} x1={0} x2={400} y1={y} y2={y} className={RULE_STROKE} strokeWidth={1} />
      ))}

      {/* ─── Sitting 1: Me → Earn → pie (Spend / Save) → Why? ─────────── */}
      <Part {...partProps(0, { x: 12, y: 18, w: 376, h: 378 })}>
        {/* Me: little figure (head, t-shirt, shorts) */}
        <circle cx={150} cy={50} r={16} fill="none" stroke="currentColor" strokeWidth={2.5} />
        <path d="M132 72 Q150 66 168 72 L176 96 L166 98 L164 118 L136 118 L134 98 L124 96 Z"
          fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinejoin="round" />
        <path d="M136 118 L164 118 L166 138 L153 138 L150 127 L147 138 L134 138 Z"
          fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinejoin="round" />
        <text x={196} y={66} fill="currentColor" style={{ ...HAND, fontSize: 30 }}>{words.me}</text>

        {/* dashed arrow down to Earn */}
        <line x1={150} y1={148} x2={150} y2={184} stroke="currentColor" strokeWidth={2.5} strokeDasharray="6 6" />
        <path d="M142 176 L150 188 L158 176" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
        <text x={150} y={216} textAnchor="middle" fill="currentColor" style={{ ...HAND, fontSize: 30 }}>{words.earn}</text>

        {/* The pie: the big hatched part is Spend, the clean wedge is Save */}
        <defs>
          <clipPath id="ifz-spend-slice">
            <path d="M150 290 L150 232 A58 58 0 1 0 200.2 319 Z" />
          </clipPath>
        </defs>
        <g clipPath="url(#ifz-spend-slice)">
          {[70, 86, 102, 118, 134, 150, 166, 182, 198].map((x) => (
            <line key={x} x1={x} y1={352} x2={x + 62} y2={228} stroke="currentColor" strokeWidth={1.6} opacity={0.75} />
          ))}
        </g>
        <circle cx={150} cy={290} r={58} fill="none" stroke="currentColor" strokeWidth={2.5} />
        <path d="M150 290 L150 232 M150 290 L200.2 319" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />

        <text x={70} y={384} textAnchor="middle" fill="currentColor" style={{ ...HAND, fontSize: 28 }}>{words.spend}</text>
        <path d="M38 392 Q70 396 104 390" fill="none" stroke="currentColor" strokeWidth={2} />

        {/* Save → Why? */}
        <text x={285} y={248} textAnchor="middle" fill="currentColor" style={{ ...HAND, fontSize: 30 }}>{words.save}</text>
        <path d="M252 256 Q285 261 320 254" fill="none" stroke="currentColor" strokeWidth={2} />
        <line x1={285} y1={270} x2={285} y2={312} stroke="currentColor" strokeWidth={2.5} />
        <path d="M277 304 L285 316 L293 304" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
        <text x={285} y={346} textAnchor="middle" fill="currentColor" style={{ ...HAND, fontSize: 32 }}>{words.why}</text>
        <path d="M255 354 Q285 359 316 352" fill="none" stroke="currentColor" strokeWidth={2} />

        <Badge cx={350} cy={338} number={1} state={stateOf(0)} pulse={pulseOf(0)} />
        {sparkleAt(0, 350, 338)}
        <Pill x={285} y={380} anchor="middle" state={stateOf(0)} ui={ui} />
      </Part>

      {/* ─── Sitting 2: Where? + the list of places money can live ─────── */}
      <Part {...partProps(1, { x: 196, y: 400, w: 192, h: 262 })}>
        <line x1={285} y1={396} x2={285} y2={424} stroke="currentColor" strokeWidth={2.5} />
        <path d="M277 416 L285 428 L293 416" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
        <text x={285} y={460} textAnchor="middle" fill="currentColor" style={{ ...HAND, fontSize: 32 }}>{words.where}</text>
        <path d="M250 468 Q285 473 320 466" fill="none" stroke="currentColor" strokeWidth={2} />
        {words.whereList.map((item, k) => (
          <text key={item} x={228} y={500 + k * 30} fill="currentColor" style={{ ...HAND, fontSize: 24 }}>
            - {item}
          </text>
        ))}
        <Badge cx={352} cy={452} number={2} state={stateOf(1)} pulse={pulseOf(1)} />
        {sparkleAt(1, 352, 452)}
        <Pill x={290} y={652} anchor="middle" state={stateOf(1)} ui={ui} />
      </Part>

      {/* ─── The red curve: Equity (circled) sweeps down to its branch ─── */}
      {/* Pure decoration (not a button) — red always, as in the notes. */}
      <g className={RED} opacity={0.85}>
        <ellipse cx={262} cy={500 + words.equityIndex * 30 - 7} rx={42} ry={17}
          fill="none" stroke="currentColor" strokeWidth={2.5} transform={`rotate(-4 262 ${500 + words.equityIndex * 30 - 7})`} />
        <path d={`M221 ${500 + words.equityIndex * 30 - 4} C 120 600, 30 640, ${TRAIL_X} 706`}
          fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
        <path d={`M${TRAIL_X - 8} 698 L${TRAIL_X} 710 L${TRAIL_X + 8} 698`}
          fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
        {/* dashed trail joining the branch's badges */}
        <line x1={TRAIL_X} y1={722} x2={TRAIL_X} y2={TRAIL_Y[4]} stroke="currentColor"
          strokeWidth={2} strokeDasharray="5 7" opacity={0.6} />
      </g>

      {/* ─── Sittings 3-7: the equity branch + How much? ──────────────── */}
      {TRAIL_Y.map((by, k) => {
        const i = k + 2; // sittings 3..7 are indexes 2..6
        const s = sittings[i];
        if (!s) return null;
        return (
          <Part key={s.id} {...partProps(i, { x: 16, y: by - 38, w: 372, h: 76 })}>
            <Badge cx={TRAIL_X} cy={by} number={s.number} state={stateOf(i)} pulse={pulseOf(i)} />
            {sparkleAt(i, TRAIL_X, by)}
            <Pill x={88} y={by - 18} state={stateOf(i)} ui={ui} />
            <text x={92} y={by + 10} fill="currentColor" style={{ ...HAND, fontSize: 28 }}>{s.mapLabel}</text>
            <text x={92} y={by + 32} fill="currentColor" opacity={0.85} style={{ ...HAND, fontSize: 20 }}>{s.mapSub}</text>
          </Part>
        );
      })}
    </svg>
  );
};

export default LevelMap;
