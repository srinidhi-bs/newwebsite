/**
 * Sitting 2 content guards — the race data and the words about it must agree.
 * (A typo in a 27-number array, or a finish screen that says "₹35 lakh"
 * while the race ends at ₹30 lakh, should fail here, not in front of a reader.)
 */
import sitting2 from './sitting2';
import { formatLakh } from '../../../components/investing/beats/RaceBeat';

const race = sitting2.beats.find((b) => b.type === 'race');
const finishText = sitting2.beats.find((b) => b.id === 's2-finish').text.join(' ');

test('every runner (and the prices line) has one value per year label', () => {
  race.runners
    .filter((r) => r.finalOnly === undefined)
    .forEach((r) => expect([r.id, r.values.length]).toEqual([r.id, race.labels.length]));
  expect(race.priceLine.values).toHaveLength(race.labels.length);
});

test('every runner starts at ₹1 lakh', () => {
  race.runners
    .filter((r) => r.finalOnly === undefined)
    .forEach((r) => expect([r.id, r.values[0]]).toEqual([r.id, 1]));
});

test('the finish screen quotes the same figures the race ends on', () => {
  // Finish text rounds a little further ("≈ ₹35 lakh" for 34.59 → "₹35 lakh")
  const shown = { gold: '₹35 lakh', shares: '₹34 lakh', ppf: '₹8 lakh', fd: '₹6.5 lakh', savings: '₹2.5 lakh', land: '₹1.5 crore' };
  race.runners.forEach((r) => {
    if (!shown[r.id]) return;
    const final = r.finalOnly !== undefined ? r.finalOnly : r.values[r.values.length - 1];
    const rounded = r.id === 'gold' || r.id === 'ppf' ? `₹${Math.round(final)} lakh` : formatLakh(final);
    expect([r.id, rounded]).toEqual([r.id, shown[r.id]]);
    expect(finishText).toContain(shown[r.id]);
  });
  // "just to stand still ... about ₹4.7 lakh" = the prices line's end
  expect(formatLakh(race.priceLine.values[race.priceLine.values.length - 1])).toBe('₹4.7 lakh');
});

test('the FD guess answer matches the race FD finish', () => {
  const fdGuess = sitting2.beats.find((b) => b.id === 's2-fd');
  const fdFinal = race.runners.find((r) => r.id === 'fd').values.slice(-1)[0];
  expect(Math.round(fdFinal * 2) / 2).toBe(fdGuess.answer); // 6.49 → 6.5
});

test('the bet offers every runner and derive() names the pick back', () => {
  const bet = sitting2.beats.find((b) => b.id === 's2-bet');
  expect(bet.options.map((o) => o.id)).toEqual(race.runners.map((r) => r.id));
  bet.options.forEach((o) => expect([o.id, typeof o.note]).toEqual([o.id, 'string'])); // every option described
  expect(sitting2.derive({ 's2-bet': 'gold' }).pick).toBe('🪙 Gold');
});

test('the finish marks land with ✱ and explains it in a footnote', () => {
  const finish = sitting2.beats.find((b) => b.id === 's2-finish');
  expect(finish.text.find((l) => l.includes('Land'))).toContain('✱');
  expect(finish.footnote).toMatch(/^✱ /);
});
