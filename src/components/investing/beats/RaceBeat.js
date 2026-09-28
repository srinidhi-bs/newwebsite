/**
 * RaceBeat — "₹1 lakh in each place, watch them race 2000 → today" (S2)
 * ===========================================================================
 * A row of horizontal bars, one per "runner" (cupboard, savings account, FD,
 * PPF, gold, shares...). The reader presses Start: a big year counter ticks
 * from 2000 to 2026 and every bar grows to that year's value. A dashed
 * vertical line — "Prices" — moves along too: it marks what ₹1 lakh needed
 * to become just to keep up with rising prices. A bar that finishes LEFT of
 * the line lost buying power.
 *
 * Example beat (values = what ₹1 grew to, one per year-label):
 *   { id: 's2-race', type: 'race', kicker: '2000 ▶ 2026',
 *     text: 'Ready? Press start.',
 *     labels: ['2000', '2001', ..., '2026'],
 *     scaleMax: 35,                              // bar = 100% at this multiple
 *     priceLine: { label: 'Prices', values: [1, 1.06, ..., 4.74] },
 *     runners: [
 *       { id: 'fd', icon: '📜', label: 'Fixed deposit', color: 'teal', values: [1, 1.09, ...] },
 *       { id: 'land', icon: '🏠', label: 'Land', color: 'emerald',
 *         finalOnly: 150, note: 'No price until you sell' },   // no yearly data
 *     ],
 *     events: [ { at: '2008', text: 'Crash! Shares lose more than half.' } ],
 *     reveal: 'Text shown after the finish.' }
 *
 * `finalOnly` runners (land) have no yearly price — nobody quotes a plot's
 * price every day — so they show a dotted "no price until you sell" lane
 * during the race and jump to their final value at the finish.
 * A value above scaleMax is drawn as a full bar marked "off the chart ↗".
 *
 * Next unlocks once the reader has watched the race (or skipped to the end):
 * the answer saved is simply 'watched', so a returning reader sees the finish.
 * Reduced-motion readers skip the animation — Start jumps to the finish.
 *
 * @param {Object} props.beat, props.answer, props.onAnswer, props.ui
 * ===========================================================================
 */
import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { RevealText } from './GuessBeat';

const STEP_MS = 550; // one year every 0.55 s → the whole race ≈ 15 s

// Bar colours per runner. Written out in full so Tailwind keeps the classes.
const BAR = {
  stone: 'bg-stone-400 dark:bg-stone-500',
  sky: 'bg-sky-500 dark:bg-sky-400',
  teal: 'bg-teal-600 dark:bg-teal-400',
  indigo: 'bg-indigo-500 dark:bg-indigo-400',
  amber: 'bg-amber-500 dark:bg-amber-400',
  rose: 'bg-rose-500 dark:bg-rose-400',
  emerald: 'bg-emerald-600 dark:bg-emerald-400',
};

/**
 * What ₹1 lakh became, as a reader would say it.
 *   1 → "₹1 lakh", 2.503 → "₹2.5 lakh", 22.47 → "₹22 lakh", 150 → "₹1.5 crore"
 */
export const formatLakh = (multiple) => {
  if (multiple >= 100) {
    const crore = Math.round(multiple) / 100;
    return `₹${Number(crore.toFixed(1))} crore`;
  }
  const lakh = multiple < 10 ? Number(multiple.toFixed(1)) : Math.round(multiple);
  return `₹${lakh} lakh`;
};

const RaceBeat = ({ beat, answer, onAnswer, ui }) => {
  const reduceMotion = useReducedMotion();
  const { labels, runners, priceLine, scaleMax, events = [] } = beat;
  const last = labels.length - 1;
  const watched = answer !== undefined;

  // Which year we're showing. A returning reader starts at the finish.
  const [step, setStep] = useState(watched ? last : 0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);

  // Stop the clock if the reader leaves this screen mid-race.
  useEffect(() => () => clearInterval(timer.current), []);

  const finish = () => {
    clearInterval(timer.current);
    setPlaying(false);
    setStep(last);
    if (!watched) {
      console.log(`[InvestingStory] ${beat.id}: race finished`);
      onAnswer('watched');
    }
  };

  const start = () => {
    console.log(`[InvestingStory] ${beat.id}: race started${reduceMotion ? ' (reduced motion → straight to finish)' : ''}`);
    if (reduceMotion) { finish(); return; }
    clearInterval(timer.current);
    setStep(0);
    setPlaying(true);
    let s = 0;
    timer.current = setInterval(() => {
      s += 1;
      if (s >= last) { finish(); return; }
      setStep(s);
    }, STEP_MS);
  };

  const atFinish = step === last && !playing;
  // Share of the track (0–100%) for a multiple; anything above scaleMax is capped.
  const pct = (v) => Math.min(v / scaleMax, 1) * 100;
  const priceNow = priceLine.values[step];
  // The newest story note whose year has been reached (e.g. the 2008 crash).
  const reached = events.filter((e) => labels.indexOf(String(e.at)) <= step && labels.indexOf(String(e.at)) >= 0);
  const note = reached.length ? reached[reached.length - 1] : null;
  // Notes only narrate the race while it runs (the finish has its own text)
  const showNote = playing && note;

  return (
    <div>
      {beat.kicker && (
        <p className="font-labmono text-xs tracking-widest uppercase mb-4 text-accent-trading">{beat.kicker}</p>
      )}
      {beat.text && <p className="text-xl md:text-2xl leading-relaxed text-ink mb-5">{beat.text}</p>}

      {/* Year counter + the story note for the current stretch */}
      <div className="flex items-baseline justify-between gap-4 mb-3 min-h-[3.5rem]">
        <p className="display-skin text-4xl md:text-5xl text-ink tabular-nums" data-testid="race-year">{labels[step]}</p>
        {showNote && (
          <motion.p
            key={note.at}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm md:text-base text-ink-muted text-right leading-snug max-w-[60%]"
            data-testid="race-note"
          >
            {note.text}
          </motion.p>
        )}
      </div>

      {/* The track. The prices marker is drawn INSIDE each bar (a dashed
          tick at the same spot in every lane) — a single line across the
          whole track would cut through the runners' names. Its label sits
          above the first lane, following the marker. */}
      <div data-testid="race-track">
        <div className="relative h-4" aria-hidden="true">
          <span
            className="absolute -translate-x-1/2 font-labmono text-[10px] tracking-widest uppercase text-ink whitespace-nowrap"
            style={{ left: `${pct(priceNow)}%`, transition: `left ${STEP_MS}ms linear` }}
          >
            {priceLine.label} ↓
          </span>
        </div>

        <ul className="space-y-3 pt-1">
          {runners.map((r) => {
            const isFinalOnly = r.finalOnly !== undefined;
            const value = isFinalOnly ? (atFinish ? r.finalOnly : null) : r.values[step];
            const offChart = value !== null && value > scaleMax;
            return (
              <li key={r.id} data-testid={`race-lane-${r.id}`}>
                <div className="flex items-baseline justify-between text-sm mb-1">
                  <span className="text-ink">
                    <span aria-hidden="true" className="mr-1.5">{r.icon}</span>{r.label}
                  </span>
                  <span className="font-labmono font-bold text-ink tabular-nums" data-testid={`race-value-${r.id}`}>
                    {value === null ? '?' : formatLakh(value)}
                    {offChart && <span className="font-normal text-ink-muted"> ↗</span>}
                  </span>
                </div>
                <div className="relative h-3 w-full rounded-full bg-ink/10">
                  {value === null ? (
                    // Land during the race: no yearly price exists
                    <div className="h-full w-full border border-dashed border-ink/30 rounded-full flex items-center px-2">
                      <span className="font-labmono text-[9px] leading-none text-ink-muted truncate">{r.note}</span>
                    </div>
                  ) : (
                    <div
                      className={`h-full rounded-full ${BAR[r.color] || 'bg-accent-trading'}`}
                      style={{ width: `${pct(value)}%`, transition: `width ${STEP_MS}ms linear` }}
                    />
                  )}
                  {/* This lane's "Prices" marker */}
                  <div
                    className="absolute -top-1 -bottom-1 border-l-2 border-dashed border-ink/70 pointer-events-none"
                    style={{ left: `${pct(priceNow)}%`, transition: `left ${STEP_MS}ms linear` }}
                    aria-hidden="true"
                  />
                </div>
                {offChart && (
                  <p className="font-labmono text-[10px] text-ink-muted mt-0.5 text-right">{ui.raceOffChart}</p>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Controls */}
      <div className="text-center mt-6">
        {playing ? (
          <button type="button" onClick={finish} className="btn-skin-secondary px-5 py-3 whitespace-nowrap">
            {ui.raceSkip}
          </button>
        ) : (
          <button type="button" onClick={start} className="btn-skin-primary px-6 py-3 whitespace-nowrap">
            {watched ? ui.raceReplay : ui.raceStart}
          </button>
        )}
      </div>

      {atFinish && watched && <RevealText reveal={beat.reveal} delay={0.2} />}
    </div>
  );
};

export default RaceBeat;
