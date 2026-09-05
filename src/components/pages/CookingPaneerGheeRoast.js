/**
 * CookingPaneerGheeRoast.js — the paneer ghee roast recipe page.
 * Route: /cooking/paneer-ghee-roast
 *
 * A dry, standalone paneer dish built without curd — because there wasn't any
 * in the house. Dry-roasted besan does the job curd normally does (making the
 * masala cling), lemon does the other job (tang).
 *
 * The story runs across TWO cooks three days apart: the first (22 Aug, alone,
 * 9.5/10) and the second (25 Aug, cooking for my wife), which fixed one flaw
 * and introduced two new ones. The photos are all from the second cook.
 *
 * Layout/mechanics come from components/cooking/RecipeBits.js; this file just
 * supplies the content (prose, photos, ingredient numbers, method).
 *
 * Photos live in /public/images/cooking/s5_*.jpg (already resized + EXIF-baked).
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
const setupPhotos = [
  { src: `${IMG}/s5_03_mise_en_place.jpg`, alt: 'Everything laid out on the board before cooking', caption: 'Everything cut and measured first. This dish gives you eight minutes of cooking and no gaps to chop in.' },
  { src: `${IMG}/s5_05_paneer_cubed.jpg`, alt: 'Paneer cut into twelve even cubes', caption: '100 g, twelve cubes, 2 cm each. Exactly one comfortable layer in the pan — that number is not an accident.' },
];
const soakPhotos = [
  { src: `${IMG}/s5_07_paneer_salt_soak.jpg`, alt: 'Paneer cubes soaking in a pot of salted water', caption: 'Five minutes in hot salted water. Five, not fifteen — this brand is soft already.' },
  { src: `${IMG}/s5_10_paneer_patted_dry.jpg`, alt: 'Paneer cubes patted dry on a kitchen towel', caption: 'Then patted properly dry. Wet paneer steams instead of searing, and you only find out when it is too late.' },
];
const besanPhotos = [
  { src: `${IMG}/s5_08_besan_dry_roasting.jpg`, alt: 'Besan dry-roasting in a pan with a red spatula', caption: 'Dry pan, low flame, no ghee, and do not walk away. Two minutes.' },
  { src: `${IMG}/s5_13_besan_roasted.jpg`, alt: 'The roasted besan in a small white bowl', caption: 'Out of the pan the moment it smells nutty. The pan keeps cooking whatever you leave in it.' },
];
const searPhotos = [
  { src: `${IMG}/s5_15_paneer_into_ghee.jpg`, alt: 'White paneer cubes just placed in melted ghee', caption: 'In they go, single layer, not touching. Now the hard part: leave them alone.' },
  { src: `${IMG}/s5_17_paneer_seared_golden.jpg`, alt: 'Paneer cubes seared golden brown on one face', caption: 'Ninety seconds untouched, then a flip. That crust is the entire dish.' },
  { src: `${IMG}/s5_18_paneer_removed_plate.jpg`, alt: 'Seared paneer cubes resting on a steel plate', caption: 'And straight out onto a plate. Every extra minute in the pan from here makes them tougher.' },
];
const vegPhotos = [
  { src: `${IMG}/s5_12_onion_capsicum_cut.jpg`, alt: 'Chopped capsicum and onion on a wooden board', caption: 'Onion in chunks, capsicum in squares. Bigger than feels right — they shrink.' },
  { src: `${IMG}/s5_20_jeera_ginger_tempering.jpg`, alt: 'Cumin seeds and ginger crackling in ghee', caption: 'Jeera and ginger in the ghee the paneer just left behind.' },
  { src: `${IMG}/s5_22_veg_charring.jpg`, alt: 'Onion and capsicum cooking in the pan', caption: 'High heat, two minutes. I gave them four, which turns out to matter.' },
];
const masalaPhotos = [
  { src: `${IMG}/s5_23_pan_cleared_for_bloom.jpg`, alt: 'The vegetables pushed to one side of the pan, leaving bare space', caption: 'Veg pushed aside, a clear patch of ghee opened up. This little manoeuvre is the whole upgrade.' },
  { src: `${IMG}/s5_25_masala_blooming.jpg`, alt: 'Dry masala and roasted besan sizzling in ghee', caption: 'Masala and roasted besan straight into the hot ghee. Twenty seconds, and the smell changes completely.' },
  { src: `${IMG}/s5_27_masala_on_veg.jpg`, alt: 'The vegetables completely coated in the dark masala', caption: 'And here is my mistake, in evidence: every bit of that masala went onto the vegetables. The paneer was still on its plate.' },
];
const platePhotos = [
  { src: `${IMG}/s5_28_paneer_back_in.jpg`, alt: 'Seared paneer returned to the pan with the vegetables', caption: 'Paneer back in — arriving late to a party where the food was already finished.' },
  { src: `${IMG}/s5_29_finished_pan.jpg`, alt: 'The finished dish in the pan with coriander', caption: 'Kasuri methi crushed between the palms, lemon, coriander. Flame off before any of it goes in.' },
  { src: `${IMG}/s5_30_final_plate.jpg`, alt: 'The finished paneer ghee roast plated on a white plate', caption: 'Dinner. Cooked twice in three days, and I still learned something new the second time.' },
];

const atAGlance = ['Serves 1 (or 2 alongside rice)', '~20 minutes', 'No curd, no marination', 'Verdict: 9.5/10'];

// ── The recipe ───────────────────────────────────────────────────────────────
const mainColumns = [
  { key: 'item', label: 'Ingredient' },
  { key: 'amount', label: 'Amount' },
];
const mainIngredients = [
  { item: 'Paneer', amount: '100 g, in 2 cm cubes' },
  { item: 'Onion', amount: '1 small, thick wedges, layers separated' },
  { item: 'Green capsicum', amount: '½ medium, 2 cm squares' },
  { item: 'Ginger', amount: '½ tsp, finely grated' },
  { item: 'Ghee', amount: '1½ tbsp total' },
  { item: 'Besan (gram flour)', amount: '1½ tsp, dry-roasted' },
  { item: 'Cumin seeds', amount: '½ tsp, whole' },
  { item: 'Kasuri methi', amount: '½ tsp, crushed at the end' },
  { item: 'Lemon', amount: '½, to finish' },
  { item: 'Coriander leaves', amount: 'a small handful' },
];

const masalaColumns = [
  { key: 'item', label: 'The dry masala (one bowl)' },
  { key: 'amount', label: 'Amount' },
];
const masalaIngredients = [
  { item: 'Turmeric', amount: '¼ tsp' },
  { item: 'Kashmiri chilli powder', amount: '½ tsp' },
  { item: 'Cumin powder', amount: '½ tsp' },
  { item: 'Black pepper, freshly crushed', amount: '⅛ tsp' },
  { item: 'Salt', amount: '⅓ tsp (plus ½ tsp for the soak water)' },
];

const method = [
  {
    stage: 'Stage 1 · Prep',
    steps: [
      { do: 'Boil 2 cups water, take it off the heat, stir in ½ tsp salt and drop the paneer block in for 5 minutes. Chop the onion and capsicum while it sits.', why: 'It seasons the paneer from the inside and relaxes it. Keep it to five minutes with a soft, vinegar-set paneer — a long soak turns it fragile and it breaks up in the pan.' },
      { do: 'In a DRY pan on LOW heat with no ghee, roast the besan for 2 minutes, stirring constantly, until it smells nutty and darkens a shade. Tip it onto a plate straight away.', why: 'Raw besan tastes chalky and faintly bitter. Roasted, it is nutty — and it is what will make the masala grip. It also burns in seconds, and the pan keeps cooking it after the flame is off.' },
      { do: 'Lift the paneer out, press it properly dry on a kitchen towel, then cut into 2 cm cubes.', why: 'Surface water has to boil off before browning can start. Wet cubes steam themselves pale instead of searing.' },
    ],
  },
  {
    stage: 'Stage 2 · The sear (the part that decides everything)',
    steps: [
      { do: 'Heat 1 tbsp ghee on medium-high. Lay the cubes in a single layer, not touching, and do not move them for 90 seconds. Flip, give them another 60-90 seconds, then take them out onto a plate.', why: 'Paneer protein tightens under prolonged heat and wrings out its own moisture. Hot and fast gives you a golden crust and a custardy middle. Slow and long gives you rubber, and rubber cannot be undone.' },
      { do: 'If you are making more than 100 g, sear in batches.', why: 'A crowded pan drops in temperature and the cubes release moisture into each other. You get pale, weepy paneer instead of a crust.' },
    ],
  },
  {
    stage: 'Stage 3 · The vegetables',
    steps: [
      { do: 'In the same pan, crackle the cumin seeds in the leftover ghee, add the ginger for 15 seconds, then the onion petals and capsicum on HIGH heat for 2 minutes.', why: 'You want black char spots and a surviving crunch, not softness. The onion should still look like onion.' },
      { do: 'Take the vegetables out too, onto their own plate.', why: 'Anything left in the pan keeps cooking through the next two steps. This is exactly how I overcooked mine.' },
    ],
  },
  {
    stage: 'Stage 4 · Masala, and putting it together',
    steps: [
      { do: 'Turn the heat low. Add the last ½ tbsp ghee, tip in the dry masala bowl AND the roasted besan, and let it sizzle in the ghee for 15-20 seconds.', why: 'Spice compounds are fat-soluble. Dusting dry powder over dry food just gives you powder sitting on food; bloomed in ghee it becomes a spiced fat that coats whatever it touches.' },
      { do: 'Put the paneer back in FIRST, on its own, and toss for 30-40 seconds until every cube is coated.', why: 'Seared paneer is smooth and sealed; cut vegetables are damp and rough. Put them in together and the vegetables take all the masala. Give the paneer the pan to itself and it has no competition.' },
      { do: 'Taste, and adjust the salt now.', why: 'This is the only moment everything is together and tasteable. Under-salt earlier — adding takes thirty seconds, removing is impossible.' },
      { do: 'Return the vegetables and toss for 15 seconds, just to combine.', why: 'They are already cooked. This is assembly, not cooking.' },
      { do: 'Flame OFF. Crush the kasuri methi between your palms over the pan, squeeze in the lemon, scatter the coriander. Rest one minute and serve.', why: 'Crushing releases the oils in the kasuri methi — that is the aroma nobody can quite place in restaurant food. Direct flame burns it in seconds, and lemon on live heat goes bitter.' },
    ],
  },
];

const lessons = [
  'Give the paneer the pan to itself. Seared paneer is smooth and sealed; cut vegetables are damp and rough, so they win every masala they compete for. Paneer in first, alone, then the vegetables back at the end.',
  'Take the vegetables out when they are done. I left mine in through the blooming and the final toss — an extra minute and a half of cooking they did not need, and they went soft.',
  'Freshly crushed pepper is about twice as strong as the jarred powder. Recipes are almost always written for the jar. The first time I used ¼ tsp crushed fresh and it dominated the dish; ⅛ tsp is right.',
  'Bloom the masala in ghee rather than dusting it on. The first time, half of it ended up as loose powder on the pan instead of on the food.',
  'Paneer stores wet, submerged in fresh water, for two days. Which is the exact opposite of soya chunks, which must be squeezed bone dry and left dry. Same fridge, opposite rules.',
];

const CookingPaneerGheeRoast = () => {
  return (
    <PageWrapper>
      <SEO routeKey="/cooking/paneer-ghee-roast" />

      {/* ─── Heading + intro ──────────────────────────────────────────── */}
      <RecipeHero
        title="Paneer Ghee Roast"
        subtitle="Or: what to cook when there is no curd in the house and dinner is in thirty minutes."
        facts={atAGlance}
      >
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          It was seven in the evening, I had a 200 g packet of paneer, a cup of leftover bisi bele
          bath, and a vague intention to eat something proper. The obvious answer was paneer tikka.
          The obvious answer required curd. There was no curd.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Curd does exactly two things in a tikka marinade: it brings <strong>tang</strong>, and it{' '}
          <strong>clings</strong> to the paneer so the masala has something to hold on to. Lemon can
          do the first. Dry-roasted besan can do the second. Take those two jobs away from curd and
          you do not need it at all — you just need a different dish. 🧀
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
          I have now made this twice in three days. The second time was slightly worse, and taught me
          considerably more. Both stories are below.
        </p>
      </RecipeHero>

      {/* ─── The setup ────────────────────────────────────────────────── */}
      <Section title="Twelve cubes, and why that number" photos={setupPhotos}>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Everything gets cut and measured before the pan goes anywhere near the flame. This is an
          eight-minute cook with no natural pauses in it — there is no point at which you can
          comfortably stop and chop an onion.
        </p>
        <Callout>
          <strong>100 g of paneer is twelve 2 cm cubes, and that is exactly one layer in my pan.</strong>{' '}
          That is the real reason for the quantity. Crowd the pan and the cubes drop its temperature
          and release moisture into each other, and you end up with pale, weepy paneer instead of a
          crust. If you want more, sear it in two batches — do not squeeze it into one.
        </Callout>
      </Section>

      {/* ─── The soak ─────────────────────────────────────────────────── */}
      <Section title="A short soak, and a very dry paneer" photos={soakPhotos}>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          Hot salted water for five minutes seasons the paneer from the inside, which you cannot fix
          later by salting the outside. But five minutes, not fifteen. Check the ingredients on your
          packet — mine says <em>milk solids and vinegar</em>, and vinegar-set paneer is softer than
          the lemon-set kind. Leave a soft paneer soaking too long and it falls apart the moment it
          meets a spatula.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Then dry it properly. Not a token dab — press it. Any water still on the surface has to
          boil off before the pan can start browning anything, and by the time it has, the inside has
          overcooked.
        </p>
      </Section>

      {/* ─── The besan ────────────────────────────────────────────────── */}
      <Section title="Roasting the besan" photos={besanPhotos}>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          This is the step standing in for the curd, and it takes two minutes. Dry pan, low flame, no
          ghee, and stir the whole time. It goes from pale yellow to a shade darker and starts
          smelling nutty — a bit like roasted peanuts.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Raw besan is chalky and slightly bitter, and you can taste it in a finished dish. Roasted,
          it is nutty and it grips — which is the entire point.
        </p>
        <Aside>
          The same trap as the coconut in the kurma: get it out of the pan the moment it is right.
          The pan does not stop being hot just because you turned the flame off.
        </Aside>
      </Section>

      {/* ─── The sear ─────────────────────────────────────────────────── */}
      <Section title="Ninety seconds of doing nothing" photos={searPhotos}>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          Ghee on medium-high, cubes in a single layer, and then the genuinely difficult part:{' '}
          <strong>do not touch them for ninety seconds.</strong> Every instinct says stir. Stirring
          is what stops a crust from forming.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Flip once, another minute or so, and out. Two golden faces is plenty — you are not trying
          to brown all six sides.
        </p>
        <Callout>
          <strong>Paneer only fails in one direction.</strong> Its protein tightens under prolonged
          heat and squeezes out its own moisture, which is what makes restaurant paneer squeak
          against your teeth. Hot and fast gives you a golden crust and a soft, almost custardy
          middle. There is no way back from rubber, so err early — if a cube starts curling at the
          corners, it is already a minute past its best.
        </Callout>
      </Section>

      {/* ─── The vegetables ───────────────────────────────────────────── */}
      <Section title="The vegetables, briefly" photos={vegPhotos}>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Cumin and ginger crackle in the ghee the paneer left behind, then onion and capsicum on
          high heat. Two minutes is enough. You are after char spots and a surviving crunch — the
          onion should still be recognisably onion, sweet in the middle and blackened at the edges.
        </p>
        <Aside>
          I gave mine about four minutes, because they were in the pan anyway and I was busy with
          the masala. More on that in a moment.
        </Aside>
      </Section>

      {/* ─── The bloom, and the mistake ───────────────────────────────── */}
      <Section title="Blooming the masala — and the thing I got wrong" photos={masalaPhotos}>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          The first time I made this, I sprinkled the dry masala straight onto the food, and a good
          half of it ended up as loose powder on the pan rather than on anything edible. So the
          second time I pushed the vegetables aside, opened up a clear patch of ghee, and tipped the
          masala and the roasted besan into that instead. Twenty seconds of sizzling and the smell
          changes completely.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          That worked — spices are fat-soluble, so bloomed in ghee they become a spiced fat that
          coats whatever it touches, rather than powder sitting on top of something. But look at the
          third photo, because it is the honest one.
        </p>
        <Callout>
          <strong>All of the masala went onto the vegetables, and almost none onto the paneer.</strong>{' '}
          I had put everything back into the pan together, and it was never a fair contest: cut onion
          and capsicum are damp and rough and grab powder instantly, while seared paneer is smooth,
          dry and sealed. The vegetables simply got there first.
        </Callout>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          The fix, which is now step two of Stage 4 in the recipe below:{' '}
          <strong>put the paneer back in first, on its own</strong>, into an otherwise empty pan of
          bloomed masala. With nothing to compete against, it takes the lot. The vegetables come back
          at the very end, for fifteen seconds, purely to combine.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          And that one change quietly fixes the soft vegetables too. They had been sitting in the pan
          through the blooming and the final toss — an extra ninety seconds of cooking after they
          were already done. Take them out when they are charred and they simply stop.
        </p>
      </Section>

      {/* ─── The plate ────────────────────────────────────────────────── */}
      <Section title="The plate, and the verdict" photos={platePhotos}>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          <strong>9.5/10 the first time</strong>, and I will happily stand behind that. The besan
          read as properly nutty, the salt landed right, and the paneer was soft and custardy the
          whole way through — which was the one thing that could have gone wrong and did not. The
          half mark I docked was for the pepper: I crushed whole peppercorns and used the same
          quantity I would have used from a jar, which turns out to be roughly double the strength.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          <strong>The second attempt came in slightly below the first</strong> — masala on the
          vegetables instead of the paneer, vegetables a little soft, salt marginally short. Which is
          a strange thing to be pleased about, except that the first cook taught me one lesson and
          the second taught me three.
        </p>
        <Aside>
          Eaten as a standalone dish beside a cup of bisi bele bath, which was deliberate: one dish
          dry, tangy and peppery, the other wet, sour and heavily spiced. Nothing on the plate tasted
          like anything else on the plate.
        </Aside>
      </Section>

      {/* ─── The 5-star menu version (comedy) ─────────────────────────── */}
      <FancyMenu
        subtitle="(To be read by someone who has never once stood over a pan at 7pm wondering whether there is curd. In reality: a Tuesday, and there was not.)"
        credit="— Executive Chef, Besan Roaster & Sole Timer of Ninety Seconds: me."
      >
        Hand-cut cubes of fresh vinegar-set curd cheese, brined in seasoned water and seared in
        clarified butter to a burnished gold, robed in a toasted gram-flour masala bloomed to order,
        with flame-charred alliums and sweet peppers — finished tableside with hand-pressed citrus
        and a flourish of palm-crushed fenugreek.
      </FancyMenu>

      {/* ─── The full recipe ──────────────────────────────────────────── */}
      <Section title="The full recipe">
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Serves one as a standalone dish, or two alongside rice. The numbers below are the corrected
          ones — less pepper and less ghee than I actually used, for reasons the story above explains.
        </p>

        <IngredientTable heading="The dish" columns={mainColumns} rows={mainIngredients} />

        <IngredientTable
          heading="The dry masala"
          columns={masalaColumns}
          rows={masalaIngredients}
          note="Measure these into one small bowl before you start. Once the pan is hot there is no time to go looking for the turmeric."
        />

        <MethodSteps method={method} />
      </Section>

      {/* ─── Lessons ──────────────────────────────────────────────────── */}
      <Section title="What I learned">
        <BulletList items={lessons} />
      </Section>

      {/* ─── Closing ──────────────────────────────────────────────────── */}
      <Section title="Cooking the same thing twice">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          I had always assumed the point of a recipe was to get it right, and then to have it. But
          the second cook is where the actual learning was. The first time, everything worked and I
          could not have told you why. The second time one thing went wrong, and chasing down the
          reason taught me something true about paneer that I will use for the rest of my life:{' '}
          <strong>a seared surface does not grip.</strong> That is not a paneer fact. That will come
          up again with potatoes, with tofu, with anything I brown before saucing.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          So — make it twice. The dish is good enough to be worth it, and you will not learn the
          interesting half on the first go.
        </p>
      </Section>
    </PageWrapper>
  );
};

export default CookingPaneerGheeRoast;
