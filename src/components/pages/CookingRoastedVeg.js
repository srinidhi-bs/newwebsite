/**
 * CookingRoastedVeg.js — the roasted vegetables + khichdi recipe page.
 * Route: /cooking/roasted-veg
 *
 * My first proper solo cook (the day before the pizza): steam-then-roast mixed
 * vegetables, served with khichdi. The core technique the whole cooking habit is
 * built on — steam to 70-80%, then roast hot for golden edges.
 *
 * Layout/mechanics come from components/cooking/RecipeBits.js; this file just
 * supplies the content. Photos live in /public/images/cooking/s1_*.jpg.
 */

import React from 'react';
import PageWrapper from '../layout/PageWrapper';
import SEO from '../common/SEO';
import {
  RecipeHero,
  Section,
  Callout,
  Aside,
  FancyMenu,
  IngredientTable,
  BulletList,
  MethodSteps,
} from '../cooking/RecipeBits';

const IMG = '/images/cooking';

// ── Photos, grouped by stage ─────────────────────────────────────────────────
const prepPhotos = [
  { src: `${IMG}/s1_01_cauliflower_first_cut.jpg`, alt: 'Cauliflower, first uneven cut', caption: 'First cut: enthusiastic, uneven.' },
  { src: `${IMG}/s1_02_cauliflower_even_spread.jpg`, alt: 'Cauliflower re-cut and spread evenly', caption: 'Take two. Turns out size matters.' },
  { src: `${IMG}/s1_03_cauliflower_florets.jpg`, alt: 'Cauliflower florets with stems separated', caption: 'Florets sorted; the slower-cooking stems sent to their own corner.' },
  { src: `${IMG}/s1_04_cauliflower_stems.jpg`, alt: 'Cauliflower stems chopped small', caption: 'Stems chopped small so they can keep up.' },
  { src: `${IMG}/s1_05_broccoli_florets.jpg`, alt: 'Broccoli florets cut', caption: 'Broccoli, broken down.' },
  { src: `${IMG}/s1_06_broccoli_stalk_leaves.jpg`, alt: 'Broccoli main stalk and leaves', caption: 'The thick stalk and leaves. I almost binned the stalk — hold that thought.' },
  { src: `${IMG}/s1_07_carrot_beans.jpg`, alt: 'Cut carrot rounds and bean pieces', caption: 'Carrots in coins, beans in batons.' },
  { src: `${IMG}/s1_08_tray_fit_check.jpg`, alt: 'Raw vegetables laid out on the OTG tray', caption: 'The fit check — everything in one layer, nobody overlapping.' },
];
const steamPhotos = [
  { src: `${IMG}/s1_09_steamer_stage1.jpg`, alt: 'The two-pot steamer', caption: 'The trusty two-pot steamer — water below, veg above.' },
  { src: `${IMG}/s1_10_steaming_in_progress.jpg`, alt: 'Steaming in progress', caption: 'Lid on, steam building. The patient bit.' },
  { src: `${IMG}/s1_11_steamed_done.jpg`, alt: 'Steamed vegetables done to 70-80%', caption: 'Steamed to 70-80% — still bright, still with a bit of bite.' },
];
const roastPhotos = [
  { src: `${IMG}/s1_12_ready_for_roasting.jpg`, alt: 'Seasoned vegetables ready to roast', caption: 'Tossed in ghee and spices, raw onion in, ready for the OTG.' },
  { src: `${IMG}/s1_13_roasting_in_otg.jpg`, alt: 'Vegetables roasting in the OTG', caption: 'Into the OTG at 200°C. Now we wait — and keep one eye on the parchment.' },
  { src: `${IMG}/s1_14_final_roasted_veg_tray.jpg`, alt: 'Final roasted vegetables on the tray', caption: 'Golden cauliflower, charred broccoli tips, crisp beans, soft sweet onion.' },
];
const platedPhotos = [
  { src: `${IMG}/s1_15_final_with_khichdi.jpg`, alt: 'Roasted vegetables served with khichdi', caption: 'Served with khichdi. Plates wiped clean.' },
];

const atAGlance = [
  'My first proper solo cook',
  'Method: steam → roast',
  'Difficulty: beginner-friendly',
  'Verdict: plates wiped clean',
];

// ── Ingredients ──────────────────────────────────────────────────────────────
const vegList = [
  'Cauliflower — even florets; stems chopped small',
  'Broccoli — florets + the peeled inner stalk (keep it!)',
  'Carrot — thick rounds',
  'French beans — 1–1.5 inch pieces',
  'Onion — thick wedges (raw, straight to the tray)',
  'Khichdi to serve alongside, made separately',
];

const seasoningColumns = [
  { key: 'item', label: 'For ~3–4 cups of veg' },
  { key: 'amount', label: 'Amount' },
];
const seasoning = [
  { item: 'Ghee (melted)', amount: '1–2 tbsp' },
  { item: 'Salt', amount: '¾–1 tsp' },
  { item: 'Turmeric', amount: '¼ tsp' },
  { item: 'Red chilli powder', amount: '½–1 tsp' },
  { item: 'Black pepper', amount: '½ tsp' },
  { item: 'Garam masala', amount: '¼–½ tsp' },
];

// ── Method ───────────────────────────────────────────────────────────────────
const method = [
  {
    stage: 'Stage 1 · Prep & clean',
    steps: [
      { do: 'Wash the vegetables BEFORE cutting, then drain and pat them really dry.', why: 'Cutting first then washing loses more nutrients and traps water in the pieces — and wet veg steams in the oven instead of roasting.' },
      { do: 'Cut everything to an even size, and separate the dense stems from the softer florets.', why: 'Even pieces cook at the same rate; stems are denser and need a head start.' },
      { do: 'Peel the tough skin off the broccoli stalk and chop the sweet inner core small — keep it.', why: 'Roasted, that core caramelises into the best bite of the whole dish.' },
    ],
  },
  {
    stage: 'Stage 2 · Steam to 70–80%',
    steps: [
      { do: 'Bring 3–4 cm of water to a rolling boil in the base pot — it shouldn’t touch the top pot.', why: '' },
      { do: 'Steam the dense items first — stems, carrot, beans — for 3–4 minutes.', why: 'They cook slower, so they get a head start.' },
      { do: 'Add the florets on top and steam another 5–6 minutes, to 70–80% done (a fork meets slight resistance).', why: 'Broccoli cooks fastest, so judge by it. You want part-cooked, not soft — the oven finishes the job.' },
    ],
  },
  {
    stage: 'Stage 3 · Season',
    steps: [
      { do: 'Toss the steamed veg with melted ghee and the spices, and mix in the raw onion wedges.', why: 'Ghee browns beautifully and has a high smoke point; the onion isn’t steamed — it roasts from raw.' },
    ],
  },
  {
    stage: 'Stage 4 · Roast (OTG, ~200°C)',
    steps: [
      { do: 'Spread in a single layer (use two trays if crowded) and roast at ~200°C, tossing once halfway, until the edges are golden.', why: 'Crowding makes them steam; judge doneness by colour, not the clock.' },
      { do: 'Push the browning with top-heat / grill for the last few minutes.', why: '' },
    ],
  },
];

const lessons = [
  'Drain cut veg before they meet heat. I rewashed the beans and carrots after cutting (I’d already washed them once) and didn’t dry them — the trapped water had to boil off before browning could start, so the roast took ~25–30 min instead of 12–15.',
  'Keep parchment inside the tray edges. An overhanging corner drooped near the hot lower rod — a fire risk. Tuck it in or trim it.',
  'Store leftover cut veg dry. Sealed away slightly wet, they sweat and spoil; pat them dry and tuck a paper towel into the container.',
];

const CookingRoastedVeg = () => {
  return (
    <PageWrapper>
      <SEO routeKey="/cooking/roasted-veg" />

      {/* ─── Heading + intro ──────────────────────────────────────────── */}
      <RecipeHero
        title="Roasted Veg + Khichdi"
        subtitle="My very first solo cook — and the technique everything else is built on."
        facts={atAGlance}
      >
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          Honestly, this wasn't really about the food. I'm learning to cook — and, more than that,
          trying to build a little discipline by actually <em>finishing</em> things, one small task at
          a time. So one day I decided to make myself a proper meal, start to finish, no shortcuts. A
          small proof to myself that I could.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          Before the ambitious pizza, there was this: a tray of mixed vegetables, steamed and then
          roasted, served with a simple khichdi. My first time cooking a proper meal solo, start to
          finish — including the washing up.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          The big idea here is <strong>steam, then roast</strong>: steaming keeps the vitamins in the
          vegetable (boiling leaches them into the water), and a hot oven afterwards gives you those
          golden, caramelised edges. It's the method I now use for almost everything. 🥘
        </p>
      </RecipeHero>

      {/* ─── The prep ─────────────────────────────────────────────────── */}
      <Section title="The prep" photos={prepPhotos}>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          My first solo cook, so naturally I opened by chopping the cauliflower into wildly uneven
          pieces. Re-cut — much better; even florets cook evenly. I separated the denser stems (they
          cook slower) and chopped them small, did the broccoli, and cut carrots into thick rounds
          and beans into short pieces. A quick fit-check on the tray to make sure it all sat in a
          single layer.
        </p>
        <Aside>
          What went through my head, staring at that first lopsided batch: do I start over, or just
          send it? (I started over. Small win.)
        </Aside>
      </Section>

      {/* ─── Steaming ─────────────────────────────────────────────────── */}
      <Section title="Steaming, not boiling" photos={steamPhotos}>
        <Aside>The thing I kept second-guessing: how cooked is cooked enough — without tipping over into mush?</Aside>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Into the two-pot steamer: a rolling boil in the base, the dense bits first, then the
          florets on top. The goal is only <strong>70–80% cooked</strong> — still bright and a little
          firm. The oven does the rest, so there's no point steaming them soft.
        </p>
      </Section>

      {/* ─── Season & roast ───────────────────────────────────────────── */}
      <Section title="Season and roast" photos={roastPhotos}>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Tossed in melted ghee (nuttier than oil, and it browns better) with salt, turmeric, chilli,
          pepper and a little garam masala, with raw onion wedges mixed in. Then into the OTG at
          200°C until golden. It took longer than it should have — there's a lesson in that below.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          Then, a small scare. Mid-roast I glance in and a corner of the parchment has drooped down
          toward the glowing lower element — too close. For a second I just stare at it, realising
          this is exactly how kitchen fires start. Everything stops. I open the oven, tuck the paper
          back well inside the tray edges, and exhale. Crisis averted; pulse, less so.
        </p>
      </Section>

      {/* ─── Plated ───────────────────────────────────────────────────── */}
      <Section title="Plated" photos={platedPhotos}>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Served alongside a simple khichdi. First proper solo meal, done start to finish — and the
          plates were wiped clean.
        </p>
        <Aside>
          And the big one, from back at the chopping board: that fat broccoli stalk — bin it, or is
          there something hiding in there?
        </Aside>
        <Callout>
          <strong>The surprise of the day:</strong> that humble broccoli stalk, peeled and roasted,
          was the single tastiest bite — mildly sweet, deeply savoury, caramelised by the ghee. It
          nearly went in the bin. Never bin the stalk again.
        </Callout>
      </Section>

      {/* ─── The 5-star menu version (comedy) ─────────────────────────── */}
      <FancyMenu
        subtitle="(Best read aloud in your poshest voice. In reality: lunch, off a steel plate.)"
        credit="— Executive Chef, Head of Plating & Sole Dishwasher: me."
      >
        Flame-roasted heirloom vegetables, ghee-glazed and spice-laced, presented alongside an
        artisanal cumin-tempered khichdi of rice and lentils. Rustic wholesomeness, elevated — and
        handcrafted from first cut to final plate.
      </FancyMenu>

      {/* ─── The full recipe ──────────────────────────────────────────── */}
      <Section title="The full recipe">
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          More of a method than a strict recipe — it works for most firm vegetables.
        </p>

        <BulletList heading="The vegetables" items={vegList} />

        <IngredientTable
          heading="Ghee + spice mix"
          columns={seasoningColumns}
          rows={seasoning}
          note="Under-season to start and adjust after roasting. Chaat masala or a squeeze of lemon are best added after the oven, not before."
        />

        <MethodSteps method={method} />
      </Section>

      {/* ─── Lessons ──────────────────────────────────────────────────── */}
      <Section title="What I learned">
        <BulletList items={lessons} />
      </Section>

      {/* ─── Closing — end on the feeling, not the method ─────────────── */}
      <Section title="And then I sat down to eat">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Here's the part that stayed with me. I sat down to a plate of vegetables I'd taken from raw
          to golden, and a khichdi I'd cooked myself, start to finish — and it was just… good. Not
          restaurant-good. <em>Mine</em>-good. An ordinary little meal that somehow felt like proof of
          something: that I could start a thing and actually finish it, properly. I went back for
          seconds.
        </p>
      </Section>
    </PageWrapper>
  );
};

export default CookingRoastedVeg;
