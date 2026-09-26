/**
 * The running order of "Investing, from zero" (English) + the words drawn
 * on the level map.
 * ===========================================================================
 * The level map is a redrawing of Srinidhi's own notebook sketch:
 *   Me → Earn → Spend / Save → Why? → Where? → (red curve) Equity branch
 * Each sitting "owns" a part of that drawing; tapping the part plays it.
 *
 * Sittings 2-7 are STUBS (beats: []) — the map shows them as "coming soon".
 * Their content is written, one per session, together with Srinidhi.
 * Titles here are the working titles from the design doc; change freely.
 *
 * mapLabel / mapSub = the handwritten words for sittings 3-7 on the map.
 * (Sittings 1-2 are drawn as the Me/Earn/pie and Where? list — their words
 * are in `mapWords` below.)
 * ===========================================================================
 */
import sitting1 from './sitting1';

// A not-yet-written sitting: has a place on the map, nothing to play.
const stub = (number, title, mapLabel, mapSub) => ({
  id: `sitting-${number}`,
  number,
  title,
  mapLabel,
  mapSub,
  beats: [],
});

const sittings = [
  sitting1,
  stub(2, 'Where can money live?'),
  stub(3, 'What is a share?', 'What is a share?', 'Company → Shares → Stock market'),
  stub(4, 'What moves prices?', 'What moves prices?', 'Demand & supply · vs an FD'),
  stub(5, 'Mutual funds', 'Mutual funds', 'How safe? · Large / Mid / Small'),
  stub(6, 'The ride', 'The ride', 'Crashes · 25 years of returns'),
  stub(7, 'Your plan', 'How much?', 'Allocation · Diversification · Time'),
];

// Words for the drawn top half of the map (sittings 1 and 2).
export const mapWords = {
  me: 'Me',
  earn: 'Earn',
  spend: 'Spend',
  save: 'Save',
  why: 'Why?',
  where: 'Where?',
  whereList: ['Cash', 'Savings a/c', 'FD · Debt', 'Equity', 'Gold · Real estate'],
  equityIndex: 3, // which whereList item gets the red circle (as in the notes)
};

export default sittings;
