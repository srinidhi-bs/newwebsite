/**
 * Sitting 2 — "Where can money live?"  (English)
 * ===========================================================================
 * Agreed S2 plan (Srinidhi, 2026-09-28, "the race", + his review rounds):
 * ₹1 lakh in 2000 → the line to beat (₹4.7 lakh just to keep up) → your
 * options (seven places) → bet on a winner → guess the FD → the race to
 * 2026 against a "Prices" marker → the finish (land ✱ footnote) → the land
 * story → the FD's tax → stop the clock in 2023 → the bumpy road → the
 * three-way catch → FD vs shares → cliffhanger into Sitting 3.
 * Debt funds are left out on purpose (they're mutual funds → Sitting 5).
 *
 * NUMBERS & SOURCES (reader pages show none of this — agreed rule; the
 * audit trail lives here). Full working, two sources per figure and a
 * dual-review cross-check (§13):
 *   ~/.claude/plans/srinidhibs.com/research/s2_where_money_lives_research.md
 *   ~/.claude/plans/srinidhibs.com/research/s2_gold_yearly.md
 *   ~/.claude/plans/srinidhibs.com/research/s2_land_jpnagar.md
 * Race values = what ₹1 had become at the start of each year 2000…2025, and
 * on 25 Sep 2026 for the last point (labelled 2026). Generated from the
 * researched rates by the model in the research file (recomputed
 * independently, S52):
 *   Savings a/c — SBI SB rate path 4.5% → 2.5%, credited half-yearly. 2.50× (3.5%/yr)
 *   FD          — SBI 1-yr retail rate on each 1 Jan, quarterly compounding. 6.49× pre-tax (7.25%/yr)
 *                 after tax on each year's interest: 20% → 4.51×, 30% → 3.76× (illustration)
 *   PPF         — official rate history 12% → 7.1%, credited 31 Mar, tax-free. 8.05× (8.1%/yr)
 *   Gold        — 31-March 995 prices each year (KKH / TaxGuru, IBJA-cross-checked),
 *                 ₹4,380 (2000) → ₹1,51,504 (Sep 2026). 34.6× (14.2%/yr). Gold points are
 *                 31 Mar, the others 1 Jan — a quarter's offset, invisible at this scale.
 *   Shares      — Srinidhi's choice (2026-09-28): ⅓ Nifty 50 + ⅓ Nifty Midcap 150 +
 *                 ⅓ Nifty Smallcap 250, TOTAL RETURN indices (dividends reinvested),
 *                 SPLIT ONCE AND NEVER REBALANCED. Midcap 150 / Smallcap 250 only exist
 *                 from 1 Apr 2005, so: Nifty 50 TRI alone Jan 2000 → 31 Mar 2005 (1.537×),
 *                 then split into thirds. Mid/small did very well in 2003-05, so the late
 *                 start UNDERSTATES shares slightly (the conservative side).
 *                 Result 34.06× ≈ ₹34 lakh (14.1%/yr). Nifty 50 alone would be 22.5×.
 *                 Data + chain check vs NSE since-inception CAGRs:
 *                 ~/.claude/plans/srinidhibs.com/research/s2_mid_small_tri.md
 *                 2026 = TRI YTD to 31 Aug + Sep price move to 25 Sep (no Sep TRI level).
 *                 Falls: 2008 — Nifty 50 −60%, Midcap −72%, Smallcap −73…−76% (mix: yearly
 *                 points −62%, peak-to-trough deeper → "nearly two-thirds"); 2020 Covid —
 *                 −38%, −39%, −44% (mix ≈ −40%).
 *                 End-2023: shares 26.8× vs gold ≈ 15.3× (Mar 2024) → the "stop the clock" screen.
 *   Prices      — CPI-IW 4.74× (S1). Line drawn as a smooth 6.05%/yr path ending at 4.74
 *                 (DERIVED shape for the animation; the endpoint is the official figure).
 *   Land        — Srinidhi's family: a 30×40 site in J P Nagar 8th Phase, Bengaluru, bought
 *                 PRIVATELY (not a BDA allotment) in 2001 as a B-khata site for ≈ ₹1.2 lakh
 *                 (≈ ₹100/sq ft — the family's own purchase is the source; no 2001 market
 *                 rate exists online); recently converted to A-khata; ≈ ₹1.8 crore now
 *                 (≈ ₹15,000/sq ft — Phase 8 A-khata listings ₹14,000–16,500/sq ft on
 *                 99acres / NoBroker, Sep 2026 ✓) → 150× (≈22%/yr over 25 years). Part of
 *                 the gain is the area developing + the khata being regularised. Shown
 *                 ANONYMOUSLY ("a family in Bengaluru"); the locality must NOT appear on
 *                 the page (Srinidhi's call, 2026-09-28 — the one deliberate exception to
 *                 the no-city-names rule is naming Bengaluru). Cross-check: research file.
 *   Deposit insurance — DICGC ₹5 lakh per depositor per bank (since Feb 2020).
 * ===========================================================================
 */

// Labels for the race's year counter: 2000 … 2026 (27 points)
const YEARS = Array.from({ length: 27 }, (_, i) => String(2000 + i));

// What ₹1 had become — one value per YEARS label (see header for the model)
const SERIES = {
  cash: YEARS.map(() => 1),
  savings: [1.0, 1.042, 1.084, 1.128, 1.168, 1.21, 1.252, 1.296, 1.342, 1.39, 1.439, 1.489, 1.547,
    1.61, 1.675, 1.742, 1.813, 1.886, 1.958, 2.027, 2.093, 2.152, 2.21, 2.271, 2.332, 2.396, 2.503],
  fd: [1.0, 1.093, 1.189, 1.284, 1.363, 1.432, 1.512, 1.597, 1.721, 1.867, 2.031, 2.155, 2.327,
    2.55, 2.774, 3.032, 3.298, 3.544, 3.795, 4.038, 4.319, 4.596, 4.825, 5.071, 5.422, 5.8, 6.493],
  ppf: [1.0, 1.113, 1.221, 1.332, 1.441, 1.556, 1.681, 1.815, 1.96, 2.117, 2.286, 2.469, 2.668,
    2.902, 3.155, 3.43, 3.728, 4.034, 4.352, 4.687, 5.06, 5.428, 5.814, 6.226, 6.669, 7.142, 8.046],
  gold: [1.0, 0.957, 1.144, 1.212, 1.385, 1.411, 1.938, 2.145, 2.768, 3.449, 3.726, 4.743, 6.402,
    6.76, 6.5, 5.992, 6.47, 6.61, 7.005, 7.224, 9.817, 10.049, 11.707, 13.587, 15.293, 20.276, 34.59],
  // ⅓ large + ⅓ mid + ⅓ small from Apr 2005, split once (see header)
  shares: [1.0, 0.866, 0.736, 0.775, 1.369, 1.547, 2.247, 3.018, 5.365, 2.022, 4.066, 4.835, 3.386,
    4.682, 4.694, 7.245, 7.692, 8.005, 11.945, 10.369, 10.59, 12.98, 18.857, 19.281, 26.847, 32.686, 34.064],
  prices: [1.0, 1.06, 1.123, 1.191, 1.262, 1.338, 1.418, 1.503, 1.593, 1.689, 1.79, 1.897, 2.011,
    2.131, 2.259, 2.394, 2.538, 2.69, 2.851, 3.022, 3.203, 3.395, 3.599, 3.815, 4.043, 4.286, 4.74],
};
const LAND_MULTIPLE = 150; // ₹1.2 lakh (2001) → ₹1.8 crore (now), family example

// The seven places — one list feeds the options screen, the bet (with each
// place's short description, Srinidhi's review 2026-09-28), the race and
// the names in text
const PLACES = [
  { id: 'cash', icon: '🗄️', label: 'Steel cupboard', color: 'stone', note: 'cash at home' },
  { id: 'savings', icon: '🏦', label: 'Savings account', color: 'sky', note: 'in the bank, take it out any time' },
  { id: 'fd', icon: '📜', label: 'Fixed deposit', color: 'teal', note: 'lend it to the bank for a year, renew it every year' },
  { id: 'ppf', icon: '🔒', label: 'PPF', color: 'indigo', note: 'a government savings scheme, locked for 15 years' },
  { id: 'gold', icon: '🪙', label: 'Gold', color: 'amber', note: 'bought as gold, kept in the locker' },
  { id: 'shares', icon: '📈', label: 'Shares', color: 'rose', note: 'small pieces of India’s top companies: one-third big, one-third mid-sized, one-third small' },
  { id: 'land', icon: '🏠', label: 'Land', color: 'emerald', note: 'a small residential site' },
];

const sitting2 = {
  id: 'sitting-2',
  number: 2,
  title: 'Where can money live?',

  // The reader's bet, named back to them on the finish screen
  derive: (answers) => {
    const pick = PLACES.find((p) => p.id === answers['s2-bet']);
    return { pick: pick ? `${pick.icon} ${pick.label}` : 'a winner' };
  },

  beats: [
    {
      id: 's2-hello',
      type: 'narration',
      kicker: 'JAN 2000',
      text: [
        'Back to January 2000. You’re 28 again.',
        'This time, imagine you have ₹1 lakh — and seven different places to keep it.',
        'We’ll put ₹1 lakh in EACH place, lock them all, and fast-forward to today.',
      ],
    },

    {
      // Srinidhi's S2 review (2026-09-28): the ₹4.7 lakh "prices line" was
      // used on the finish screen without being introduced — set it up here.
      // 4.74× = CPI-IW Jan 2000 → Jul 2026 (Sitting 1 research).
      id: 's2-line',
      type: 'narration',
      kicker: 'THE LINE TO BEAT',
      text: [
        'Remember Sitting 1? Since 2000, prices in India have gone up about 4.7 times.',
        'So ₹1 lakh in 2000 has to grow to about ₹4.7 lakh today — just to buy the same things it bought then.',
        'That ₹4.7 lakh is the line every option has to beat. Finish below it, and your money bought less than when you started.',
      ],
    },

    {
      id: 's2-runners',
      type: 'narration',
      kicker: 'YOUR OPTIONS ARE',
      text: PLACES.map((p) => `${p.icon} ${p.label} — ${p.note}.`),
    },

    {
      id: 's2-bet',
      type: 'choice',
      kicker: 'YOUR BET',
      text: 'Before the race: which one do you think finishes first?',
      options: PLACES.map((p) => ({
        id: p.id,
        label: `${p.icon} ${p.label}`,
        note: p.note,
        consequence: 'Noted. Let’s see if you’re right.',
      })),
    },

    {
      id: 's2-fd',
      type: 'guess',
      kicker: 'YOUR FD',
      question: 'The one most people know: ₹1 lakh in a fixed deposit in 2000, renewed every year for 26 years. What is it worth today?',
      input: { kind: 'slider', min: 1, max: 10, step: 0.5, start: 3, prefix: '₹', suffix: ' lakh' },
      answer: 6.5,
      reveal: 'About ₹6.5 lakh. Safe and steady — now let’s see how it did against everything else.',
    },

    {
      id: 's2-race',
      type: 'race',
      kicker: '2000 ▶ 2026',
      text: 'The dashed line is prices. To just stand still, your money had to keep up with it.',
      labels: YEARS,
      scaleMax: 35,
      priceLine: { label: 'Prices', values: SERIES.prices },
      runners: PLACES.map((p) =>
        p.id === 'land'
          ? { ...p, finalOnly: LAND_MULTIPLE, note: 'No price until you sell' }
          : { ...p, values: SERIES[p.id] }
      ),
      // Each note shows from its year until the next note's year
      events: [
        { at: '2001', text: 'Shares start badly — down for two years.' },
        { at: '2004', text: 'Shares take off.' },
        { at: '2009', text: 'Crash of 2008! Shares lose nearly two-thirds.' },
        { at: '2010', text: '…and bounce back within a year.' },
        { at: '2014', text: 'Gold goes nowhere for six years.' },
        { at: '2020', text: 'Covid — shares fall about 40% in weeks, then recover.' },
        { at: '2025', text: 'Gold starts a huge run.' },
      ],
      reveal: 'Land, gold and shares ran away with it. The cupboard and the savings account never even reached the prices line.',
    },

    {
      id: 's2-finish',
      type: 'narration',
      kicker: 'THE FINISH',
      text: [
        // One place per line (Srinidhi's review, 2026-09-28)
        '🏠 Land ≈ ₹1.5 crore ✱',
        '🪙 Gold ≈ ₹35 lakh',
        '📈 Shares ≈ ₹34 lakh',
        '🔒 PPF ≈ ₹8 lakh',
        '📜 FD ≈ ₹6.5 lakh',
        '🏦 Savings account ≈ ₹2.5 lakh',
        '🗄️ Steel cupboard: ₹1 lakh',
        'You bet on {pick}.',
        'Remember: just to STAND STILL, your ₹1 lakh had to become about ₹4.7 lakh. Anything below that got poorer.',
      ],
      // Srinidhi's review (2026-09-28): a big asterisk on land + 5 factors
      footnote: '✱ One real site, not an average. Land prices depend on many things — the location, roads and metro nearby, whether the papers are approved, how fast the area develops, and the plot’s size and road width. Another site could have grown far less.',
    },

    {
      id: 's2-land',
      type: 'narration',
      kicker: 'THE LAND STORY',
      text: [
        'A real example: a family in Bengaluru bought a 30×40 site in 2001 for about ₹1.2 lakh. Back then it was on the edge of the city, and the site’s papers weren’t fully approved yet.',
        'Today the area is part of the city, the papers have been regularised, and the site is worth about ₹1.8 crore — around 150 times.',
        'But be careful with that number. Much of the jump came from the area growing and the paperwork being cleared — a gamble that could just as easily have gone the other way. Land prices, and how fast they rise, differ hugely from one area to the next and one town to the next.',
        'And land has no price until you sell. Selling takes months, buying costs registration fees, and a vacant site earns nothing while it waits.',
      ],
    },

    {
      id: 's2-fd-tax',
      type: 'narration',
      kicker: 'THE FD’S HIDDEN COST',
      text: [
        'FD interest is taxed every year, at your income-tax rate.',
        'After tax, that ₹6.5 lakh is more like ₹3.8–4.5 lakh — below the ₹4.7 lakh needed to keep up.',
        'The “safe” choice quietly lost ground. PPF’s interest is tax-free — that’s why it stayed ahead.',
      ],
    },

    {
      id: 's2-stop-clock',
      type: 'narration',
      kicker: 'STOP THE CLOCK',
      text: [
        'Gold and shares finished almost neck and neck. But look closer.',
        'At the end of 2023, shares were far ahead — about ₹27 lakh against gold’s ₹15 lakh. Gold caught up only in a huge run over the last two years.',
        'Who “wins” depends on WHEN you look. Anyone who tells you one of them always wins is guessing.',
      ],
    },

    {
      id: 's2-bumpy',
      type: 'narration',
      kicker: 'THE BUMPY ROAD',
      text: [
        'Shares didn’t get there smoothly. In 2008 they lost nearly two-thirds of their value. In 2020, about 40% in a few weeks. Mid-sized and small companies fall harder than big ones.',
        'Whoever panicked and sold at the bottom locked in the loss. Whoever waited got it all back — and more.',
        'We’ll ride these crashes properly in Sitting 6.',
      ],
    },

    {
      id: 's2-catch',
      type: 'compare',
      kicker: 'THE CATCH',
      text: 'Growth isn’t everything. Ask three questions of every place:',
      columns: [
        { key: 'grow', label: 'Beat prices?' },
        { key: 'safe', label: 'How safe?' },
        { key: 'access', label: 'Money back' },
      ],
      rows: [
        { icon: '🗄️', label: 'Steel cupboard', grow: '❌ Lost ~80%', safe: 'Theft, fire', access: 'Instantly' },
        { icon: '🏦', label: 'Savings account', grow: '❌ No', safe: 'Very safe*', access: 'Any time' },
        { icon: '📜', label: 'Fixed deposit', grow: '⚠️ Not after tax', safe: 'Very safe*', access: 'At maturity' },
        { icon: '🔒', label: 'PPF', grow: '✅ Yes, tax-free', safe: 'Very safe (government)', access: 'Locked 15 years' },
        { icon: '🪙', label: 'Gold', grow: '✅ Yes, in spurts', safe: 'Price swings', access: 'Easy to sell' },
        { icon: '📈', label: 'Shares', grow: '✅ Yes, over long spans', safe: 'Can fall by half or more', access: '2–3 working days' },
        { icon: '🏠', label: 'Land', grow: '✅ Depends on the area', safe: 'Title & legal risks', access: 'Months to sell' },
      ],
      footer: 'No option is high-growth, very safe AND instantly available — every choice gives up one to get the others. (*Bank deposits are insured up to ₹5 lakh per person, per bank.)',
    },

    {
      id: 's2-fd-vs-shares',
      type: 'narration',
      kicker: 'FD vs SHARES',
      text: [
        'An FD is a LOAN you give the bank. The bank promises your money back, plus a fixed interest.',
        'A share is OWNERSHIP — a small piece of a business. There’s no promise. You share in its good years and its bad ones.',
        'That’s why shares swing — and why, over long stretches, they have grown faster.',
      ],
    },

    {
      id: 's2-cliffhanger',
      type: 'narration',
      kicker: 'NEXT ▶',
      text: [
        'So what exactly IS a share?',
        'Who decides its price? And why would a company sell pieces of itself to you?',
      ],
    },
  ],
};

export default sitting2;
