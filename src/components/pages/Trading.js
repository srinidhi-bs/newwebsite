import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PageWrapper from '../layout/PageWrapper';
import SEO from '../common/SEO';

const Trading = () => {
  return (
    <PageWrapper>
      <SEO routeKey="/trading" />
      <div className="min-h-screen">
        {/* Section 1: Hero / Header */}
        <div className="py-16 md:py-24 flex flex-col items-center justify-center text-center">
          {/* Mono kicker — same voice as Home's "TRADING / 02" contents row */}
          <p className="font-labmono text-xs tracking-widest uppercase mb-3 text-accent-trading">
            Trading / 02
          </p>
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="display-skin text-ink leading-tight mb-4" style={{ fontSize: 'clamp(2.25rem, 7vw, 4.5rem)' }}
          >
            Trading
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="font-labmono text-xs tracking-widest uppercase text-ink-muted animate-bounce mt-8"
          >
            ↓ Scroll to explore
          </motion.p>
        </div>

        {/* Section 2: Animated Verticals */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 relative">

            {/* Fundamental Analysis - Slides in from Left */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ margin: "-50px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="card-skin p-8"
            >
              <div className="h-12 w-12 bg-accent-trading/15 rounded-card flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-accent-trading" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="display-skin text-xl leading-tight text-ink mb-4">Fundamental Analysis</h3>
              <p className="text-ink-muted leading-relaxed mb-6">
                Deep dive into company financials, business models, and industry trends to identify long-term value investments.
              </p>
              <ul className="space-y-3 text-ink-muted">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-accent-trading mr-3"></span>
                  Balance Sheet Analysis
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-accent-trading mr-3"></span>
                  Ratio Analysis
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-accent-trading mr-3"></span>
                  Management Quality
                </li>
              </ul>
            </motion.div>

            {/* Technical Analysis - Slides in from Right */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ margin: "-50px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="card-skin p-8"
            >
              <div className="h-12 w-12 bg-accent-tools/15 rounded-card flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-accent-tools" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="display-skin text-xl leading-tight text-ink mb-4">Technical Analysis</h3>
              <p className="text-ink-muted leading-relaxed mb-6">
                Analyze price action, chart patterns, and market indicators to time your entries and exits with precision.
              </p>
              <ul className="space-y-3 text-ink-muted">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-accent-tools mr-3"></span>
                  Chart Patterns
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-accent-tools mr-3"></span>
                  Indicators & Oscillators
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-accent-tools mr-3"></span>
                  Price Action Strategy
                </li>
              </ul>
            </motion.div>

          </div>

          {/* Section 3: "Investing, from zero" — the beginner story-game (L1).
              A real <Link> (not an onClick div), like the Cooking tiles, so
              it is keyboard-accessible and crawlable. A plain element, not a
              motion.div: tile-skin's hover lift is a CSS transform, and
              Framer's inline transform would clobber it. The picture is the
              same notebook image WhatsApp shows for the page's link
              (scripts/make_share_image.py), so the card and the share
              preview look alike. */}
          <Link
            to="/trading/investing-from-zero"
            className="mt-8 md:mt-12 block card-skin tile-skin overflow-hidden md:flex"
          >
            {/* 1200×630 image; aspect-[40/21] reserves its space before it
                loads (no layout jump); lazy = fetched only near the screen */}
            <img
              src="/images/investing/og-investing-from-zero.png"
              alt="A notebook page reading 'Investing, from zero' with seven numbered sittings"
              loading="lazy"
              decoding="async"
              className="block w-full md:w-1/2 aspect-[40/21] object-cover"
            />
            <div className="p-8 md:w-1/2 flex flex-col justify-center">
              <p className="font-labmono text-xs tracking-widest uppercase mb-3 text-accent-trading">
                New · A story-game
              </p>
              <h3 className="display-skin text-xl leading-tight text-ink mb-4">Investing, from zero</h3>
              <p className="text-ink-muted leading-relaxed mb-6">
                Never invested before? Seven short sittings take you from money and
                inflation to the stock market and mutual funds. No jargon, no fund tips.
              </p>
              <span className="flex items-center font-labmono text-xs font-bold tracking-widest uppercase text-ink">
                Start playing
                <svg className="w-4 h-4 ml-1 text-accent-trading" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Trading;