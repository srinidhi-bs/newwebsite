/**
 * BasketBeat — "one guess, six reveals" shopping basket (S1)
 * ===========================================================================
 * The reader sees a basket of everyday things with their OLD prices, makes
 * ONE guess — "how many times costlier is this basket today?" — and then
 * each item flips to its NEW price one after another, ending on the real
 * multiple for the whole basket.
 *
 * Example beat:
 *   { id: 's1-basket', type: 'basket', kicker: 'SEP 2026',
 *     question: 'How many times costlier is this basket today?',
 *     thenLabel: '2000', nowLabel: '2026', totalLabel: 'Whole basket',
 *     items: [ { icon: '⛽', label: 'Petrol, 1 litre', then: 28, now: 103 }, ... ],
 *     input: { min: 1, max: 15, step: 0.5, start: 3, prefix: '', suffix: '×' },
 *     reveal: '...' }
 *
 * The real multiple is COMPUTED here from the items (total now ÷ total then),
 * never typed into the content file — so the prices and the answer can't
 * disagree. Rounded to 1 decimal.
 *
 * @param {Object}   props.beat, props.answer (the reader's guess), props.onAnswer, props.ui
 * ===========================================================================
 */
import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { formatValue, RevealText } from './GuessBeat';
import { formatRupees } from '../storyText';

// Total bill multiple: 2 decimals of precision, shown with 1.
export const basketMultiple = (items) => {
  const then = items.reduce((sum, it) => sum + it.then, 0);
  const now = items.reduce((sum, it) => sum + it.now, 0);
  return Math.round((now / then) * 10) / 10;
};

const BasketBeat = ({ beat, answer, onAnswer, ui }) => {
  const reduceMotion = useReducedMotion();
  const { input, items } = beat;
  const locked = answer !== undefined;
  const [draft, setDraft] = useState(input.start !== undefined ? input.start : input.min);
  // Only animate the flips when the guess was locked on THIS visit.
  const [justLocked, setJustLocked] = useState(false);

  const actual = basketMultiple(items);
  const thenTotal = items.reduce((s, it) => s + it.then, 0);
  const nowTotal = items.reduce((s, it) => s + it.now, 0);
  const step = justLocked && !reduceMotion ? 0.35 : 0; // seconds between flips
  const afterFlips = step * (items.length + 1);

  const handleLock = () => {
    console.log(`[InvestingStory] ${beat.id}: basket guess ${draft}× (actual ${actual}×)`);
    setJustLocked(true);
    onAnswer(draft);
  };

  return (
    <div>
      {beat.kicker && (
        <p className="font-labmono text-xs tracking-widest uppercase mb-4 text-accent-trading">{beat.kicker}</p>
      )}
      <p className="text-xl md:text-2xl leading-relaxed text-ink mb-5">{beat.question}</p>

      {/* The basket table */}
      <table className="w-full text-left mb-2" data-testid="basket-table">
        <thead>
          <tr className="font-labmono text-xs tracking-widest uppercase text-ink-muted">
            <th className="py-1 font-normal" />
            <th className="py-1 font-normal text-right">{beat.thenLabel}</th>
            <th className="py-1 font-normal text-right">{beat.nowLabel}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={it.label} className="border-t border-ink/10">
              <td className="py-2 pr-2 text-ink">
                <span aria-hidden="true" className="mr-2">{it.icon}</span>{it.label}
              </td>
              <td className="py-2 text-right font-labmono text-ink-muted whitespace-nowrap">{formatRupees(it.then)}</td>
              <td className="py-2 text-right font-labmono font-bold text-ink whitespace-nowrap">
                {locked ? (
                  <motion.span
                    initial={step ? { opacity: 0, rotateX: 90 } : false}
                    animate={{ opacity: 1, rotateX: 0 }}
                    transition={{ delay: step * (i + 1), duration: 0.3 }}
                    className="inline-block"
                  >
                    {formatRupees(it.now)}
                  </motion.span>
                ) : (
                  <span className="text-ink-muted">?</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {locked ? (
        <motion.div
          initial={step ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: afterFlips, duration: 0.4 }}
        >
          <p className="text-ink-muted text-sm mt-3">
            {beat.totalLabel}: {formatRupees(thenTotal)} → {formatRupees(nowTotal)}
          </p>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="font-labmono text-xs tracking-widest uppercase text-ink-muted mb-1">{ui.yourGuess}</p>
              <p className="text-2xl md:text-3xl font-bold text-ink-muted" data-testid="basket-guess">{formatValue(answer, input)}</p>
            </div>
            <div>
              <p className="font-labmono text-xs tracking-widest uppercase text-accent-trading mb-1">{ui.actual}</p>
              <p className="display-skin text-3xl md:text-4xl text-ink" data-testid="basket-actual">
                {formatValue(actual, { ...input, step: 0.1 })}
              </p>
            </div>
          </div>
          <RevealText reveal={beat.reveal} delay={0.2} />
        </motion.div>
      ) : (
        <div className="mt-4">
          <p className="display-skin text-4xl md:text-5xl text-ink text-center mb-2" aria-hidden="true">
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
          <div className="text-center mt-4">
            <button type="button" onClick={handleLock} className="btn-skin-primary px-6 py-3 whitespace-nowrap">
              {ui.lockGuess}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasketBeat;
