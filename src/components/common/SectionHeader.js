/**
 * SectionHeader — the shared heading block for the section landing pages
 * (Finance, Trading, Tools, Cooking, Contact). Session 49 landing restyle.
 *
 * Why it exists: the Home page talks in a magazine voice (mono kicker line in
 * the section's accent colour + big display-font title). Before this, every
 * landing page had a plain grey "text-2xl font-bold" heading, so clicking from
 * Home felt like arriving on a different website. One shared block keeps all
 * five pages speaking the same voice — and gives one place to tune it later.
 *
 * Example:
 *   <SectionHeader kicker="FINANCE / 01" title="Finance Tools"
 *                  accent="text-accent-finance"
 *                  standfirst="Calculators I built to answer my own questions." />
 *   renders (Playground ☀):
 *     FINANCE / 01                 ← small mono line, section colour
 *     FINANCE TOOLS                ← Archivo Black, uppercase (display-skin)
 *     Calculators I built…         ← muted body text
 *   and in the Laboratory 🌙 the same markup becomes sentence-case Space
 *   Grotesk with the cyan-family accent — for free, via the tokens.
 *
 * The title stays an <h2> (unchanged from the old headings) — this restyle
 * deliberately doesn't change heading levels / SEO structure.
 *
 * @param {string} kicker      - the small mono line, e.g. "FINANCE / 01"
 * @param {string} title       - the page title
 * @param {string} accent      - accent text class for the kicker, e.g. "text-accent-finance"
 * @param {React.ReactNode} [standfirst] - optional one-line intro under the title
 */

import React from 'react';

const SectionHeader = ({ kicker, title, accent, standfirst }) => (
  <header className="mb-8">
    <p className={`font-labmono text-xs tracking-widest uppercase mb-2 ${accent}`}>
      {kicker}
    </p>
    <h2
      className="display-skin text-ink leading-tight"
      style={{ fontSize: 'clamp(1.9rem, 5vw, 3.25rem)' }}
    >
      {title}
    </h2>
    {standfirst && (
      <p className="text-ink-muted mt-2 text-base sm:text-lg max-w-2xl">{standfirst}</p>
    )}
  </header>
);

export default SectionHeader;
