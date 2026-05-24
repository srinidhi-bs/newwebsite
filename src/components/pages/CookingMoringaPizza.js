/**
 * CookingMoringaPizza.js — the moringa-pesto pizza recipe page.
 * Route: /cooking/moringa-pizza
 *
 * A first-person, illustrated story of my first from-scratch pizza — a 100%
 * whole-wheat yeasted base on a homemade moringa-amla green pesto — told step by
 * step with the full photo set, plus the exact recipe at the bottom.
 *
 * Layout/mechanics come from components/cooking/RecipeBits.js; this file just
 * supplies the content (prose, photos, ingredient numbers, method).
 *
 * Photos live in /public/images/cooking/s2_*.jpg (already resized + EXIF-baked).
 */

import React from 'react';
import PageWrapper from '../layout/PageWrapper';
import SEO from '../common/SEO';
import {
  RecipeHero,
  Section,
  FancyMenu,
  IngredientTable,
  BulletList,
  MethodSteps,
} from '../cooking/RecipeBits';

const IMG = '/images/cooking';

// ── Photos, grouped by stage (with short, fun captions) ──────────────────────
const haulPhotos = [
  { src: `${IMG}/s2_08_greens_delivered.jpg`, alt: 'All the ingredients, including the greens', caption: 'The full cast: atta, yeast, paneer, veg — and the stars, moringa, Malabar spinach, amla and coriander.' },
];
const doughPhotos = [
  { src: `${IMG}/s2_02_atta_100g.jpg`, alt: 'Weighing the atta', caption: '100 g of atta, weighed like I meant it.' },
  { src: `${IMG}/s2_03_yeast_bloom.jpg`, alt: 'Yeast blooming', caption: 'Yeast foaming = alive. Phew.' },
  { src: `${IMG}/s2_04_dough_kneaded.jpg`, alt: 'Kneaded dough', caption: 'Kneaded smooth.' },
  { src: `${IMG}/s2_05_dough_oiled.jpg`, alt: 'Oiled dough', caption: 'Oiled, ready to rise.' },
  { src: `${IMG}/s2_06_dough_proofing.jpg`, alt: 'Dough proofing in the oven', caption: 'Proofing in the switched-OFF oven.' },
  { src: `${IMG}/s2_07_dough_risen.jpg`, alt: 'Risen dough', caption: 'Risen and puffy.' },
];
const pestoPhotos = [
  { src: `${IMG}/s2_09_moringa_42g.jpg`, alt: 'Plucked moringa leaves', caption: '42 g of plucked moringa leaves.' },
  { src: `${IMG}/s2_10_spinach_53g.jpg`, alt: 'Malabar spinach', caption: '53 g Malabar spinach.' },
  { src: `${IMG}/s2_11_greens_prepped.jpg`, alt: 'Greens prepped', caption: 'Spinach, moringa, coriander — prepped.' },
  { src: `${IMG}/s2_12_amla_chopped.jpg`, alt: 'Chopped amla', caption: 'Amla (nellikai), deseeded.' },
  { src: `${IMG}/s2_13_pesto_blended.jpg`, alt: 'Blended pesto', caption: 'Blended — a little too watery at first.' },
  { src: `${IMG}/s2_14_pesto_cooked_down.jpg`, alt: 'Pesto cooked down thick', caption: 'Cooked down thick. Nailed it.' },
];
const assemblyPhotos = [
  { src: `${IMG}/s2_15_toppings_prepped.jpg`, alt: 'Toppings prepped', caption: 'Toppings, chopped.' },
  { src: `${IMG}/s2_16_base_rolled.jpg`, alt: 'Rolled base', caption: 'Rolled thin.' },
  { src: `${IMG}/s2_17_base_docked.jpg`, alt: 'Docked base, pricked with a fork', caption: 'Rolled out and pricked all over with a fork (docking) so it stays flat.' },
  { src: `${IMG}/s2_18_base_parbaked.jpg`, alt: 'Par-baked base', caption: 'Par-baked — set and crisp.' },
  { src: `${IMG}/s2_19_pesto_spread.jpg`, alt: 'Pesto spread on base', caption: 'Green pesto, spread thin.' },
  { src: `${IMG}/s2_20_topped_loaded.jpg`, alt: 'Loaded with toppings', caption: 'Loaded. (I was told to go light. I did not.)' },
];
const bakePhotos = [
  { src: `${IMG}/s2_21_baking.jpg`, alt: 'Baking in the OTG', caption: 'Into the OTG at 230°C.' },
  { src: `${IMG}/s2_22_out_after_8min.jpg`, alt: 'Out after 8 minutes', caption: 'After 8 min — needed a grill finish for colour.' },
  { src: `${IMG}/s2_23_final_pizza.jpg`, alt: 'The finished pizza', caption: 'Done. Green, golden, glorious.' },
  { src: `${IMG}/s2_24_slice.jpg`, alt: 'A slice', caption: 'The bite: crisp edge, tender middle.' },
  { src: `${IMG}/s2_25_crust_underside.jpg`, alt: 'Crisp crust underside', caption: 'The 10/10 underside.' },
];

const atAGlance = ['Serves 1 (just me)', '~1.5 hrs (took me 3 😅)', 'Difficulty: ambitious', 'Verdict: 8.5/10'];

// ── The full recipe: exact measurements + detailed steps ─────────────────────
const crustColumns = [
  { key: 'item', label: 'Ingredient' },
  { key: 'weight', label: 'Weight' },
  { key: 'spoon', label: 'By spoon / cup' },
];
const crustIngredients = [
  { item: 'Whole wheat atta', weight: '100 g', spoon: '¾ cup + 1 tbsp (+ extra to dust)' },
  { item: 'Instant dry yeast', weight: '1.5 g', spoon: '½ tsp' },
  { item: 'Sugar', weight: '2 g', spoon: '½ tsp' },
  { item: 'Salt', weight: '2 g', spoon: 'scant ½ tsp' },
  { item: 'Groundnut oil', weight: '8 g', spoon: '2 tsp' },
  { item: 'Lukewarm water', weight: '~62 g', spoon: '~62 ml (1 ml water ≈ 1 g)' },
];

const pestoColumns = [
  { key: 'item', label: 'Ingredient' },
  { key: 'amount', label: 'Amount' },
];
const pestoIngredients = [
  { item: 'Moringa (drumstick) leaves', amount: '42 g (~1 packed cup, plucked)' },
  { item: 'Malabar spinach leaves', amount: '53 g (~2 packed cups)' },
  { item: 'Amla (nellikai)', amount: '1, deseeded' },
  { item: 'Coriander', amount: 'a small handful (kept raw)' },
  { item: 'Fresh coconut', amount: '3 tbsp, grated' },
  { item: 'Roasted peanuts / cashews', amount: '2 tbsp' },
  { item: 'Garlic', amount: '2-3 cloves' },
  { item: 'Green chilli', amount: '1-2' },
  { item: 'Salt', amount: '~½ tsp (easy — cheese is salty)' },
  { item: 'Oil', amount: '1-2 tbsp' },
  { item: 'Lemon (nimbu)', amount: '½, to finish' },
];

const toppingsList = [
  'Onion + green capsicum, thinly sliced',
  'Paneer, in small cubes',
  'A little broccoli / cauliflower — par-cooked first',
  'Grated Amul (or mozzarella) cheese',
];

const method = [
  {
    stage: 'Stage 1 · The dough',
    steps: [
      { do: 'Bloom the yeast: stir the sugar and yeast into ~62 ml lukewarm water (warm like bathwater — never hot). Wait 5-10 min until foamy.', why: 'The foam proves the yeast is alive; hot water would kill it.' },
      { do: 'Mix the atta and salt, then pour in the foamy water and oil. Bring it together, adding water a little at a time, into a firm dough.', why: 'Aim for a firm, soft-chapathi-like dough — the lowish hydration is what lets a thin crust roll out without tearing.' },
      { do: 'Knead for 8-10 minutes until smooth and stretchy.', why: 'Kneading builds the gluten that traps gas and gives the crust its bite.' },
      { do: 'Cover and let it rise in a warm spot for ~45-60 minutes, until roughly doubled.', why: 'A switched-OFF oven with just the light on makes a great warm, draft-free spot.' },
    ],
  },
  {
    stage: 'Stage 2 · The green pesto',
    steps: [
      { do: 'Pluck the moringa leaves off their stems, pick the Malabar spinach leaves, and deseed and chop the amla. Wash everything well (a quick salt-water soak for the moringa clears grit).', why: 'The thin moringa stems are fibrous and bitter — use the leaves only.' },
      { do: 'Blanch the moringa, spinach and amla in rolling water for 45-60 seconds, then plunge into cold water and squeeze dry. Keep the coriander raw.', why: 'Blanching and cold-shocking keep the colour vivid and tame the bitterness; squeezing dry stops a watery sauce from sogging the crust.' },
      { do: 'Blend the squeezed greens, raw coriander, coconut, nuts, garlic, chilli, amla, salt and oil into a thick paste — adding water only if needed.', why: '' },
      { do: 'Cook it down in a pan with a teaspoon of oil for 3-5 minutes until thick and spreadable. Finish with a squeeze of lemon, off the heat.', why: 'A thick paste won’t sog the crust, and reducing deepens the flavour.' },
    ],
  },
  {
    stage: 'Stage 3 · Shape & par-bake',
    steps: [
      { do: 'Lightly oil the baking tray and dust it with semolina/rava.', why: 'Stops sticking and crisps the base — no parchment needed (it can scorch at 230°C anyway).' },
      { do: 'Roll the dough about 3 mm thin into a ~22 cm round, leaving a bare ~1 cm border.', why: '' },
      { do: 'Dock the base all over with a fork.', why: 'Lets steam escape so it stays flat and crisp instead of ballooning into bubbles.' },
      { do: 'Par-bake the bare base at 230°C on a LOW rack for 4-5 minutes, until set and dry (still pale).', why: 'The low rack drives bottom heat into the base; par-baking is the key anti-sog step.' },
    ],
  },
  {
    stage: 'Stage 4 · Top & bake',
    steps: [
      { do: 'Spread a thin layer of pesto, leaving the border bare.', why: '' },
      { do: 'Scatter a little cheese first, then your toppings, then a little more cheese.', why: 'Cheese underneath helps the toppings stick and shields the crust. Go light — or, if you load it up, pre-cook the dense veg first so it cooks through.' },
      { do: 'Bake at 230°C on the MIDDLE rack for 8-12 minutes, until the cheese melts and the edges crisp. Finish under the grill for 1-2 minutes for colour.', why: '' },
      { do: 'Out of the oven, squeeze over the lemon, rest 1-2 minutes, then slice.', why: 'Fresh lemon’s brightness is destroyed by heat, so add it right at the end.' },
    ],
  },
];

const CookingMoringaPizza = () => {
  return (
    <PageWrapper>
      <SEO routeKey="/cooking/moringa-pizza" />

      {/* ─── Heading + intro ──────────────────────────────────────────── */}
      <RecipeHero
        title="Moringa-Pesto Pizza"
        subtitle="Or: the time I put drumstick leaves on a pizza — and it actually worked."
        facts={atAGlance}
      >
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          I am <em>not</em> a chef. But I'm learning to cook, and one Sunday I decided my first real
          project would be… a pizza. From scratch. Dough and all. And instead of tomato sauce, a
          green pesto made from <strong>moringa (drumstick) leaves</strong> — because apparently I
          enjoy making things hard for myself.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Spoiler: it worked. Mostly. Here's the whole thing, step by step. 🍕
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
          One honest confession: this is supposedly a ~1.5-hour cook. It took me <strong>three</strong>.
          I'm a slow, easily-distracted cook — and I've made my peace with that. 😄
        </p>
      </RecipeHero>

      {/* ─── The haul ─────────────────────────────────────────────────── */}
      <Section title="First, the haul" photos={haulPhotos}>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          It started, as these things do, with a small mountain of ingredients and an unreasonable
          amount of optimism. Whole wheat atta (no maida — being healthy, sort of), yeast, paneer,
          veg, and the stars: moringa leaves and a couple of amla.
        </p>
      </Section>

      {/* ─── The dough ────────────────────────────────────────────────── */}
      <Section title="The dough" photos={doughPhotos}>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Bloom the yeast (it foamed — we were in business), knead it into a firm dough, and let it
          rise. It puffed up like it had plans.
        </p>
      </Section>

      {/* ─── The green gamble ─────────────────────────────────────────── */}
      <Section title="The green gamble" photos={pestoPhotos}>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Now the bit everyone raised an eyebrow at: a pesto of moringa, Malabar spinach and amla.
          Blanched, blended, cooked down thick. I tasted it bracing for “healthy and worthy.” I got
          “actually delicious.” Tangy, nutty, fresh.
        </p>
      </Section>

      {/* ─── Building it ──────────────────────────────────────────────── */}
      <Section title="Building it" photos={assemblyPhotos}>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          I rolled the base thin, pricked it all over with a fork so it'd stay flat, and par-baked
          it crisp. Then the pesto, then… everything else. Restraint was discussed. Restraint did
          not happen.
        </p>
      </Section>

      {/* ─── Bake & verdict ───────────────────────────────────────────── */}
      <Section title="Bake, and the verdict" photos={bakePhotos}>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Into the OTG at full heat, a quick grill to finish, and out came an actual pizza. The
          crust was the star — crisp edges, tender middle, properly thin from 100% atta: a genuine{' '}
          <strong>10/10</strong>. The pesto, also 10/10. The toppings? The one regret — I overloaded
          them and they didn't all cook through (next time I'll pre-cook the veg). Overall:{' '}
          <strong>8.5/10 for a first attempt</strong>, and a frankly heroic pile of dishes to wash.
        </p>
      </Section>

      {/* ─── The 5-star menu version (comedy) ─────────────────────────── */}
      <FancyMenu
        subtitle="(Best read aloud in your poshest voice. In reality: a Sunday, eaten standing in the kitchen.)"
        credit="— Executive Chef, Dough Whisperer & Sole Dishwasher: me."
      >
        A hand-stretched heritage wholegrain base, blind-baked to a delicate crispness, lacquered
        with a verdant moringa-and-amla pesto, crowned with a confit of garden vegetables and a
        molten veil of cheese — finished, tableside, with a whisper of fresh citrus.
      </FancyMenu>

      {/* ─── The full recipe ──────────────────────────────────────────── */}
      <Section title="The full recipe">
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Exact measurements and the proper step-by-step, if you'd like to make it yourself.
        </p>

        <IngredientTable
          heading="Crust — 1 personal pizza (~22 cm)"
          columns={crustColumns}
          rows={crustIngredients}
          note="A kitchen scale helps a lot — but the tiny amounts (yeast, salt, sugar) are easiest by spoon."
        />

        <IngredientTable heading="Moringa-amla pesto" columns={pestoColumns} rows={pestoIngredients} />

        <BulletList heading="Toppings" items={toppingsList} />

        <MethodSteps method={method} />
      </Section>
    </PageWrapper>
  );
};

export default CookingMoringaPizza;
