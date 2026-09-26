/**
 * SplitBeat — "how much of your salary do you spend?" (S1)
 * ===========================================================================
 * The pie from Srinidhi's notebook map, alive: the reader drags a slider to
 * split their salary into Spend (hatched, like the sketch) and Save (clean
 * wedge). The pie redraws as they drag; "Lock it in" saves the choice.
 *
 * Example beat:
 *   { id: 's1-split', type: 'split', kicker: 'JAN 2000',
 *     question: 'Rent, food, bus... how much of your salary do you spend?',
 *     total: 10000, prefix: '₹', min: 40, max: 95, step: 5, start: 70,
 *     spendLabel: 'Spend', saveLabel: 'Save',
 *     reveal: 'So {save} a month is yours to keep.' }
 *   answer saved = the SPEND percentage (e.g. 80). The sitting's derive()
 *   turns that into {save} etc. for the reveal and later screens.
 *
 * @param {Object}   props.beat, props.answer, props.onAnswer, props.ui
 * ===========================================================================
 */
import React, { useState } from 'react';
import { RevealText } from './GuessBeat';
import { formatRupees } from '../storyText';

const INK = 'text-[#0E7490] dark:text-[#22D3EE]';

// Pie of radius 80 centred at (100,100). The SAVE wedge starts at 12 o'clock
// and runs clockwise; the SPEND part is the rest (hatched, like the sketch).
const Pie = ({ savePct, clipId }) => {
  const f = Math.min(Math.max(savePct / 100, 0.001), 0.999); // avoid 0/360° arcs
  const a = f * 2 * Math.PI;
  const ex = 100 + 80 * Math.sin(a);
  const ey = 100 - 80 * Math.cos(a);
  const save = `M100 100 L100 20 A80 80 0 ${f > 0.5 ? 1 : 0} 1 ${ex} ${ey} Z`;
  const spend = `M100 100 L${ex} ${ey} A80 80 0 ${f < 0.5 ? 1 : 0} 1 100 20 Z`;
  return (
    <svg viewBox="0 0 200 200" className={`w-44 h-44 md:w-52 md:h-52 mx-auto ${INK}`} aria-hidden="true">
      <defs>
        <clipPath id={clipId}><path d={spend} /></clipPath>
      </defs>
      <path d={save} fill="currentColor" opacity={0.18} />
      <g clipPath={`url(#${clipId})`}>
        {Array.from({ length: 16 }).map((_, i) => (
          <line key={i} x1={i * 14 - 20} y1={200} x2={i * 14 + 60} y2={0}
            stroke="currentColor" strokeWidth={2} opacity={0.7} />
        ))}
      </g>
      <circle cx={100} cy={100} r={80} fill="none" stroke="currentColor" strokeWidth={3} />
      <path d={`M100 100 L100 20 M100 100 L${ex} ${ey}`} stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
};

const SplitBeat = ({ beat, answer, onAnswer, ui }) => {
  const locked = answer !== undefined;
  const [draft, setDraft] = useState(beat.start !== undefined ? beat.start : beat.min);
  const spendPct = locked ? answer : draft;
  const savePct = 100 - spendPct;

  const handleLock = () => {
    console.log(`[InvestingStory] ${beat.id}: split locked — spend ${draft}%, save ${100 - draft}%`);
    onAnswer(draft);
  };

  return (
    <div>
      {beat.kicker && (
        <p className="font-labmono text-xs tracking-widest uppercase mb-4 text-accent-trading">{beat.kicker}</p>
      )}
      <p className="text-xl md:text-2xl leading-relaxed text-ink mb-6">{beat.question}</p>

      <Pie savePct={savePct} clipId={`split-${beat.id}`} />

      {/* Legend: live rupee amounts under the pie */}
      <div className="grid grid-cols-2 gap-4 text-center mt-4" data-testid="split-legend">
        <div>
          <p className="font-labmono text-xs tracking-widest uppercase text-ink-muted">{beat.spendLabel} · {spendPct}%</p>
          <p className="text-2xl font-bold text-ink">{formatRupees((beat.total * spendPct) / 100)}</p>
        </div>
        <div>
          <p className="font-labmono text-xs tracking-widest uppercase text-accent-trading">{beat.saveLabel} · {savePct}%</p>
          <p className="text-2xl font-bold text-ink">{formatRupees((beat.total * savePct) / 100)}</p>
        </div>
      </div>

      {locked ? (
        <RevealText reveal={beat.reveal} delay={0.1} />
      ) : (
        <>
          <input
            type="range"
            min={beat.min}
            max={beat.max}
            step={beat.step || 5}
            value={draft}
            onChange={(e) => setDraft(Number(e.target.value))}
            aria-label={beat.question}
            aria-valuetext={`${beat.spendLabel} ${draft}%, ${beat.saveLabel} ${100 - draft}%`}
            className="w-full accent-[rgb(var(--c-accent-trading))] h-10 cursor-pointer mt-4"
          />
          <div className="text-center mt-4">
            <button type="button" onClick={handleLock} className="btn-skin-primary px-6 py-3 whitespace-nowrap">
              {ui.lockSplit}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SplitBeat;
