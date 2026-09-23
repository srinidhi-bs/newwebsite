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
 *   - <SectionHeader> + card-skin / tile-skin / text-ink tokens → the Home page's
 *     look in BOTH personalities (Playground ☀ / Laboratory 🌙) — Session 49
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageWrapper from '../layout/PageWrapper';
import SEO from '../common/SEO';
import SectionHeader from '../common/SectionHeader';

// ── The recipe catalogue (newest first) ──────────────────────────────────────
// Each entry becomes one tile. `photo` is the finished-dish shot shown across
// the top of the tile — usually the SAME photo + alt text as that recipe page's
// hero (and its seoConfig og:image), so the tile previews what you'll see.
// The tile shows an EDITED cover copy from /images/cooking/covers/ (pre-cropped
// to 4:3, colour/contrast-boosted, web-sized) — made by
// scripts/make_cooking_covers.py. Originals (used on the recipe pages) are untouched.
// `meta` is the small grey line (date · self-rating).
const RECIPES = [
  {
    path: '/cooking/paneer-ghee-roast',
    photo: { src: '/images/cooking/covers/s5_30_final_plate_cover.jpg', alt: 'The finished paneer ghee roast plated on a white plate' },
    title: 'Paneer Ghee Roast',
    blurb:
      'No curd in the house, so no tikka — dry-roasted besan does the ' +
      'clinging and lemon does the tang. The ninety-second sear that keeps ' +
      'paneer soft, and what I got wrong cooking it a second time.',
    meta: '25 Aug 2026 · self-rated 9.5/10',
  },
  {
    path: '/cooking/soya-kurma',
    // Srinidhi's pick (Session 49): the kurma alone in the pan, not the
    // rice plate the page hero uses — so this tile deliberately differs.
    photo: { src: '/images/cooking/covers/s3_26_kurma_reduced_thick_cover.jpg', alt: 'The kurma reduced to a thick, glossy gravy' },
    title: 'Soya Chunk & Peas Coconut Kurma',
    blurb:
      'No tomatoes in the house — so the whole curry pivoted to a roasted ' +
      'coconut base instead. Dry-roasted whole spices, cashew for body, and ' +
      'the soya-squeezing technique that decides everything.',
    meta: '4 Aug 2026 · self-rated 9/10',
  },
  {
    path: '/cooking/moringa-pizza',
    photo: { src: '/images/cooking/covers/s2_23_final_pizza_cover.jpg', alt: 'The finished pizza' },
    title: 'Moringa-Pesto Pizza',
    blurb:
      'A from-scratch yeasted 100% whole-wheat thin crust on a homemade ' +
      'moringa–amla green pesto, loaded with veg and paneer. My first ever pizza.',
    meta: '24 May 2026 · self-rated 8.5/10',
  },
  {
    path: '/cooking/roasted-veg',
    photo: { src: '/images/cooking/covers/s1_15_final_with_khichdi_cover.jpg', alt: 'Roasted vegetables served with khichdi' },
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
      >
        {/* Magazine-voice header, matching Home's "COOKING / 04" contents row */}
        <SectionHeader
          kicker="Cooking / 04"
          title="Cooking"
          accent="text-accent-cooking"
          standfirst="Learning to cook — documenting each dish from scratch, step by step."
        />
      </motion.div>

      {/* ─── Intro card ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="card-skin p-6 mb-8"
      >
        <p className="text-lg text-ink-muted">
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
            className="block card-skin tile-skin overflow-hidden"
          >
            {/* Finished-dish photo strip. overflow-hidden on the card clips it
                to the card's corners (4px ☀ / 14px 🌙). aspect-[4/3] reserves
                the space before the photo arrives (no layout jump); the
                covers are already 4:3, and object-cover is a safety net if a
                future one isn't. The bottom edge reuses --card-border: a 3px
                ink rule ☀ / 1px faint hairline 🌙. loading="lazy" = fetched
                only as the card nears the screen (~70–100 KB each). */}
            <img
              src={r.photo.src}
              alt={r.photo.alt}
              loading="lazy"
              decoding="async"
              className="block w-full aspect-[4/3] object-cover"
              style={{ borderBottom: 'var(--card-border)' }}
            />
            <div className="p-6">
              <h3 className="display-skin text-lg leading-tight text-ink mb-4">{r.title}</h3>
              <p className="text-ink-muted">{r.blurb}</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                <span className="font-labmono text-xs text-ink-muted whitespace-nowrap">{r.meta}</span>
                <span className="flex items-center shrink-0 font-labmono text-xs font-bold tracking-widest uppercase text-ink">
                  View recipe
                  <svg className="w-4 h-4 ml-1 text-accent-cooking" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </PageWrapper>
  );
};

export default Cooking;
