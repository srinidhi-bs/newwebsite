/**
 * CookingSoyaKurma.js — the soya chunk & green peas coconut kurma recipe page.
 * Route: /cooking/soya-kurma
 *
 * A first-person, illustrated story of a lunch built around a missing ingredient:
 * there were no tomatoes in the house, so the whole dish pivoted to a roasted
 * coconut base instead — dry-roasted whole spices, roasted fresh coconut and
 * cashew ground smooth, with rajamudi rice alongside.
 *
 * Layout/mechanics come from components/cooking/RecipeBits.js; this file just
 * supplies the content (prose, photos, ingredient numbers, method).
 *
 * Photos live in /public/images/cooking/s3_*.jpg (already resized + EXIF-baked).
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

// ── Photos, grouped by stage (with short, fun captions) ──────────────────────
const haulPhotos = [
  { src: `${IMG}/s3_14_mise_en_place.jpg`, alt: 'Everything chopped and laid out on the board', caption: 'Everything cut before the stove got involved. The one habit that has actually made me a better cook.' },
  { src: `${IMG}/s3_01_rajamudi_measured.jpg`, alt: 'Rajamudi rice measured in a cup', caption: 'Rajamudi — a Karnataka heirloom rice. Note the pale insides with red streaks. That detail nearly ruined lunch.' },
];
const soyaPhotos = [
  { src: `${IMG}/s3_10_soya_drained_colander.jpg`, alt: 'Boiled soya chunks draining in a colander', caption: 'Boiled 5 minutes in salted, turmeric-tinted water. They tripled in size.' },
  { src: `${IMG}/s3_11_soya_squeezed_dry_plate.jpg`, alt: 'Squeezed soya chunks spread on a dry plate', caption: 'Squeezed dry, three times over, and left on a dry plate. Never back into water.' },
  { src: `${IMG}/s3_23_soya_browned.jpg`, alt: 'Soya chunks browned in ghee', caption: 'Then browned in ghee before they ever met the gravy.' },
];
const masalaPhotos = [
  { src: `${IMG}/s3_16_whole_spices_assembled.jpg`, alt: 'Whole spices assembled on a plate', caption: 'Coriander seeds, cumin, peppercorns, cinnamon, one dried red chilli — deseeded, because I am a coward about heat.' },
  { src: `${IMG}/s3_17_spices_dry_roasting.jpg`, alt: 'Whole spices dry-roasting in a pan', caption: 'Dry pan, no oil, low flame. Spices first — they need a head start.' },
  { src: `${IMG}/s3_20_coconut_underroasted.jpg`, alt: 'Coconut still white in the pan, under-roasted', caption: 'Coconut in, and… I switched the gas off here. Still white. Too early.' },
  { src: `${IMG}/s3_21_coconut_roasted_golden.jpg`, alt: 'Coconut roasted to a sandy gold', caption: 'Two more minutes back on the flame. Sandy gold, and smelling like coconut barfi. THIS is the colour.' },
  { src: `${IMG}/s3_22_masala_paste_ground.jpg`, alt: 'The ground masala paste in a mixie jar', caption: 'Ground with cashew, ginger and garlic until completely smooth. No grit.' },
];
const kurmaPhotos = [
  { src: `${IMG}/s3_24_onions_tempering.jpg`, alt: 'Onions with cumin and curry leaves in a pan', caption: 'Cumin, curry leaves, onion. This is minute three of nine.' },
  { src: `${IMG}/s3_25_kurma_simmering_thin.jpg`, alt: 'The kurma simmering, still thin', caption: 'Everything in — and far too thin. Soup, basically.' },
  { src: `${IMG}/s3_26_kurma_reduced_thick.jpg`, alt: 'The kurma reduced to a thick, glossy gravy', caption: 'Ten minutes with the lid OFF. Same pan, same ingredients, completely different dish.' },
];
const platePhotos = [
  { src: `${IMG}/s3_18_rajamudi_cooked.jpg`, alt: 'Cooked rajamudi rice in the pressure cooker', caption: 'Rajamudi, fluffy and separate. Vindication.' },
  { src: `${IMG}/s3_27_final_plate.jpg`, alt: 'The finished plate of kurma and rajamudi rice', caption: 'Lunch. Eventually.' },
  { src: `${IMG}/s3_28_first_bite_mixed.jpg`, alt: 'A mixed bite of rice and kurma held in fingers', caption: 'The gravy coated every grain instead of pooling under it. That is what the reducing bought.' },
];

const atAGlance = ['Serves 2', '~1 hr of actual work', 'Difficulty: patient, not hard', 'Verdict: 9/10'];

// ── The full recipe: exact measurements + detailed steps ─────────────────────
const pasteColumns = [
  { key: 'item', label: 'Ingredient' },
  { key: 'amount', label: 'Amount' },
];
const pasteIngredients = [
  { item: 'Fresh grated coconut', amount: '¾ - 1 cup' },
  { item: 'Coriander seeds', amount: '1 tbsp' },
  { item: 'Cumin seeds', amount: '½ tsp' },
  { item: 'Black peppercorns', amount: '5-6' },
  { item: 'Dried red chilli', amount: '1, deseeded' },
  { item: 'Cinnamon', amount: 'a small piece (don’t overdo it)' },
  { item: 'Cashews', amount: '8-10' },
  { item: 'Ginger', amount: '1 inch' },
  { item: 'Garlic', amount: '3-4 cloves' },
  { item: 'Water, to grind', amount: '~½ cup' },
];

const kurmaColumns = [
  { key: 'item', label: 'Ingredient' },
  { key: 'amount', label: 'Amount' },
];
const kurmaIngredients = [
  { item: 'Dry soya chunks (small)', amount: '50 g' },
  { item: 'Onion', amount: '1 large, finely chopped' },
  { item: 'Frozen green peas', amount: '⅔ cup' },
  { item: 'Green capsicum', amount: '½, diced' },
  { item: 'Green chilli', amount: '1, slit (left whole)' },
  { item: 'Curry leaves', amount: 'a sprig' },
  { item: 'Cumin seeds', amount: '½ tsp' },
  { item: 'Turmeric', amount: '¼ tsp' },
  { item: 'Ghee', amount: '3 tbsp total' },
  { item: 'Salt', amount: '~¾ tsp — taste and adjust' },
  { item: 'Garam masala', amount: '½ tsp, off the heat' },
  { item: 'Lemon', amount: '¼ - ½, to finish' },
  { item: 'Coriander leaves', amount: 'a handful' },
];

const riceList = [
  '⅔ cup rajamudi rice, rinsed',
  '1¾ cups water + a pinch of salt',
  'Pressure cook 3 whistles, then let the pressure drop on its own',
];

const method = [
  {
    stage: 'Stage 1 · The soya (the part that matters most)',
    steps: [
      { do: 'Boil the soya chunks for 4-5 minutes in water with ½ tsp salt and a pinch of turmeric.', why: 'Salt in the boiling water seasons them from the inside. You cannot fix that later by salting the gravy.' },
      { do: 'Drain, run cold water over them, then squeeze each handful firmly until water stops running out. Dunk in fresh water and squeeze again. Three times.', why: 'Soya is a sponge. Emptying it lets it drink up your masala instead of staying waterlogged — and the raw "beany" smell lives in the water you are squeezing out.' },
      { do: 'Leave them squeezed dry on an empty plate. Do NOT put them back in water.', why: 'They will drink it straight back in and undo the whole exercise. Wet chunks also steam instead of browning.' },
      { do: 'Brown them in 1 tbsp ghee with a pinch of salt, 4-5 minutes, leaving them undisturbed at first. Set aside.', why: 'Boiled soya is soft and one-note. Browned soya has a savoury edge and keeps its bite in the gravy.' },
    ],
  },
  {
    stage: 'Stage 2 · The roasted masala',
    steps: [
      { do: 'In a DRY pan on LOW heat, roast the coriander seeds, cumin, peppercorns, deseeded chilli and cinnamon for 2-3 minutes, until the coriander darkens a shade and it smells toasty.', why: 'Freshly roasted whole spices are a different ingredient from powders that have been sitting in a jar losing their oils for months.' },
      { do: 'Now add the grated coconut to the same pan and keep roasting on low for another 4-5 minutes, until it turns pale sandy gold.', why: 'They finish at different times: dense dry seeds need a head start, while moist fatty coconut colours fast. Adding both together gets you one raw and one burnt.' },
      { do: 'Take it off while you still think it could use a little more. Cool 2 minutes.', why: 'The hot pan carries it another shade. Slightly under is fine — it gets fried again later. Burnt coconut makes the whole gravy bitter and there is no way back.' },
      { do: 'Grind with the cashews, ginger, garlic and water into a completely smooth paste. Scrape down and grind again. Then once more.', why: 'Coconut fibre resists the blade. That extra 30 seconds past "looks done" is the difference between silky and gritty. Add no salt here.' },
    ],
  },
  {
    stage: 'Stage 3 · The kurma',
    steps: [
      { do: 'Heat 2 tbsp ghee, crackle the cumin seeds and curry leaves for 20 seconds.', why: '' },
      { do: 'Add the onion and the slit chilli. Fry for 8-9 minutes, until genuinely golden at the edges — not merely soft.', why: 'With no tomato in the dish, the onion carries all the sweetness. Stopping at "soft" is exactly why home kurmas taste flat.' },
      { do: 'Add the turmeric, stir for 10 seconds only, then add the ground paste and fry for 4-5 minutes.', why: 'Wait for it to thicken, pull away from the sides, and for ghee to bead at the edges. This is the moment the dish is made — do not cut it short.' },
      { do: 'Pour in 1 cup hot water, stir smooth, then add the browned soya, the peas and the salt. Simmer.', why: 'Salt needs simmering time to travel into the ingredients. Start under — the soya is already salted twice, and an over-salted coconut gravy cannot be rescued.' },
      { do: 'Add the capsicum for the last 4-5 minutes. Keep simmering UNCOVERED until the gravy coats the back of a spoon.', why: 'Reducing concentrates the flavour and the soya keeps drinking while it happens. Never thicken this with corn flour — that makes glue, not gravy.' },
      { do: 'Off the heat: garam masala, chopped coriander, a squeeze of lemon. Lid on, rest 2 minutes.', why: 'These aromatics are volatile. Cook them and you lose exactly the thing you added them for. Taste for salt BEFORE the lemon — acid confuses your judgement.' },
    ],
  },
];

const CookingSoyaKurma = () => {
  return (
    <PageWrapper>
      <SEO routeKey="/cooking/soya-kurma" />

      {/* ─── Heading + intro ──────────────────────────────────────────── */}
      <RecipeHero
        title="Soya Chunk & Peas Coconut Kurma"
        subtitle="Or: the day I had no tomatoes, which turned out to be the best thing that could have happened."
        facts={atAGlance}
      >
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          I had a packet of soya chunks, a vague ambition to eat something healthy, and a deadline of
          1:30 pm. What I did <em>not</em> have was a single tomato. Which is a problem, because
          almost every Indian curry I know begins with an onion-tomato base.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          So instead of making a worse version of a tomato curry, I made a different curry entirely —
          one where tomato was never invited. Roasted coconut, roasted whole spices, cashew for
          body. It is a South Indian idea, and it is genuinely better. 🥥
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
          The 1:30 deadline, for the record, was missed by ninety minutes. I ate at three. I regret
          nothing.
        </p>
      </RecipeHero>

      {/* ─── The setup ────────────────────────────────────────────────── */}
      <Section title="The problem, and the plan" photos={haulPhotos}>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Everything chopped first, stove second. Alongside it, rajamudi — a Karnataka heirloom rice
          I had assumed was just "red rice."
        </p>
        <Callout>
          <strong>It is not.</strong> Rajamudi is <em>semi-polished</em> — you can see it in the
          photo, pale milled insides with red bran only in streaks. Fully unpolished red rice is
          uniformly dark and needs about 1:3.5 water. Rajamudi needs roughly <strong>1:2.7</strong>.
          I had 2½ cups of water measured out for ¾ cup of rice and was about to close the lid. That
          would have been porridge. Caught it with about ten seconds to spare.
        </Callout>
      </Section>

      {/* ─── The squeeze ──────────────────────────────────────────────── */}
      <Section title="The squeeze" photos={soyaPhotos}>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          Here is the thing nobody tells you about soya chunks: they are a <strong>sponge</strong>,
          not a vegetable. Everything about whether they taste wonderful or like wet cardboard is
          decided before they go anywhere near the masala.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Boil them, then squeeze them properly — a real squeeze, until the water stops running —
          dunk them in fresh water, and squeeze again. Three full rounds. It does three jobs at once:
          it empties the sponge so it can drink up flavour, it carries away that raw beany smell
          people dislike, and it washes out a good part of the compounds that make soya sit heavy.
        </p>
        <Aside>
          This took me twenty-five minutes and I very nearly cut it short. Don't. It is the whole
          dish.
        </Aside>
      </Section>

      {/* ─── The masala ───────────────────────────────────────────────── */}
      <Section title="Roasting the masala" photos={masalaPhotos}>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          This is where the dish stops being ordinary. Instead of spooning in powders from jars, you
          roast whole spices in a dry pan for three minutes — and then roast the fresh coconut in the
          same pan after them.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          The staging matters. Dense dry seeds need a head start; coconut is moist and fatty and
          colours quickly. Put them in together and you get raw spices with scorched coconut.
        </p>
        <Aside>
          I switched the gas off too early — photo three above, still stubbornly white. Coconut
          releases a lot of moisture first and it looks like nothing is happening, so it is very easy
          to believe you are done. Two more minutes on the flame and it turned.
        </Aside>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Then it all goes into the mixie with cashews, ginger and garlic and gets ground until
          completely smooth. Grind it longer than feels necessary — coconut fibre fights the blade,
          and a gritty paste makes a gritty gravy.
        </p>
      </Section>

      {/* ─── Building it ──────────────────────────────────────────────── */}
      <Section title="Building the kurma" photos={kurmaPhotos}>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          Cumin and curry leaves in ghee, then the onion — and this is the second place patience
          pays. Nine minutes, until properly golden. With no tomato anywhere in this dish, the onion
          is carrying all of the sweetness on its own.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Then the paste goes in and fries until ghee beads at the edges, the water and the soya
          follow, and — as you can see in the middle photo — I ended up with something closer to
          soup. The fix is not corn flour. The fix is <strong>taking the lid off</strong> and letting
          it reduce for ten minutes. The water leaves, the flavour concentrates, and the soya keeps
          drinking the whole time. Two problems, one solution.
        </p>
      </Section>

      {/* ─── The verdict ──────────────────────────────────────────────── */}
      <Section title="The plate, and the verdict" photos={platePhotos}>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          <strong>9/10</strong>, and I finished it in eight minutes, which I think says more than the
          rating does. Two honest notes for next time: it wanted a pinch more salt — I had
          deliberately erred under, because an over-salted coconut gravy is unrecoverable — and I
          made about 15% too much of everything. Also, thinking about it afterwards: this thick a
          gravy probably belongs with <strong>chapathi</strong> rather than rice. The rice was the
          right call against a clock, but not the best plate.
        </p>
        <Callout>
          The one thing I would tell anyone making this: the two moments that decided the whole dish
          were <strong>going back to the pan</strong> when the coconut was under-roasted, and{' '}
          <strong>taking the lid off</strong> when the gravy was thin. Neither is difficult. Both are
          just refusing to accept "near enough."
        </Callout>
      </Section>

      {/* ─── The 5-star menu version (comedy) ─────────────────────────── */}
      <FancyMenu
        subtitle="(Read in the voice of someone who has never squeezed a soya chunk in their life. In reality: a Tuesday, eaten at 3pm, alone.)"
        credit="— Executive Chef, Coconut Roaster & Sole Squeezer of Soya: me."
      >
        Textured soya pearls, thrice-pressed by hand and caramelised in clarified butter, cradled in
        an emulsion of stone-ground estate coconut and cashew, perfumed with spices toasted to order —
        garden peas and capsicum folded through at the last, over heritage Rajamudi rice, and lifted
        with a breath of hand-pressed citrus.
      </FancyMenu>

      {/* ─── The full recipe ──────────────────────────────────────────── */}
      <Section title="The full recipe">
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Serves 2. The amounts below are already trimmed by about 15% from what I actually made —
          I over-catered and felt it afterwards.
        </p>

        <IngredientTable
          heading="The roasted coconut paste"
          columns={pasteColumns}
          rows={pasteIngredients}
          note="No salt in the paste — salt goes into the gravy later, where you can actually taste what you are adjusting."
        />

        <IngredientTable heading="The kurma" columns={kurmaColumns} rows={kurmaIngredients} />

        <BulletList heading="The rice" items={riceList} />

        <MethodSteps method={method} />
      </Section>
    </PageWrapper>
  );
};

export default CookingSoyaKurma;
