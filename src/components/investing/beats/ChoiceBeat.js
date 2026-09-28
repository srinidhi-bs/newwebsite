/**
 * ChoiceBeat — "what would YOU do?" (E2)
 * ===========================================================================
 * The reader makes a decision; the story shows what that decision led to.
 * There's no right/wrong mark here (that's GuessBeat) — it's about living
 * with a choice, e.g. SELL or HOLD when the market has just crashed.
 *
 * Branching stays shallow on purpose: choose → see YOUR consequence → the
 * next beat continues the same story for everyone ("branch and merge back").
 * That keeps 7 sittings writable instead of exploding into a maze.
 *
 * Example beat from a content file:
 *   { id: 's6-crash-2008', type: 'choice', kicker: 'OCT 2008',
 *     text: 'The market has fallen 50%. Your ₹4.1 lakh is now ₹2 lakh.',
 *     options: [
 *       { id: 'sell', label: 'SELL — get out now',
 *         consequence: 'You kept ₹2 lakh... and watched it all come back without you.' },
 *       { id: 'hold', label: 'HOLD — do nothing',
 *         consequence: 'Two years later you were back above ₹4 lakh.' } ] }
 *
 * The pick is final for this play-through ("Play it again" resets it).
 *
 * MULTI-SELECT (Srinidhi's S1 review, 2026-09-28): `multi: true` lets the
 * reader tick several options, then confirm with one button. The answer is
 * then an ARRAY of option ids, and every picked option's consequence is
 * shown, in the order the options are listed. Example:
 *   { id: 's1-why', type: 'choice', multi: true, text: 'Why are you saving?',
 *     options: [ ... ] }   → answer e.g. ['kids', 'retire']
 * An older single-pick answer saved as a plain string still displays fine.
 *
 * @param {Object}   props.beat     - the beat from the sitting file
 * @param {string|string[]} props.answer - picked option id (or ids, multi); undefined = not yet
 * @param {Function} props.onAnswer - call with the id (or array of ids) to lock the choice
 * @param {Object}   props.ui       - button words (multi mode's confirm button)
 * ===========================================================================
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ChoiceBeat = ({ beat, answer, onAnswer, ui = {} }) => {
  const multi = Boolean(beat.multi);
  const locked = answer !== undefined;
  // What's been picked, always as an array (a saved single string counts as one)
  const lockedIds = locked ? (Array.isArray(answer) ? answer : [answer]) : [];
  // Multi mode: ticks made before the reader confirms
  const [ticked, setTicked] = useState([]);
  const pickedIds = locked ? lockedIds : ticked;

  const paragraphs = Array.isArray(beat.text) ? beat.text : [beat.text];
  // Consequences of every locked pick, in the order the options are listed
  const consequences = beat.options
    .filter((o) => lockedIds.includes(o.id))
    .flatMap((o) => (Array.isArray(o.consequence) ? o.consequence : [o.consequence]));

  const handlePick = (optionId) => {
    if (!multi) {
      console.log(`[InvestingStory] ${beat.id}: reader chose "${optionId}"`);
      onAnswer(optionId);
      return;
    }
    setTicked((prev) => (prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]));
  };

  const handleConfirm = () => {
    // Keep the options' own order, whatever order they were ticked in
    const ids = beat.options.map((o) => o.id).filter((id) => ticked.includes(id));
    console.log(`[InvestingStory] ${beat.id}: reader chose ${ids.join(', ')}`);
    onAnswer(ids);
  };

  return (
    <div>
      {beat.kicker && (
        <p className="font-labmono text-xs tracking-widest uppercase mb-4 text-accent-trading">{beat.kicker}</p>
      )}
      {paragraphs.map((para, i) => (
        <p key={i} className="text-xl md:text-2xl leading-relaxed text-ink mb-4">{para}</p>
      ))}

      <div className="grid gap-3 mt-6">
        {beat.options.map((opt) => {
          const isPicked = pickedIds.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handlePick(opt.id)}
              disabled={locked}
              aria-pressed={isPicked}
              className={`btn-skin-secondary px-5 py-4 text-left disabled:cursor-default ${
                isPicked ? 'ring-2 ring-accent-trading' : locked ? 'opacity-40' : ''
              }`}
            >
              {/* Multi mode shows a tick box so it's obvious several are allowed */}
              {multi && <span aria-hidden="true" className="mr-2 font-labmono">{isPicked ? '☑' : '☐'}</span>}
              {opt.label}
            </button>
          );
        })}
      </div>

      {multi && !locked && (
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={ticked.length === 0}
            className="btn-skin-primary px-6 py-3 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {ui.lockChoices || 'That’s my answer'}
          </button>
        </div>
      )}

      {consequences.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mt-6">
          {consequences.map((para, i) => (
            <p key={i} className="text-lg md:text-xl leading-relaxed text-ink mb-3 last:mb-0">{para}</p>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ChoiceBeat;
