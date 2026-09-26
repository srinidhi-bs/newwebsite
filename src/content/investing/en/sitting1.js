/**
 * Sitting 1 — "Why invest at all?"  (English)
 * ===========================================================================
 * Walks Srinidhi's notebook map as the reader's own life story (agreed S1
 * plan, 2026-09-26): first salary (Earn) → split it (Spend / Save pie) →
 * why save? → fast-forward to 2026: the shopping basket → the cupboard money
 * shrinks → why (inflation) → the rule → cliffhanger into Sitting 2.
 *
 * NUMBERS & SOURCES — inflation figures below have two sources each; the
 * basket's sources are in the comment above that screen. Full research
 * working: ~/.claude/plans/srinidhibs.com/research/s1_inflation_research.md
 *   CPI_MULTIPLE 4.74 — price level Jan 2000 → Jul 2026, Labour Bureau
 *     CPI-IW 431 (1982=100) linked ×4.63 ×2.88 vs 153.2 (2016=100);
 *     cross-checked with OECD/FRED (4.72×) and World Bank (6.00%/yr).
 *   ≈ 6% a year average inflation (CAGR 6.05%).
 *   RBI's inflation target: 4% (±2%) — flexible inflation targeting since 2016.
 *   The ₹10,000 salary is a made-up round number for the story, not a statistic.
 *
 * HOW A SITTING FILE WORKS
 * ------------------------
 * A sitting is a list of "beats" — one beat = one screen. Types:
 *   'narration' — text (string, or array of paragraphs), optional kicker.
 *   'guess'     — question → reader guesses → answer + reveal.
 *                 input: { kind: 'slider', min, max, step, start, prefix, suffix }
 *                     or { kind: 'options', options: [{ id, label }] }
 *   'choice'    — text + options [{ id, label, consequence }].
 *   'split'     — the spend/save pie (answer = spend %).
 *   'basket'    — old prices → one multiple guess → new prices flip in.
 * Next stays locked on interactive screens until the reader answers.
 *
 * {placeholders} in any text are filled by derive(answers) below — that's
 * how later screens repeat the reader's OWN numbers back to them.
 *
 * Why text lives HERE and not in the page code: a Kannada or Hindi version
 * later is just a translated copy of this file in `kn/` or `hi/`.
 * ===========================================================================
 */
import { formatRupees } from '../../../components/investing/storyText';

// ── Story constants ────────────────────────────────────────────────────────
const SALARY = 10000;        // monthly, Jan 2000 — a story number, not a statistic
const CPI_MULTIPLE = 4.74;   // Jan 2000 → Jul 2026 price level (see header)

const sitting1 = {
  id: 'sitting-1',
  number: 1,
  title: 'Why invest at all?',

  // Reader's answers → the numbers woven into later screens.
  derive: (answers) => {
    const spendPct = answers['s1-split'] !== undefined ? answers['s1-split'] : 80;
    const saveMonthly = (SALARY * (100 - spendPct)) / 100;
    const cupboard = saveMonthly * 12;                 // one year of savings, kept as cash
    return {
      salary: formatRupees(SALARY),
      save: formatRupees(saveMonthly),
      cupboard: formatRupees(cupboard),
      // its 2026 buying power in 2000 rupees — rounded to ₹100: the text says
      // "roughly", and CPI data doesn't support rupee-level precision
      cupboardThen: formatRupees(Math.round(cupboard / CPI_MULTIPLE / 100) * 100),
    };
  },

  beats: [
    // 1 ── Earn ─────────────────────────────────────────────────────────────
    {
      id: 's1-hello',
      type: 'narration',
      kicker: 'JAN 2000',
      text: [
        'It’s January 2000. You’re 28.',
        'Your first real salary has just landed in your account: {salary} a month.',
        'Feels like a lot, doesn’t it?',
      ],
    },

    // 2 ── Spend / Save (the pie from the map) ─────────────────────────────
    {
      id: 's1-split',
      type: 'split',
      kicker: 'JAN 2000',
      question: 'Rent, food, bus fare, a movie now and then… how much of it do you spend?',
      total: SALARY,
      min: 40,
      max: 95,
      step: 5,
      start: 70,
      spendLabel: 'Spend',
      saveLabel: 'Save',
      reveal: 'So {save} a month is left over. Good habit — most people never start.',
    },

    // 3 ── Why save? ───────────────────────────────────────────────────────
    {
      id: 's1-why',
      type: 'choice',
      kicker: 'WHY SAVE?',
      text: 'Why are you saving that {save}? Pick the reason that matters most to you.',
      options: [
        {
          id: 'emergency',
          label: '🚑 For emergencies',
          consequence: 'Smart. A job loss or a hospital bill shouldn’t mean borrowing from anyone.',
        },
        {
          id: 'kids',
          label: '🎓 For my children’s education',
          consequence: 'The reason most Indian families save. School and college fees will matter a lot in this story.',
        },
        {
          id: 'home',
          label: '🏠 To buy a home',
          consequence: 'A big one. A home takes years of saving — so HOW your savings grow matters a lot.',
        },
        {
          id: 'retire',
          label: '🌴 For when I stop working',
          consequence: 'The long game. One day the salary stops, but the bills don’t.',
        },
      ],
    },

    // 4 ── The cupboard ───────────────────────────────────────────────────
    {
      id: 's1-cupboard',
      type: 'narration',
      kicker: 'DEC 2000',
      text: [
        'You’re careful. Every month, {save} goes into the steel cupboard at home.',
        'By the end of the year there’s {cupboard} in there. Safe. Nobody can take it.',
        'You lock it and forget about it.',
      ],
    },

    // 5 ── Fast-forward ───────────────────────────────────────────────────
    {
      id: 's1-ff',
      type: 'narration',
      kicker: 'FAST-FORWARD ▶ SEP 2026',
      text: ['26 years later.', 'Before we open that cupboard, let’s go shopping.'],
    },

    // 6 ── The basket ────────────────────────────────────────────────────
    // Shown to readers WITHOUT cities, dates or a sources list (Srinidhi,
    // 26 Sep 2026: "this is a personal website"). The audit trail stays HERE,
    // for whoever updates these prices next:
    //   Petrol ₹28.94 & LPG ₹223.30 — Delhi, PIB release 9 Nov 2001
    //     https://archive.pib.gov.in/archive/releases98/lyr2001/rnov2001/09112001/r0911200113.html
    //   Petrol ₹102.12 — Delhi, since 25 May 2026 (checked 26 Sep 2026)
    //     https://www.goodreturns.in/petrol-price-in-new-delhi.html
    //   LPG ₹942 — Delhi, from 7 Jun 2026
    //     https://www.tribuneindia.com/news/india/lpg-price-hiked-by-rs-29-per-14-2-kg-cylinder/
    //   Nandini milk ₹13 — 2004-06, worked out from Business Standard 12 Dec 2006
    //     https://www.business-standard.com/article/economy-policy/milk-to-cost-more-in-karnataka-106121201045_1.html
    //   Nandini milk ₹46 — since Apr 2025 (a ₹4-5 hike was pending, Sep 2026)
    //     https://newskarnataka.com/bengaluru/nandini-milk-price-set-to-rise-in-karnataka-rs-4-5-hike-likely/24092026/
    //   BMTC minimum ticket ₹6 — from 5 Jan 2025 (a new hike was under consultation, Sep 2026)
    //     https://www.deccanherald.com/india/karnataka/karnataka-announces-15-hike-in-bus-faresfrom-january-5-3339339
    //   Dosa (₹10-15 → ₹100-150) and the 2000 bus fare (₹1.50-2): Srinidhi's memory.
    // Ranges: maths uses old-price UPPER end, new-price LOWER end (never
    // overstates the rise). Basket multiple = 1,196.12 / 282.24 ≈ 4.2×.
    {
      id: 's1-basket',
      type: 'basket',
      kicker: 'SEP 2026',
      question: 'Here’s what these cost back then. How many times costlier is the whole basket today?',
      thenLabel: '2000',
      nowLabel: '2026',
      totalLabel: 'Whole basket',
      items: [
        { icon: '⛽', label: 'Petrol, 1 litre', then: 28.94, now: 102.12 },
        { icon: '🔥', label: 'Cooking gas cylinder', then: 223.30, now: 942 },
        { icon: '🥛', label: 'Nandini milk, 1 litre', then: 13, now: 46 },
        { icon: '🥞', label: 'Masala dosa', then: 15, thenText: '₹10–15', now: 100, nowText: '₹100–150' },
        { icon: '🚌', label: 'BMTC bus, minimum ticket', then: 2, thenText: '₹1.50–2', now: 6 },
      ],
      input: { min: 1, max: 10, step: 0.5, start: 2, prefix: '', suffix: '×' },
      reveal: [
        'Nothing on this list changed. Same dosa, same litre of milk. Only the price tag did.',
        'Across the whole basket: about 4 times costlier — close to India’s official figure of about 4.7 times since 2000.',
      ],
    },

    // 7 ── The cupboard money shrinks ─────────────────────────────────────
    {
      id: 's1-shrink',
      type: 'guess',
      kicker: 'SEP 2026',
      question: 'Now open the cupboard. Your {cupboard} is still there — every note. How much of its buying power is left?',
      input: { kind: 'slider', min: 0, max: 100, step: 5, start: 80, prefix: '', suffix: '%' },
      answer: 21,
      reveal: [
        'Only about a fifth. Your {cupboard} today buys roughly what {cupboardThen} bought in 2000.',
        'You didn’t spend a rupee. Nobody stole anything. And yet nearly 80% of its value is gone.',
      ],
    },

    // 8 ── Why? Inflation ─────────────────────────────────────────────────
    {
      id: 's1-inflation',
      type: 'narration',
      kicker: 'WHAT HAPPENED?',
      text: [
        'This has a name: inflation. Prices creep up a little almost every year.',
        'Since 2000, prices in India have gone up by about 6% a year on average. It doesn’t sound like much — but it adds up to prices almost 5 times higher.',
        'Even the Reserve Bank of India doesn’t aim for zero. Its target is about 4% a year. Rising prices are normal — so money that just sits still is slowly shrinking.',
      ],
    },

    // 9 ── The rule ───────────────────────────────────────────────────────
    {
      id: 's1-rule',
      type: 'narration',
      kicker: 'THE RULE',
      text: [
        'So saving is only step one.',
        'Step two: your savings have to GROW faster than prices rise — every single year.',
        'If they grow slower than that, you are getting poorer, even while the number in your cupboard stays exactly the same.',
      ],
    },

    // 10 ── Cliffhanger into Sitting 2 ────────────────────────────────────
    {
      id: 's1-cliffhanger',
      type: 'narration',
      kicker: 'NEXT ▶',
      text: [
        'So where should your money live?',
        'A savings account? A fixed deposit? Gold? Land? Shares?',
        'Let’s find out which ones actually beat that 6%.',
      ],
    },
  ],
};

export default sitting1;
