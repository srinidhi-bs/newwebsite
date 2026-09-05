/**
 * Cooking.js — the Cooking SECTION LANDING page (route: /cooking).
 *
 * EXPERIMENTAL (added 2026-05-24). This is the hub for my cooking write-ups: a
 * short intro plus one tile per recipe. Each tile links to that recipe's own
 * page (e.g. /cooking/moringa-pizza), exactly like the Finance and Tools pages
 * link out to individual calculators/tools.
 *
 * The actual recipe pages live in:
 *   - pages/CookingMoringaPizza.js   (/cooking/moringa-pizza)
 *   - pages/CookingRoastedVeg.js     (/cooking/roasted-veg)
 *   - pages/CookingSoyaKurma.js      (/cooking/soya-kurma)
 *   - pages/CookingPaneerGheeRoast.js (/cooking/paneer-ghee-roast)
 * and share their rendering pieces from components/cooking/RecipeBits.js.
 *
 * To add a new recipe later: build a new recipe page + route + breadcrumb label
 * + SEO entry, then add one entry to the RECIPES array below.
 *
 * Reuses the site's standard building blocks so it matches every other page:
 *   - <PageWrapper>  → background, breadcrumbs, page transitions
 *   - <SEO>          → <title> + meta tags (reads the "/cooking" entry in seoConfig.js)
 *   - Tailwind `dark:` classes → automatic dark-mode support
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageWrapper from '../layout/PageWrapper';
import SEO from '../common/SEO';

// ── The recipe catalogue (newest first) ──────────────────────────────────────
// Each entry becomes one tile. `emoji` is the little icon in the tile corner,
// `meta` is the small grey line (date · self-rating).
const RECIPES = [
  {
    path: '/cooking/paneer-ghee-roast',
    emoji: '🧀',
    title: 'Paneer Ghee Roast',
    blurb:
      'No curd in the house, so no tikka — dry-roasted besan does the ' +
      'clinging and lemon does the tang. The ninety-second sear that keeps ' +
      'paneer soft, and what I got wrong cooking it a second time.',
    meta: '25 Aug 2026 · self-rated 9.5/10',
  },
  {
    path: '/cooking/soya-kurma',
    emoji: '🍲',
    title: 'Soya Chunk & Peas Coconut Kurma',
    blurb:
      'No tomatoes in the house — so the whole curry pivoted to a roasted ' +
      'coconut base instead. Dry-roasted whole spices, cashew for body, and ' +
      'the soya-squeezing technique that decides everything.',
    meta: '4 Aug 2026 · self-rated 9/10',
  },
  {
    path: '/cooking/moringa-pizza',
    emoji: '🍕',
    title: 'Moringa-Pesto Pizza',
    blurb:
      'A from-scratch yeasted 100% whole-wheat thin crust on a homemade ' +
      'moringa–amla green pesto, loaded with veg and paneer. My first ever pizza.',
    meta: '24 May 2026 · self-rated 8.5/10',
  },
  {
    path: '/cooking/roasted-veg',
    emoji: '🥘',
    title: 'Roasted Veg + Khichdi',
    blurb:
      'Steam-then-roast mixed vegetables — cauliflower, broccoli, carrot, beans, ' +
      'onion — tossed in ghee and spices for golden edges, served with khichdi. ' +
      'My first proper solo cook.',
    meta: '23 May 2026',
  },
];

const Cooking = () => {
  return (
    <PageWrapper>
      <SEO routeKey="/cooking" />

      {/* ─── Heading ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-2 dark:text-gray-100">Cooking</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Learning to cook — documenting each dish from scratch, step by step.
        </p>
      </motion.div>

      {/* ─── Intro card ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8"
      >
        <p className="text-lg text-gray-700 dark:text-gray-300">
          I'm learning to cook for the joy of it. These are my experiments — written up honestly,
          with photos, the full recipe, and whatever I got wrong along the way. Pick a dish below. 🍳
        </p>
      </motion.div>

      {/* ─── Recipe tiles grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {RECIPES.map((r) => (
          // A real <Link> (not an onClick div) so each recipe is a crawlable,
          // keyboard-accessible link — important for the recipe SEO.
          <Link
            key={r.path}
            to={r.path}
            className="block bg-white dark:bg-gray-800/50 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{r.title}</h3>
              <span className="text-3xl leading-none" aria-hidden="true">
                {r.emoji}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300">{r.blurb}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">{r.meta}</span>
              <span className="flex items-center text-green-600 dark:text-green-400 font-medium">
                View recipe
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </PageWrapper>
  );
};

export default Cooking;
