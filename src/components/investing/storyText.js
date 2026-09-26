/**
 * storyText — puts the READER'S OWN numbers into the story text (S1)
 * ===========================================================================
 * A sitting file may write placeholders in curly braces:
 *     'Every month {save} goes into the steel cupboard.'
 * and give a `derive(answers)` function that turns the reader's earlier
 * answers into values:
 *     derive: (answers) => ({ save: formatRupees(10000 * (100 - answers['s1-split']) / 100) })
 * The player then shows:  'Every month ₹2,000 goes into the steel cupboard.'
 *
 * Why: a story that repeats YOUR choices back to you ("your ₹2,000 a month")
 * feels like your own life, not a textbook — that's the "glued" feeling.
 *
 * Only text is touched; a beat's `id`/`type` (and option ids) never are.
 * A placeholder with no value is left visible as {name} and logged, so a
 * typo shows up in testing instead of silently vanishing.
 * ===========================================================================
 */

/** ₹ in Indian grouping: 150000 → "₹1,50,000" (rounded to whole rupees). */
export const formatRupees = (amount) => `₹${Math.round(amount).toLocaleString('en-IN')}`;

/** Replace every {name} in one string with vars[name]. */
export const fillText = (text, vars) =>
  text.replace(/\{(\w+)\}/g, (whole, name) => {
    if (Object.prototype.hasOwnProperty.call(vars, name)) return String(vars[name]);
    console.warn(`[InvestingStory] No value for placeholder {${name}} in: "${text}"`);
    return whole;
  });

/**
 * Return a copy of a beat with {placeholders} filled in every text field —
 * strings, arrays of strings, and nested objects (options, items...).
 * Keys named `id` or `type` are left exactly as they are.
 */
export const fillBeat = (value, vars, key) => {
  if (typeof value === 'string') return key === 'id' || key === 'type' ? value : fillText(value, vars);
  if (Array.isArray(value)) return value.map((v) => fillBeat(v, vars));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fillBeat(v, vars, k)]));
  }
  return value; // numbers, booleans, functions stay as they are
};

/**
 * Run a sitting's derive(answers) safely: a bug in one content file must
 * never crash the story — worst case the placeholders stay visible.
 */
export const deriveVars = (sitting, answers) => {
  if (typeof sitting.derive !== 'function') return {};
  try {
    return sitting.derive(answers) || {};
  } catch (e) {
    console.error(`[InvestingStory] ${sitting.id}: derive() failed — placeholders left unfilled.`, e);
    return {};
  }
};
