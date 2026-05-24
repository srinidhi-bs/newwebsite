/**
 * RecipeBits.js — shared building blocks for cooking recipe pages.
 *
 * WHY THIS FILE EXISTS
 *   Each recipe page (the moringa pizza, the roasted veg, and whatever comes
 *   next) tells the same SHAPE of story: a heading, an intro card with little
 *   "at a glance" chips, a few photo-story sections, then a full recipe with
 *   ingredient tables and numbered method steps.
 *
 *   The *mechanics* of rendering those pieces are identical from recipe to
 *   recipe — only the *content* (the prose, the photos, the numbers) changes.
 *   So we keep the mechanics here as small, reusable components and let each
 *   recipe page just supply content. Adding a new recipe then becomes mostly
 *   writing words + listing photos, not rebuilding the layout every time.
 *
 *   (This mirrors how the Finance section keeps its calculators in
 *   src/components/finance/ and the page wrappers in src/components/pages/.)
 *
 * Everything here is dark-mode aware (Tailwind `dark:` classes) and reuses the
 * same card look + scroll animations as the rest of the site.
 */

import React from 'react';
import { motion } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// Shared styling tokens
// ─────────────────────────────────────────────────────────────────────────────

// The standard "card" look used for every block on a recipe page: white in
// light mode, dark grey in dark mode, rounded corners, soft shadow, subtle border.
export const cardClass =
  'bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 ' +
  'border border-gray-100 dark:border-gray-700';

// Framer Motion preset: fade + slide up *as the card scrolls into view*.
// `viewport.once: true` means it animates only the first time, not on every
// scroll past. We spread this onto each scrolling <section>.
export const sectionMotion = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.6 },
};

// ─────────────────────────────────────────────────────────────────────────────
// PhotoGrid — a responsive masonry of photos (or one centred photo)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Shows the WHOLE photo (never cropped). Multiple photos lay out in a ROW-MAJOR
 * grid (grid-cols-2 md:grid-cols-3) so step-by-step photos read left-to-right, top
 * to bottom — i.e. in story order. A lone photo is centred at a comfortable size.
 *
 * @param {{ photos: { src:string, alt:string, caption?:string }[] }} props
 */
export const PhotoGrid = ({ photos }) => {
  // Nothing to show (e.g. a text-only section) → render nothing.
  if (!photos || photos.length === 0) return null;

  // A lone photo looks awkward squeezed into one masonry column, so when there
  // is only one we centre it at a comfortable size instead.
  if (photos.length === 1) {
    const p = photos[0];
    return (
      <figure className="max-w-2xl mx-auto mt-4">
        <img src={p.src} alt={p.alt} className="w-full h-auto rounded-lg shadow-sm" loading="lazy" />
        {p.caption && (
          <figcaption className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
            {p.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    // Row-major grid (not a masonry) so step photos read left-to-right in order.
    // `items-start` keeps each photo at the top of its cell (no stretching); photos
    // of different shapes may leave small gaps below — the price of true sequence.
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 items-start">
      {photos.map((p) => (
        <figure key={p.src}>
          <img src={p.src} alt={p.alt} className="w-full h-auto rounded-lg shadow-sm" loading="lazy" />
          {p.caption && (
            <figcaption className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-0.5">
              {p.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AtAGlance — the row of small green "fact" chips (serves, time, verdict…)
// ─────────────────────────────────────────────────────────────────────────────
export const AtAGlance = ({ facts }) => (
  <div className="flex flex-wrap gap-2 mt-5">
    {facts.map((fact) => (
      <span
        key={fact}
        className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      >
        {fact}
      </span>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// RecipeHero — page heading + playful subtitle + intro card with chips
// ─────────────────────────────────────────────────────────────────────────────
/**
 * The top of a recipe page. Heading + intro animate ON MOUNT (they're above the
 * fold, so there's nothing to "scroll into view"), unlike the Sections below.
 *
 * @param props.title    main recipe title
 * @param props.subtitle the playful one-liner under the title
 * @param props.facts    array of "at a glance" chip strings
 * @param props.children the intro paragraphs — passed as JSX so inline <strong>
 *                       / <em> emphasis stays easy to write in each recipe page
 */
export const RecipeHero = ({ title, subtitle, facts, children }) => (
  <>
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-2 dark:text-gray-100">{title}</h2>
      {subtitle && <p className="text-lg text-gray-600 dark:text-gray-400">{subtitle}</p>}
    </motion.div>

    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className={cardClass}
    >
      {children}
      {facts && facts.length > 0 && <AtAGlance facts={facts} />}
    </motion.article>
  </>
);

// ─────────────────────────────────────────────────────────────────────────────
// Section — one story card: a heading, prose (children), then its photos
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param props.title    the section heading (e.g. "The dough")
 * @param props.photos   optional photos rendered as a PhotoGrid under the prose
 * @param props.children the prose for this section (JSX)
 */
export const Section = ({ title, photos, children }) => (
  <motion.section {...sectionMotion} className={`${cardClass} mt-8`}>
    <h3 className="text-2xl font-bold mb-3 dark:text-gray-100">{title}</h3>
    {children}
    <PhotoGrid photos={photos} />
  </motion.section>
);

// ─────────────────────────────────────────────────────────────────────────────
// Callout — a tinted, left-bordered box to highlight a tip / surprise / lesson
// ─────────────────────────────────────────────────────────────────────────────
export const Callout = ({ children }) => (
  <div className="mt-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 rounded-r-lg p-4 text-gray-700 dark:text-gray-300">
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Aside — a small italic "thinking out loud" line (the question I asked myself in
// the moment), set off with a left rule. Place it just before the answer/result
// so the page reads like the cook as it happened, not a tidy write-up afterwards.
// ─────────────────────────────────────────────────────────────────────────────
export const Aside = ({ children }) => (
  <p className="my-4 pl-4 border-l-2 border-gray-300 dark:border-gray-600 italic text-gray-500 dark:text-gray-400 leading-relaxed">
    {children}
  </p>
);

// ─────────────────────────────────────────────────────────────────────────────
// FancyMenu — a tongue-in-cheek "fine-dining menu" write-up of the dish.
// Pure comedy: describe a humble home-cooked plate as if it belonged on a 5-star
// tasting menu (gilded styling, serif italic), then undercut it with the credit
// line. The contrast with the real, homely photos above is the joke.
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param props.subtitle small deflating line under the heading (the joke setup)
 * @param props.children  the over-the-top "menu" description (fancy prose)
 * @param props.credit    the punchline credit line (e.g. "…& Sole Dishwasher: me")
 */
export const FancyMenu = ({ subtitle, children, credit }) => (
  <motion.section {...sectionMotion} className={`${cardClass} mt-8`}>
    <div className="text-center">
      <div className="text-amber-500 dark:text-amber-400 tracking-[0.4em] text-sm mb-2">★★★★★</div>
      <h3 className="text-2xl font-bold mb-1 dark:text-gray-100">If this were on a 5-star menu…</h3>
      {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-5">{subtitle}</p>}
    </div>
    <blockquote className="border-l-4 border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/15 rounded-r-lg p-5 md:p-6">
      <p className="font-serif italic text-lg leading-relaxed text-gray-700 dark:text-gray-200">{children}</p>
      {credit && <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{credit}</p>}
    </blockquote>
  </motion.section>
);

// ─────────────────────────────────────────────────────────────────────────────
// IngredientTable — a small two/three-column table of ingredients
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Generic so it can render either the pizza's 3-column crust table or the
 * 2-column pesto table — you just describe the columns you want.
 *
 * @param props.heading  e.g. "Crust — 1 personal pizza (~22 cm)"
 * @param props.columns  [{ key, label }] — which row fields to show, in order
 * @param props.rows     array of objects keyed by the column `key`s
 * @param props.note     optional small print shown under the table
 */
export const IngredientTable = ({ heading, columns, rows, note }) => (
  <>
    <h4 className="font-semibold mb-3 text-green-700 dark:text-green-300">{heading}</h4>
    <div className="overflow-x-auto mb-2">
      <table className="w-full text-sm text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {columns.map((c) => (
              <th key={c.key} className="py-2 pr-4 font-semibold dark:text-gray-100">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-gray-700 dark:text-gray-300">
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
              {columns.map((c) => (
                <td key={c.key} className="py-2 pr-4">
                  {row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {/* Keep a consistent gap below the table whether or not there's a note. */}
    {note ? (
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-8">{note}</p>
    ) : (
      <div className="mb-8" />
    )}
  </>
);

// ─────────────────────────────────────────────────────────────────────────────
// BulletList — a simple green-dotted list (e.g. toppings, lessons)
// ─────────────────────────────────────────────────────────────────────────────
export const BulletList = ({ heading, items }) => (
  <>
    {heading && (
      <h4 className="font-semibold mb-3 text-green-700 dark:text-green-300">{heading}</h4>
    )}
    <ul className="space-y-2 mb-8">
      {items.map((item, i) => (
        <li key={i} className="flex items-start text-gray-700 dark:text-gray-300">
          <span className="w-1.5 h-1.5 mt-2 mr-3 rounded-full bg-green-500 flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </>
);

// ─────────────────────────────────────────────────────────────────────────────
// MethodSteps — the numbered, staged method with optional "Why:" notes
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param props.method  [{ stage, steps: [{ do, why? }] }]
 * @param props.heading optional title above the steps (defaults to "Method")
 */
export const MethodSteps = ({ method, heading = 'Method' }) => (
  <>
    <h4 className="text-xl font-bold mb-5 dark:text-gray-100">{heading}</h4>
    <div className="space-y-6">
      {method.map((stage) => (
        <div key={stage.stage}>
          <h5 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">{stage.stage}</h5>
          <ol className="space-y-3">
            {stage.steps.map((step, i) => (
              <li key={i} className="flex">
                {/* The green numbered circle */}
                <span className="flex-shrink-0 w-6 h-6 mr-3 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs font-semibold flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="text-gray-700 dark:text-gray-300">
                  <p>{step.do}</p>
                  {step.why && (
                    <p className="text-sm italic text-gray-500 dark:text-gray-400 mt-1">
                      Why: {step.why}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  </>
);
