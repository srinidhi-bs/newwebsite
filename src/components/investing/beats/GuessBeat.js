/**
 * GuessBeat — "guess first, then see the truth" (E2)
 * ===========================================================================
 * Why this exists: people remember a number far better when they've first
 * committed to a guess and then been surprised. So before we TELL the reader
 * something, we make them guess it.
 *
 * Two kinds of input (chosen by `beat.input.kind` in the content file):
 *
 *  1. 'slider' — drag to a number, then press "Lock my guess".
 *     { id: 's1-dosa-guess', type: 'guess', kicker: 'SEP 2026',
 *       question: 'What does that dosa cost today?',
 *       input: { kind: 'slider', min: 10, max: 200, step: 5, start: 20,
 *                prefix: '₹', suffix: '' },
 *       answer: 120,
 *       reveal: 'Twelve times more. Same dosa.' }
 *     → after locking: "Your guess ₹40 · Actually ₹120" (the ₹120 counts up
 *       from their guess), then the reveal text.
 *
 *  2. 'options' — tap one answer; tapping IS locking.
 *     { ..., input: { kind: 'options', options: [
 *         { id: 'a', label: 'About the same' },
 *         { id: 'b', label: 'About 5× more' } ] },
 *       answer: 'b', reveal: '...' }
 *     → the right option gets ✓, a wrong pick gets ✗, then the reveal text.
 *
 * Once locked, the guess is saved (via onAnswer → StoryPlayer → localStorage)
 * and can't be changed in this play-through — commitment is the point.
 *
 * @param {Object}   props.beat     - the beat from the sitting file
 * @param {*}        props.answer   - the reader's saved guess (undefined = not yet)
 * @param {Function} props.onAnswer - call with the guess to lock it
 * @param {Object}   props.ui       - button words (content/investing/<lang>/ui.js)
 * ===========================================================================
 */
import React, { useState, useEffect } from 'react';
import { motion, animate, useReducedMotion } from 'framer-motion';

// How many decimals to show, taken from the slider's step (0.5 → 1 decimal).
const decimalsOf = (step) => (String(step).split('.')[1] || '').length;

// Indian number format with the content file's prefix/suffix: 150000 → "₹1,50,000".
const formatValue = (value, input) => {
  const d = decimalsOf(input.step || 1);
  const num = Number(value).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });
  return `${input.prefix || ''}${num}${input.suffix || ''}`;
};

// The reveal text (string or array of paragraphs) — fades in after the answer.
const RevealText = ({ reveal, delay }) => {
  if (!reveal) return null;
  const paragraphs = Array.isArray(reveal) ? reveal : [reveal];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay, duration: 0.4 }} className="mt-6">
      {paragraphs.map((para, i) => (
        <p key={i} className="text-lg md:text-xl leading-relaxed text-ink mb-3 last:mb-0">{para}</p>
      ))}
    </motion.div>
  );
};

// ── Slider guess ────────────────────────────────────────────────────────────
const SliderGuess = ({ beat, answer, onAnswer, ui }) => {
  const { input } = beat;
  const reduceMotion = useReducedMotion();
  const locked = answer !== undefined;

  // The value under the reader's thumb before they lock it.
  const [draft, setDraft] = useState(input.start !== undefined ? input.start : input.min);

  // `justLocked` = they locked it THIS visit → play the count-up. A guess
  // restored from storage (page reload) shows the final number straight away.
  const [justLocked, setJustLocked] = useState(false);
  const [shownActual, setShownActual] = useState(locked ? beat.answer : null);

  useEffect(() => {
    if (!locked) return undefined;
    if (!justLocked || reduceMotion) {
      setShownActual(beat.answer);
      return undefined;
    }
    // Count up from the reader's guess to the real answer — the "whoa" moment.
    const controls = animate(answer, beat.answer, {
      duration: 1.2,
      ease: 'easeOut',
      onUpdate: (v) => setShownActual(v),
    });
    return () => controls.stop();
  }, [locked, justLocked, reduceMotion, answer, beat.answer]);

  const handleLock = () => {
    console.log(`[InvestingStory] ${beat.id}: guess locked at ${draft} (answer ${beat.answer})`);
    setJustLocked(true);
    onAnswer(draft);
  };

  if (locked) {
    return (
      <div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-labmono text-xs tracking-widest uppercase text-ink-muted mb-1">{ui.yourGuess}</p>
            <p className="text-2xl md:text-3xl font-bold text-ink-muted" data-testid="guess-yours">
              {formatValue(answer, input)}
            </p>
          </div>
          <div>
            <p className="font-labmono text-xs tracking-widest uppercase text-accent-trading mb-1">{ui.actual}</p>
            <p className="display-skin text-3xl md:text-4xl text-ink" data-testid="guess-actual">
              {formatValue(shownActual === null ? beat.answer : shownActual, input)}
            </p>
          </div>
        </div>
        <RevealText reveal={beat.reveal} delay={justLocked && !reduceMotion ? 1.2 : 0} />
      </div>
    );
  }

  return (
    <div>
      {/* The live number, big, so the reader feels the size of their guess */}
      <p className="display-skin text-4xl md:text-5xl text-ink mb-4 text-center" aria-hidden="true">
        {formatValue(draft, input)}
      </p>
      <input
        type="range"
        min={input.min}
        max={input.max}
        step={input.step || 1}
        value={draft}
        onChange={(e) => setDraft(Number(e.target.value))}
        aria-label={beat.question}
        aria-valuetext={formatValue(draft, input)}
        className="w-full accent-[rgb(var(--c-accent-trading))] h-10 cursor-pointer"
      />
      <div className="flex justify-between font-labmono text-xs text-ink-muted mt-1" aria-hidden="true">
        <span>{formatValue(input.min, input)}</span>
        <span>{formatValue(input.max, input)}</span>
      </div>
      <div className="text-center mt-6">
        <button type="button" onClick={handleLock} className="btn-skin-primary px-6 py-3 whitespace-nowrap">
          {ui.lockGuess}
        </button>
      </div>
    </div>
  );
};

// ── Tap-an-option guess ─────────────────────────────────────────────────────
const OptionsGuess = ({ beat, answer, onAnswer }) => {
  const locked = answer !== undefined;

  const handlePick = (optionId) => {
    console.log(`[InvestingStory] ${beat.id}: picked "${optionId}" (answer "${beat.answer}")`);
    onAnswer(optionId);
  };

  return (
    <div>
      <div className="grid gap-3">
        {beat.input.options.map((opt) => {
          const isRight = opt.id === beat.answer;
          const isPicked = opt.id === answer;
          // After locking: right answer ✓, the reader's wrong pick ✗, rest dim.
          let mark = '';
          let tone = '';
          if (locked) {
            if (isRight) { mark = ' ✓'; tone = 'ring-2 ring-accent-trading'; }
            else if (isPicked) { mark = ' ✗'; tone = 'opacity-70 line-through'; }
            else { tone = 'opacity-40'; }
          }
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handlePick(opt.id)}
              disabled={locked}
              aria-pressed={isPicked}
              className={`btn-skin-secondary px-5 py-4 text-left disabled:cursor-default ${tone}`}
            >
              {opt.label}{mark}
            </button>
          );
        })}
      </div>
      {locked && <RevealText reveal={beat.reveal} delay={0.2} />}
    </div>
  );
};

const GuessBeat = ({ beat, answer, onAnswer, ui }) => (
  <div>
    {beat.kicker && (
      <p className="font-labmono text-xs tracking-widest uppercase mb-4 text-accent-trading">{beat.kicker}</p>
    )}
    <p className="text-xl md:text-2xl leading-relaxed text-ink mb-6">{beat.question}</p>
    {beat.input.kind === 'options'
      ? <OptionsGuess beat={beat} answer={answer} onAnswer={onAnswer} />
      : <SliderGuess beat={beat} answer={answer} onAnswer={onAnswer} ui={ui} />}
  </div>
);

export default GuessBeat;
