/**
 * StoryPlayer — the "DVD player" of Investing, from zero
 * ===========================================================================
 * Give it one sitting (the "disc": a list of beats from a content file) and it:
 *   1. shows ONE beat (screen) at a time, with Back / Next buttons,
 *   2. animates each new beat in (a short fade + rise),
 *   3. remembers the reader's place in localStorage (see storyProgress.js),
 *      so closing the tab and coming back resumes on the same screen,
 *   4. on the last beat, "Finish sitting" marks the sitting complete and
 *      shows an end card (the level map in E3 reads that "completed" flag).
 *
 * Which component draws a beat is decided by its `type`, via BEAT_TYPES
 * below. Adding a new kind of screen = write the component + add one line
 * to that map. The player itself doesn't change.
 *
 * Text placeholders like {save} are filled from the sitting's derive(answers)
 * (see storyText.js) — so later screens can repeat the reader's own numbers.
 *
 * Interactive beats ('guess', 'choice', 'split', 'basket') report what the reader did via
 * onAnswer; the player saves it under progress → answers[beat.id] and keeps
 * Next LOCKED until they've answered — you can't skip the game part.
 *
 * Example:
 *   <StoryPlayer sitting={sitting1} ui={ui} />
 *   → shows "Sitting 1 · 1 / 3", the first beat, and a Next button.
 *
 * @param {Object} props.sitting     - { id, number, title, beats: [...] }
 * @param {Object} props.ui          - button/frame words (content/investing/<lang>/ui.js)
 * @param {Object} props.progress    - saved progress (from useStoryProgress, owned by the page)
 * @param {Function} props.setProgress - its setter
 * @param {Function} [props.onComplete] - called with sitting.id when finished
 * @param {Function} [props.onExit]     - if given, shows a "← Map" button that calls it
 * ===========================================================================
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import NarrationBeat from './beats/NarrationBeat';
import GuessBeat from './beats/GuessBeat';
import ChoiceBeat from './beats/ChoiceBeat';
import SplitBeat from './beats/SplitBeat';
import BasketBeat from './beats/BasketBeat';
import RaceBeat from './beats/RaceBeat';
import CompareBeat from './beats/CompareBeat';
import { fillBeat, deriveVars } from './storyText';
import { getSittingProgress, updateSitting } from './storyProgress';
import { trackEvent } from '../../utils/analytics';

// type (from the content file) → the component that draws it, and whether
// the reader must answer before Next unlocks.
const BEAT_TYPES = {
  narration: { Component: NarrationBeat, needsAnswer: false },
  guess: { Component: GuessBeat, needsAnswer: true },
  choice: { Component: ChoiceBeat, needsAnswer: true },
  split: { Component: SplitBeat, needsAnswer: true },
  basket: { Component: BasketBeat, needsAnswer: true },
  race: { Component: RaceBeat, needsAnswer: true },       // Next opens once watched (S2)
  compare: { Component: CompareBeat, needsAnswer: false }, // (S2)
};

// After Next / Back the card's top edge stops this far below the fixed header.
const CARD_GAP_PX = 16;

const StoryPlayer = ({ sitting, ui, progress, setProgress, onComplete, onExit }) => {
  const reduceMotion = useReducedMotion();
  const lastIndex = sitting.beats.length - 1;

  // Progress is owned by the page (useStoryProgress) — the level map reads
  // the very same object, so "completed" here instantly unlocks the map.
  const saved = getSittingProgress(progress, sitting.id);

  // Clamp: if a sitting file got SHORTER since the reader's last visit, a
  // saved index could point past the end — fall back to the last beat.
  const beatIndex = Math.min(saved.beatIndex, lastIndex);

  // End card shows when the reader has finished the sitting and hasn't
  // chosen to replay it. Starts true for a returning reader who finished.
  const [showEnd, setShowEnd] = useState(() => saved.completed);

  const cardRef = useRef(null); // the story card — Next / Back glide to its top

  // ── Analytics (Session 52) — how far readers get ────────────────────────
  // ifz-sitting-start: the reader opened this sitting to play (or replays it).
  // ifz-screen:        the reader reached a NEW screen, e.g. "S1 · 04/10".
  //                    Only moving FORWARD past the furthest screen of this
  //                    visit counts, so Back-then-Next isn't double counted.
  //                    A resumed reader sends the screen they land on.
  // Refs, not state: React's StrictMode runs effects twice in development,
  // and a ref remembers "already sent" across that re-run.
  // The page keys this player by sitting id → fresh refs for each sitting.
  const startSent = useRef(false);
  const furthestSent = useRef(-1);
  useEffect(() => {
    if (showEnd || lastIndex < 0) return; // end card / empty stub aren't screens
    if (!startSent.current) {
      startSent.current = true;
      trackEvent('ifz-sitting-start', { sitting: sitting.number });
    }
    if (beatIndex > furthestSent.current) {
      furthestSent.current = beatIndex;
      const pad = (n) => String(n).padStart(2, '0'); // "04/10" sorts in order
      trackEvent('ifz-screen', { at: `S${sitting.number} · ${pad(beatIndex + 1)}/${pad(lastIndex + 1)}` });
    }
  }, [showEnd, beatIndex, lastIndex, sitting.number]);

  // Move to another beat inside this sitting.
  const goTo = (index) => {
    console.log(`[InvestingStory] ${sitting.id}: beat ${beatIndex + 1} → ${index + 1} of ${lastIndex + 1}`);
    setProgress((p) => updateSitting(p, sitting.id, { beatIndex: index }));
    // A new screen starts at its first line: glide UP until the card's top
    // edge sits just under the fixed header (not the page top — that showed
    // the breadcrumbs and a band of empty page; Srinidhi's screenshots,
    // Session 54). Without this, a reader who scrolled down to reach Next
    // landed mid-way into the next screen. Only ever moves UP: if the
    // card's top is already in view, nothing moves.
    // Example: scrolled to 900, card top at −400 on screen, header ends at
    // 117 → glide to 900 − 400 − 117 − 16 = 367.
    const card = cardRef.current;
    if (!card) return;
    const header = document.querySelector('header.nav-skin');
    const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
    const target = Math.max(0, window.scrollY + card.getBoundingClientRect().top - headerBottom - CARD_GAP_PX);
    if (window.scrollY > target) {
      // Smooth glide (his pick); reduced-motion readers get an instant jump.
      window.scrollTo({ top: target, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  };

  const handleNext = () => {
    if (beatIndex < lastIndex) {
      goTo(beatIndex + 1);
      return;
    }
    // Last beat → sitting finished.
    console.log(`[InvestingStory] ${sitting.id}: finished 🎉`);
    setProgress((p) => updateSitting(p, sitting.id, { completed: true }));
    setShowEnd(true);
    trackEvent('ifz-sitting-finish', { sitting: sitting.number });
    if (onComplete) onComplete(sitting.id);
  };

  // An interactive beat locked a guess / made a choice → save it.
  const handleAnswer = (beatId, value) => {
    setProgress((p) => {
      const current = getSittingProgress(p, sitting.id);
      return updateSitting(p, sitting.id, { answers: { ...current.answers, [beatId]: value } });
    });
  };

  const handleBack = () => {
    if (beatIndex > 0) goTo(beatIndex - 1);
  };

  const handlePlayAgain = () => {
    console.log(`[InvestingStory] ${sitting.id}: replaying from the start`);
    // "completed" stays true — replaying doesn't re-lock anything on the map.
    // Answers are wiped so every guess and choice can be made afresh.
    setProgress((p) => updateSitting(p, sitting.id, { beatIndex: 0, answers: {} }));
    // A replay is a fresh play for analytics: start + screens are sent again
    startSent.current = false;
    furthestSent.current = -1;
    setShowEnd(false);
  };

  // ── End card ─────────────────────────────────────────────────────────────
  if (showEnd) {
    return (
      <section className="card-skin p-6 md:p-10 max-w-2xl mx-auto text-center" aria-live="polite">
        <p className="font-labmono text-xs tracking-widest uppercase mb-3 text-accent-trading">
          {ui.sittingLabel} {sitting.number}
        </p>
        <h3 className="display-skin text-2xl md:text-3xl text-ink mb-6">{ui.completeTitle}</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {onExit && (
            <button type="button" onClick={onExit} className="btn-skin-primary px-5 py-3 whitespace-nowrap">
              {ui.backToMap}
            </button>
          )}
          <button type="button" onClick={handlePlayAgain} className="btn-skin-secondary px-5 py-3 whitespace-nowrap">
            {ui.playAgain}
          </button>
        </div>
      </section>
    );
  }

  // ── Normal play ──────────────────────────────────────────────────────────
  // A sitting file with no beats yet (e.g. a "coming soon" stub) would make
  // beatIndex -1 and crash below — show nothing instead.
  if (lastIndex < 0) {
    console.warn(`[InvestingStory] ${sitting.id} has no beats — nothing to play.`);
    return null;
  }
  // The beat as written, with {placeholders} filled from the reader's answers.
  const vars = deriveVars(sitting, saved.answers);
  const beat = fillBeat(sitting.beats[beatIndex], vars);
  const beatType = BEAT_TYPES[beat.type];
  const BeatComponent = beatType && beatType.Component;
  const answer = saved.answers[beat.id];
  // Next is locked on an interactive beat until the reader has answered.
  const waitingForAnswer = Boolean(beatType && beatType.needsAnswer && answer === undefined);
  if (!BeatComponent) {
    // A typo in a content file ("naration") shouldn't crash the page.
    console.warn(`[InvestingStory] Unknown beat type "${beat.type}" in beat "${beat.id}".`);
  }

  // Reduced-motion readers get a plain cross-fade (no movement).
  const rise = reduceMotion ? 0 : 16;

  return (
    <section ref={cardRef} className="card-skin p-6 md:p-10 max-w-2xl mx-auto">
      {/* Back to the level map (only when the page gives us somewhere to go) */}
      {onExit && (
        <button
          type="button"
          onClick={onExit}
          className="font-labmono text-xs tracking-widest uppercase text-ink-muted hover:text-ink mb-4"
        >
          {ui.backToMapShort}
        </button>
      )}
      {/* Where am I? "SITTING 1 · 2 / 3" + a thin progress bar */}
      <div className="flex items-center justify-between mb-2">
        <p className="font-labmono text-xs tracking-widest uppercase text-ink-muted">
          {ui.sittingLabel} {sitting.number} · {sitting.title}
        </p>
        <p className="font-labmono text-xs text-ink-muted whitespace-nowrap shrink-0 ml-4" data-testid="beat-counter">
          {beatIndex + 1} / {lastIndex + 1}
        </p>
      </div>
      <div className="h-1 w-full bg-ink/10 rounded-full mb-8 overflow-hidden" aria-hidden="true">
        <div
          className="h-full bg-accent-trading transition-all duration-300"
          style={{ width: `${((beatIndex + 1) / (lastIndex + 1)) * 100}%` }}
        />
      </div>

      {/* The beat itself. aria-live: screen readers announce each new screen.
          key={beat.id} makes AnimatePresence treat every beat as a new
          element → old one fades out, new one fades/rises in. */}
      <div aria-live="polite" className="min-h-[10rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={beat.id}
            initial={{ opacity: 0, y: rise }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -rise }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {BeatComponent ? (
              <BeatComponent
                beat={beat}
                answer={answer}
                onAnswer={(value) => handleAnswer(beat.id, value)}
                ui={ui}
              />
            ) : (
              <p className="text-ink-muted">{ui.unknownBeat}</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Back / Next */}
      <div className="flex items-center justify-between mt-10 gap-4">
        <button
          type="button"
          onClick={handleBack}
          disabled={beatIndex === 0}
          className="btn-skin-secondary px-5 py-3 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {ui.back}
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={waitingForAnswer}
          className="btn-skin-primary px-6 py-3 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {beatIndex === lastIndex ? ui.finish : ui.next}
        </button>
      </div>
      {waitingForAnswer && (
        <p className="font-labmono text-xs text-ink-muted text-right mt-2">{ui.answerFirst}</p>
      )}
    </section>
  );
};

export default StoryPlayer;
