/**
 * Home Page — "SRINIDHI VOLUME 01" (Phase 14, RD-4)
 * ===========================================================================
 * The Home page reads top-to-bottom like the cover-and-contents of a
 * self-published personal annual — a zine in the Playground (☀ light), a
 * precision instrument panel in the Laboratory (🌙 dark). Same content, two
 * personalities, switched by the theme toggle.
 *
 * This direction came out of a design panel (Session 46): four divergent
 * concepts were generated, judged on wow-factor / feasibility / anti-slop,
 * and synthesised into this one. The winning skeleton is an EDITORIAL
 * CONTENTS-INDEX (not a generic card grid), with three grafted ideas:
 *
 *   1. MASTHEAD LETTER REVEAL (the signature) — one Framer mechanism read two
 *      ways: in the Playground the headline prints like a risograph with the
 *      colour channels slightly mis-registered, then snapping into alignment;
 *      in the Laboratory the same letters calmly focus like a sensor
 *      calibrating. (Section: MastheadLine.)
 *   2. TWO-VOICES IDENTITY CARD — the same facts about Srinidhi re-voiced when
 *      you flip the theme: a warm human sheet ☀ vs a cold spec readout 🌙. The
 *      toggle literally re-introduces the person. (Section: IdentitySheet.)
 *   3. LIVE BENGALURU CLOCK — an honest "this is alive" beat, one 1 Hz timer.
 *
 * Everything animates through usePersonalityMotion() so the Playground gets
 * springy physics, the Laboratory gets calm tweens, and reduced-motion users
 * get instant, motionless content parity.
 *
 * Hard rules honoured here:
 *   • Framer Motion only — no new animation deps.
 *   • Any tilt/x on an animated element lives in a Framer VARIANT, never CSS
 *     transform (Framer writes inline transform that would clobber CSS).
 *   • Mobile-first: the colossal display type uses clamp() + overflow guards
 *     so nothing overflows at 360px.
 *   • The live clock clears its interval on unmount.
 * ===========================================================================
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../layout/PageWrapper';
import SEO from '../common/SEO';
import { useTheme } from '../../context/ThemeContext';
import { usePersonalityMotion } from '../../styles/motion';

// ─── The four sections, as a printed "contents index" ────────────────────────
// Each becomes one full-width ruled row (01–04). Copy is real and personal —
// the cooking standfirst keeps the true drumstick-leaves-on-a-pizza story.
// `accent` maps to the section's personality-aware accent token.
const SECTIONS = [
  {
    n: '01',
    title: 'Finance & Planning',
    kicker: 'FINANCE',
    standfirst: 'Income tax, capital gains, EMI & SIP — calculators I built to answer my own questions.',
    accent: 'text-accent-finance',
    path: '/finance',
  },
  {
    n: '02',
    title: 'Trading & Markets',
    kicker: 'TRADING',
    standfirst: 'Notes from watching the Indian markets every morning — strategy, analysis, conviction.',
    accent: 'text-accent-trading',
    path: '/trading',
  },
  {
    n: '03',
    title: 'PDF Tools',
    kicker: 'TOOLS',
    standfirst: 'Merge, split, lock, OCR and more — fast, free, and entirely in your browser.',
    accent: 'text-accent-tools',
    path: '/tools',
  },
  {
    n: '04',
    title: 'Cooking Adventures',
    kicker: 'COOKING',
    standfirst: 'Recipes I cook from scratch — like the day drumstick leaves ended up on a pizza, and it worked.',
    accent: 'text-accent-cooking',
    path: '/cooking',
  },
];

// ─── Quick-tools chips for the "back-cover ad bar" ───────────────────────────
// Routes verified against AnimatedRoutes.js — real slugs, no dead links.
const QUICK_TOOLS = [
  { label: 'Merge PDF', path: '/tools/pdf-merger' },
  { label: 'Split PDF', path: '/tools/pdf-splitter' },
  { label: 'Lock PDF', path: '/tools/pdf-lock' },
  { label: 'PDF OCR', path: '/tools/pdf-ocr' },
];

// ─── The two voices of the identity card ─────────────────────────────────────
// SAME five facts, re-voiced. Playground = warm and human; Laboratory = a cold
// spec sheet. (Tasteful + true on purpose — the design panel flagged "cheeky"
// copy like "counts beans" as trying-too-hard.)
const HUMAN_ROWS = [
  { label: 'By profession', value: 'An accountant' },
  { label: 'By passion', value: 'I write code' },
  { label: 'Most mornings', value: 'Watching the markets' },
  { label: 'In the kitchen', value: 'Cooking from scratch' },
  { label: 'Home', value: 'Bengaluru · ನಮ್ಮ ಊರು' },
];
const SPEC_ROWS = [
  { label: 'PROFESSION', value: 'ACCOUNTANT' },
  { label: 'CODES', value: 'REACT · BY PASSION' },
  { label: 'TRADES', value: 'INDIAN MARKETS' },
  { label: 'COOKS', value: 'FROM SCRATCH' },
  { label: 'BASE', value: 'BENGALURU · IST' },
];

/**
 * useBengaluruClock — a live HH:MM:SS string in IST, ticking once a second.
 *
 * Returns the current Asia/Kolkata time as a 24-hour string. The interval is
 * created on mount and CLEARED on unmount (no leak). Used as the Laboratory's
 * "instrument is live" readout (and a quiet caption in the Playground).
 */
function useBengaluruClock() {
  // Compute the IST time string once for the initial render…
  const read = () =>
    new Date().toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour12: false,
    });

  const [time, setTime] = useState(read);

  useEffect(() => {
    // …then update it every second.
    const id = setInterval(() => setTime(read()), 1000);
    return () => clearInterval(id); // cleanup on unmount — no dangling timer
  }, []);

  return time;
}

/**
 * MastheadLine — one big headline line with the signature "print registration"
 * reveal.
 *
 * The real text is split into letters that stagger in. Behind it sit TWO ghost
 * copies of the whole line, tinted with accent tokens (teal+blue ☀, which
 * become cyan+sky 🌙 for free because the accent tokens flip), offset slightly
 * and fading to nothing — a CMYK misprint correcting itself / channels coming
 * into focus. Ghosts are skipped entirely under reduced motion.
 *
 * @param {string} text         - the line's text (e.g. "ACCOUNTANT")
 * @param {string} fontSize     - CSS font-size (e.g. a clamp() expression)
 * @param {string} colorClass   - colour of the real text (e.g. text-ink)
 * @param {string} ghostA       - accent class for ghost layer A
 * @param {string} ghostB       - accent class for ghost layer B
 * @param {string} extraClass   - optional layout classes (e.g. line-height)
 */
const MastheadLine = ({ text, fontSize, colorClass, ghostA, ghostB, extraClass = '' }) => {
  const { transition, reduced } = usePersonalityMotion();

  // Parent container staggers its letters in. Stagger is disabled under
  // reduced motion so everything simply appears at once.
  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: reduced ? 0 : 0.03, delayChildren: 0.04 },
    },
  };
  // Each letter rises a fraction of its own height and fades in.
  const letter = {
    hidden: { opacity: 0, y: '0.45em' },
    visible: { opacity: 1, y: 0 },
  };

  return (
    // display-skin = the masthead voice (Archivo Black UPPERCASE ☀ / Space
    // Grotesk 🌙); children inherit the font + transform. fontSize is the
    // clamp() per line so the ghosts (which inherit it) stay registered.
    <span
      className={`relative inline-block display-skin ${extraClass}`}
      style={{ fontSize }}
    >
      {/* Ghost channels — purely decorative, hidden from screen readers, and
          omitted under reduced motion. inset-0 overlays them on the real text;
          same text + same font/size = perfect registration. */}
      {!reduced && (
        <>
          <motion.span
            aria-hidden="true"
            className={`absolute inset-0 ${ghostA} pointer-events-none select-none`}
            initial={{ x: -5, y: -3, opacity: 0.5 }}
            animate={{ x: 0, y: 0, opacity: 0 }}
            transition={{ ...transition, delay: 0.12 }}
          >
            {text}
          </motion.span>
          <motion.span
            aria-hidden="true"
            className={`absolute inset-0 ${ghostB} pointer-events-none select-none`}
            initial={{ x: 5, y: 3, opacity: 0.5 }}
            animate={{ x: 0, y: 0, opacity: 0 }}
            transition={{ ...transition, delay: 0.12 }}
          >
            {text}
          </motion.span>
        </>
      )}

      {/* The real text: per-letter stagger. Non-breaking spaces preserve word
          gaps (the split would otherwise collapse them). */}
      <motion.span
        className={`relative ${colorClass}`}
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {text.split('').map((ch, i) => (
          <motion.span
            key={i}
            className="inline-block"
            variants={letter}
            transition={transition}
          >
            {ch === ' ' ? ' ' : ch}
          </motion.span>
        ))}
      </motion.span>
    </span>
  );
};

// ─── The typewriter's rotating words (the masthead's third line) ─────────────
// Each word wears its own section's accent token, so the headline quietly
// points at the site's sections (and the Laboratory re-tints them for free,
// because the accent tokens flip with the theme).
const TYPED_WORDS = [
  { text: 'CODES', colorClass: 'text-accent-cta' },
  { text: 'COOKS', colorClass: 'text-accent-cooking' },
  { text: 'TRADES', colorClass: 'text-accent-trading' },
];

// Rhythm ("calm", chosen Session 49). All values in milliseconds.
//   Example cycle for CODES: 5 letters × 120 = 0.6s typing → 2s hold →
//   5 × 60 = 0.3s deleting → 0.4s gap → COOKS starts. Three words ≈ 10s.
const TYPE_MS = 120;     // per letter, typing
const DELETE_MS = 60;    // per letter, backspacing (faster, like a real person)
const HOLD_MS = 2000;    // finished word stays on screen
const GAP_MS = 400;      // empty line before the next word starts
const START_DELAY_MS = 600; // let ACCOUNTANT + WHO finish their reveal first

/**
 * TypewriterLine — the masthead's third line. Types a word letter by letter,
 * holds it with a blinking cursor, backspaces it, then moves to the next word
 * (CODES → COOKS → TRADES → CODES …) forever.
 *
 * How it works — a tiny state machine driven by ONE setTimeout at a time:
 *   phase 'typing'   → show one more letter every TYPE_MS until the word is full
 *   phase 'holding'  → wait HOLD_MS (cursor blinks), then start deleting
 *   phase 'deleting' → remove one letter every DELETE_MS until empty,
 *                      then wait GAP_MS and move to the next word
 * Every state change re-runs the effect, which schedules exactly one timer and
 * clears it on cleanup — so unmounting (leaving Home) never leaves a timer
 * running.
 *
 * Reduced motion: no loop, no cursor — just a still "CODES", like before.
 * Layout: the cursor is ALWAYS rendered, so the line keeps its height even
 * when the word is momentarily empty (no page jump mid-backspace).
 *
 * @param {string} fontSize   - CSS font-size (same clamp() as ACCOUNTANT)
 * @param {string} extraClass - optional layout classes (e.g. line-height)
 */
const TypewriterLine = ({ fontSize, extraClass = '' }) => {
  const { reduced } = usePersonalityMotion();

  const [wordIndex, setWordIndex] = useState(0); // which word (0 = CODES)
  const [count, setCount] = useState(0);         // how many letters are showing
  const [phase, setPhase] = useState('typing');  // 'typing' | 'holding' | 'deleting'

  useEffect(() => {
    if (reduced) return undefined; // still headline — no timers at all

    const word = TYPED_WORDS[wordIndex].text;
    let delay;
    let step;

    if (phase === 'typing') {
      if (count < word.length) {
        // The very first letter of the very first word waits for the other
        // two masthead lines to finish revealing.
        delay = wordIndex === 0 && count === 0 ? START_DELAY_MS : TYPE_MS;
        step = () => setCount((c) => c + 1);
      } else {
        delay = 0;
        step = () => setPhase('holding');
      }
    } else if (phase === 'holding') {
      delay = HOLD_MS;
      step = () => setPhase('deleting');
    } else if (count > 0) {
      // phase === 'deleting', letters still left
      delay = DELETE_MS;
      step = () => setCount((c) => c - 1);
    } else {
      // Fully deleted → pause briefly, then start typing the next word.
      delay = GAP_MS;
      step = () => {
        setWordIndex((i) => (i + 1) % TYPED_WORDS.length);
        setPhase('typing');
      };
    }

    const id = setTimeout(step, delay);
    return () => clearTimeout(id); // one timer at a time; cleared on unmount
  }, [reduced, wordIndex, count, phase]);

  // Reduced motion → the original still word, no cursor.
  if (reduced) {
    return (
      <span className={`inline-block display-skin text-accent-cta ${extraClass}`} style={{ fontSize }}>
        {TYPED_WORDS[0].text}
      </span>
    );
  }

  const { text, colorClass } = TYPED_WORDS[wordIndex];

  return (
    // display-skin = the same masthead voice as ACCOUNTANT/WHO. The colour
    // class sits on the wrapper so the cursor (bg-current) matches the word.
    <span
      className={`inline-block display-skin whitespace-nowrap ${colorClass} ${extraClass}`}
      style={{ fontSize }}
    >
      {text.slice(0, count)}
      {/* The cursor: a slim bar in the word's colour. Solid while typing or
          deleting (like a real editor); blinks only while the word is held.
          The blink is a hard on/off (keyframes 1,1,0,0), not a soft fade.
          Sized like an editor caret — TALLER than the capitals and dipping
          below the baseline — so in the Lab's thin font it can't be misread
          as a letter "I" (a 0.72em cap-height bar read as "COOKI").
          Layout trick: the outer span is an empty, zero-height inline-block
          that sits exactly on the baseline and reserves the caret's width;
          the caret itself is ABSOLUTE inside it, so its extra height never
          makes the line (and the whole masthead) taller. */}
      <span aria-hidden="true" className="relative inline-block w-[0.13em] h-0">
        <motion.span
          className="absolute left-[0.06em] bottom-[-0.14em] w-[0.07em] h-[0.95em] bg-current"
          animate={phase === 'holding' ? { opacity: [1, 1, 0, 0] } : { opacity: 1 }}
          transition={
            phase === 'holding'
              ? { duration: 1, times: [0, 0.5, 0.5, 1], repeat: Infinity, ease: 'linear' }
              : { duration: 0 }
          }
        />
      </span>
    </span>
  );
};

/**
 * IdentitySheet — the two-voices card. The SAME five facts about Srinidhi,
 * re-voiced when the personality flips: a warm human sheet ☀ vs a cold spec
 * readout (mono, dotted leaders) 🌙. AnimatePresence keyed on the personality
 * makes the rows "recalibrate" on every toggle — the toggle becomes the bio.
 */
const IdentitySheet = () => {
  const { isDark } = useTheme();
  const { transition, reduced } = usePersonalityMotion();
  const rows = isDark ? SPEC_ROWS : HUMAN_ROWS;

  // Rows stagger in as a group whenever the personality changes.
  const group = {
    hidden: {},
    visible: { transition: { staggerChildren: reduced ? 0 : 0.06 } },
  };
  const row = {
    hidden: { opacity: 0, y: reduced ? 0 : 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="card-skin p-6 sm:p-8">
      {/* mode="wait": the old voice leaves before the new one enters, so the
          sheet visibly re-typesets itself on toggle. */}
      <AnimatePresence mode="wait">
        <motion.dl
          key={isDark ? 'lab' : 'play'}
          variants={group}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="space-y-3"
        >
          {rows.map((r) => (
            <motion.div
              key={r.label}
              variants={row}
              transition={transition}
              className="flex items-baseline gap-3"
            >
              {/* Label: mono "spec" voice in the Lab, plain warm voice in the
                  Playground. */}
              <dt
                className={`shrink-0 text-ink-muted ${
                  isDark ? 'font-labmono text-xs tracking-wide' : 'text-sm'
                }`}
              >
                {r.label}
              </dt>
              {/* Dotted leader — only in the Lab, where the sheet reads as a
                  printed spec table. In the Playground the gap is just space. */}
              <span
                className={`flex-1 translate-y-[-3px] ${
                  isDark ? 'border-b border-dotted border-ink-muted/40' : ''
                }`}
                aria-hidden="true"
              />
              <dd
                className={`shrink-0 text-ink font-medium ${
                  isDark ? 'font-labmono text-xs tracking-wide' : 'text-sm'
                }`}
              >
                {r.value}
              </dd>
            </motion.div>
          ))}
        </motion.dl>
      </AnimatePresence>
    </div>
  );
};

/**
 * ContentsRow — one section as a ruled "table of contents" row (01–04).
 * Three zones: giant accent index number · title + standfirst + mono kicker ·
 * folio + arrow. The whole row is a button (keyboard-reachable for free).
 * Hover physics live in Framer variants: the Playground slides + tilts the row
 * like peeling a sticker; the Laboratory glides calmly (no tilt).
 */
const ContentsRow = ({ section }) => {
  const navigate = useNavigate();
  const { transition, isLab } = usePersonalityMotion();

  // Reveal on scroll-in, and hover physics — all from variants (the N2 rule:
  // never put this rotate/x on a CSS transform, Framer's inline wins).
  const variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
    hover: isLab
      ? { x: 6 } // calm glide in the lab, no tilt
      : { x: 10, rotate: -1 }, // sticker peel in the playground
  };

  return (
    <motion.button
      type="button"
      onClick={() => navigate(section.path)}
      aria-label={`${section.title} — section ${section.n}`}
      className="rule w-full text-left py-6 sm:py-8 group focus:outline-none"
      variants={variants}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      whileFocus="hover"
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={transition}
    >
      <div className="flex items-center gap-4 sm:gap-8">
        {/* Zone 1: the colossal index number, in the section accent. */}
        <span
          className={`display-skin leading-none ${section.accent}`}
          style={{ fontSize: 'clamp(2rem, 7vw, 4.5rem)' }}
        >
          {section.n}
        </span>

        {/* Zone 2: kicker + title + standfirst. */}
        <div className="min-w-0 flex-1">
          <p className={`font-labmono text-xs tracking-widest mb-1 ${section.accent}`}>
            {section.kicker} / {section.n}
          </p>
          <h3
            className="display-skin text-ink leading-tight"
            style={{ fontSize: 'clamp(1.25rem, 3.5vw, 2rem)' }}
          >
            {section.title}
          </h3>
          <p className="text-ink-muted mt-1 text-sm sm:text-base max-w-2xl">
            {section.standfirst}
          </p>
        </div>

        {/* Zone 3: folio + arrow (hidden on the smallest screens for room). */}
        <span className="hidden sm:flex items-center gap-2 shrink-0 font-labmono text-xs text-ink-muted">
          p.{section.n}
          <span
            className={`text-xl transition-transform group-hover:translate-x-1 ${section.accent}`}
            aria-hidden="true"
          >
            →
          </span>
        </span>
      </div>
    </motion.button>
  );
};

/**
 * ToolChip — a small deep-link chip in the back-cover ad bar. Uses badge-skin,
 * so it's a tilted sticker tag ☀ and a status pill 🌙 (and morphs for free).
 */
const ToolChip = ({ label, path }) => {
  const navigate = useNavigate();
  const { transition } = usePersonalityMotion();

  return (
    <motion.button
      type="button"
      onClick={() => navigate(path)}
      className="badge-skin px-4 py-2 text-sm shrink-0 whitespace-nowrap focus:outline-none"
      variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
      transition={transition}
    >
      {label}
    </motion.button>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const clock = useBengaluruClock();
  // Only `reduced` is needed here (the chip stagger); per-element transitions
  // live in the child components' own usePersonalityMotion() calls.
  const { reduced } = usePersonalityMotion();

  // Stagger container for the back-cover tool chips.
  const chipGroup = {
    hidden: {},
    visible: { transition: { staggerChildren: reduced ? 0 : 0.07 } },
  };

  return (
    <PageWrapper>
      <SEO routeKey="/" />

      {/* ═══════════════════════════════════════════════════════════════════
          THE MASTHEAD (cover)
          A dateline "folio" running header, three colossal headline lines with
          the print-registration reveal, a live IST clock, and two editorial
          CTAs. min-h fills the first screen.
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="min-h-[68vh] flex flex-col justify-center">
        {/* Dateline folio — the magazine running header on a ruled line. The
            Kannada hello is the masthead's language-of-origin credit (accent
            colour), and a real badge-skin element honours the morph contract:
            an "EST. 2024" sticker ☀ that becomes a "LIVE" status pill 🌙. */}
        <div className="rule pt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-labmono text-[11px] sm:text-xs tracking-widest text-ink-muted uppercase">
          <span className="text-accent-brand font-medium normal-case text-sm">ನಮಸ್ಕಾರ</span>
          <span aria-hidden="true">·</span>
          <span>I'm Srinidhi</span>
          <span aria-hidden="true">·</span>
          <span>Bengaluru, India · 12.97°N</span>
          <span aria-hidden="true">·</span>
          {/* The live clock — ticks every second (Lab instrument / Playground caption) */}
          <span className="text-ink">{clock} IST</span>
          {/* Pushes the rest to the right on wider screens */}
          <span className="hidden sm:block flex-1" />
          <span className="badge-skin px-2.5 py-1 text-[10px] normal-case inline-flex items-center gap-1.5">
            {/* the dot reads as a "live" indicator in the lab */}
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
            Vol.01
          </span>
        </div>

        {/* The headline. Visually three lines of giant type; semantically one
            h1 ("Srinidhi BS — an accountant who codes, cooks and trades"). The visual letters are
            decorative (aria-hidden) so screen readers read the clean label. */}
        <h1 aria-label="Srinidhi BS — an accountant who codes, cooks and trades" className="mt-8 sm:mt-10">
          <span aria-hidden="true" className="block overflow-hidden [overflow-wrap:anywhere]">
            <MastheadLine
              text="ACCOUNTANT"
              fontSize="clamp(2.25rem, 8vw, 7.5rem)"
              extraClass="leading-[0.85]"
              colorClass="text-ink"
              ghostA="text-accent-cta"
              ghostB="text-accent-trading"
            />
          </span>
          <span aria-hidden="true" className="block overflow-hidden ml-[28%] sm:ml-[34%]">
            <MastheadLine
              text="WHO"
              fontSize="clamp(1.4rem, 6vw, 3.75rem)"
              extraClass="leading-[0.85]"
              colorClass="text-ink-muted"
              ghostA="text-accent-tools"
              ghostB="text-accent-cooking"
            />
          </span>
          {/* Third line: the typewriter loop (CODES → COOKS → TRADES). No
              overflow-hidden here (unlike the lines above, whose letters slide
              in from below) — it would clip the caret's dip below the baseline. */}
          <span aria-hidden="true" className="block">
            <TypewriterLine
              fontSize="clamp(2.25rem, 8vw, 7.5rem)"
              extraClass="leading-[0.85]"
            />
          </span>
        </h1>

        {/* Under-masthead spine: a ruled line carrying the "annual" tagline. */}
        <div className="rule mt-8 pt-3 font-labmono text-[11px] sm:text-xs tracking-widest text-ink-muted uppercase">
          A personal annual · Finance · Trading · Tools · Cooking
        </div>

        {/* Editorial CTAs — flush-left links, not centred pills. */}
        <div className="mt-8 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() => navigate('/tools')}
            className="btn-skin-primary px-6 py-3 inline-flex items-center gap-2"
          >
            Open the tools <span aria-hidden="true">→</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/contact')}
            className="btn-skin-secondary px-6 py-3"
          >
            Get in touch
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          THE EDITOR — two-voices identity card
          Tells the visitor to press the toggle, then rewards it: the same
          facts re-voice between a human sheet and a spec readout.
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="mt-20 sm:mt-28 grid md:grid-cols-5 gap-8 md:gap-12 items-center">
        <div className="md:col-span-2">
          <p className="font-labmono text-xs tracking-widest text-ink-muted uppercase mb-3">
            Who is this?
          </p>
          <h2 className="display-skin text-ink mb-4" style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)' }}>
            One person, two minds
          </h2>
          <p className="text-ink-muted leading-relaxed">
            An accountant who codes for the joy of it, watches the markets, and cooks
            from scratch. Flip the theme in the corner — <span className="text-ink font-medium">☀ playground</span> or{' '}
            <span className="text-ink font-medium">🌙 laboratory</span> — and the same facts
            change their voice. The toggle is the introduction.
          </p>
        </div>
        <div className="md:col-span-3">
          <IdentitySheet />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          THE CONTENTS — four sections as a ruled index (not a card grid)
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="mt-20 sm:mt-28 baseline-grid">
        <p className="font-labmono text-xs tracking-widest text-ink-muted uppercase mb-2">
          Contents
        </p>
        <div>
          {SECTIONS.map((section) => (
            <ContentsRow key={section.title} section={section} />
          ))}
          {/* a closing rule under the last row completes the table */}
          <div className="rule" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          BACK-COVER AD BAR — quick utilities
          Framed top and bottom by ruled lines, like a zine's inside back cover.
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="mt-20 sm:mt-28 rule pt-8 pb-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
          <div className="lg:flex-1">
            <p className="font-labmono text-xs tracking-widest text-ink-muted uppercase mb-2">
              Quick utilities · no login · runs in your browser
            </p>
            <h2 className="display-skin text-ink" style={{ fontSize: 'clamp(1.5rem, 4.5vw, 2.5rem)' }}>
              Need a PDF fixed?
            </h2>
          </div>
          {/* Chips: stagger in, scroll horizontally on small screens. */}
          <motion.div
            className="flex gap-3 overflow-x-auto lg:overflow-visible flex-nowrap pb-1"
            variants={chipGroup}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-10% 0px' }}
          >
            {QUICK_TOOLS.map((tool) => (
              <ToolChip key={tool.path} label={tool.label} path={tool.path} />
            ))}
            <button
              type="button"
              onClick={() => navigate('/tools')}
              className="btn-skin-primary px-5 py-2 text-sm shrink-0 whitespace-nowrap"
            >
              All tools →
            </button>
          </motion.div>
        </div>
        <div className="rule mt-8" />
      </section>
    </PageWrapper>
  );
};

export default Home;
