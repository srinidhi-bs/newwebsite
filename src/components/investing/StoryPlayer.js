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
 * Interactive beats (E2: 'guess', 'choice') report what the reader did via
 * onAnswer; the player saves it under progress → answers[beat.id] and keeps
 * Next LOCKED until they've answered — you can't skip the game part.
 *
 * Example:
 *   <StoryPlayer sitting={sitting1} ui={ui} />
 *   → shows "Sitting 1 · 1 / 3", the first beat, and a Next button.
 *
 * @param {Object} props.sitting - { id, number, title, beats: [...] }
 * @param {Object} props.ui      - button/frame words (content/investing/<lang>/ui.js)
 * @param {Function} [props.onComplete] - called with sitting.id when finished
 * ===========================================================================
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import NarrationBeat from './beats/NarrationBeat';
import GuessBeat from './beats/GuessBeat';
import ChoiceBeat from './beats/ChoiceBeat';
import { loadProgress, saveProgress, getSittingProgress, updateSitting } from './storyProgress';

// type (from the content file) → the component that draws it, and whether
// the reader must answer before Next unlocks.
const BEAT_TYPES = {
  narration: { Component: NarrationBeat, needsAnswer: false },
  guess: { Component: GuessBeat, needsAnswer: true },
  choice: { Component: ChoiceBeat, needsAnswer: true },
};

const StoryPlayer = ({ sitting, ui, onComplete }) => {
  const reduceMotion = useReducedMotion();
  const lastIndex = sitting.beats.length - 1;

  // Load saved progress ONCE, on first render (the function form of
  // useState runs only then — not on every re-render).
  const [progress, setProgress] = useState(() => loadProgress());
  const saved = getSittingProgress(progress, sitting.id);

  // Clamp: if a sitting file got SHORTER since the reader's last visit, a
  // saved index could point past the end — fall back to the last beat.
  const beatIndex = Math.min(saved.beatIndex, lastIndex);

  // End card shows when the reader has finished the sitting and hasn't
  // chosen to replay it. Starts true for a returning reader who finished.
  const [showEnd, setShowEnd] = useState(() => saved.completed);

  // Persist every change of progress (runs after React has rendered it).
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // Move to another beat inside this sitting.
  const goTo = (index) => {
    console.log(`[InvestingStory] ${sitting.id}: beat ${beatIndex + 1} → ${index + 1} of ${lastIndex + 1}`);
    setProgress((p) => updateSitting(p, sitting.id, { beatIndex: index }));
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
        <button type="button" onClick={handlePlayAgain} className="btn-skin-secondary px-5 py-3">
          {ui.playAgain}
        </button>
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
  const beat = sitting.beats[beatIndex];
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
    <section className="card-skin p-6 md:p-10 max-w-2xl mx-auto">
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
