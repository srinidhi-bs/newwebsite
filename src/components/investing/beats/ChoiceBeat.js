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
 * @param {Object}   props.beat     - the beat from the sitting file
 * @param {string}   props.answer   - id of the option already picked (undefined = not yet)
 * @param {Function} props.onAnswer - call with the option id to lock the choice
 * ===========================================================================
 */
import React from 'react';
import { motion } from 'framer-motion';

const ChoiceBeat = ({ beat, answer, onAnswer }) => {
  const chosen = beat.options.find((o) => o.id === answer);
  const paragraphs = Array.isArray(beat.text) ? beat.text : [beat.text];
  const consequence = chosen && (Array.isArray(chosen.consequence) ? chosen.consequence : [chosen.consequence]);

  const handlePick = (optionId) => {
    console.log(`[InvestingStory] ${beat.id}: reader chose "${optionId}"`);
    onAnswer(optionId);
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
          const isChosen = opt.id === answer;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handlePick(opt.id)}
              disabled={Boolean(chosen)}
              aria-pressed={isChosen}
              className={`btn-skin-secondary px-5 py-4 text-left disabled:cursor-default ${
                chosen ? (isChosen ? 'ring-2 ring-accent-trading' : 'opacity-40') : ''
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {consequence && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mt-6">
          {consequence.map((para, i) => (
            <p key={i} className="text-lg md:text-xl leading-relaxed text-ink mb-3 last:mb-0">{para}</p>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ChoiceBeat;
