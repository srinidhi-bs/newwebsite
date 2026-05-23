/**
 * SEO.test.js
 *
 * Verifies the SEO component actually injects the route's <title> and meta
 * description into the document head via react-helmet-async. This is the
 * regression guard for the IT-8 requirement that the Income Tax Calculator's
 * meta mentions BOTH FY 2026-27 and FY 2025-26.
 *
 * Why a test (and not a browser check): react-helmet-async flushes head changes
 * inside requestAnimationFrame (lib/index.js). The Claude preview runs in a
 * HIDDEN tab, where browsers throttle rAF, so the flush never fires there and the
 * head looks empty — a preview artifact, not a bug. jsdom fires rAF on a normal
 * timer with no visibility throttling, so here the flush runs and document.title
 * settles asynchronously (waitFor polls until it does), giving a deterministic,
 * environment-independent check that SEO renders.
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import '@testing-library/jest-dom';

import SEO from './SEO';

describe('SEO — react-helmet-async head injection', () => {
  test('Income Tax Calculator meta mentions both FY 2026-27 and FY 2025-26', async () => {
    render(
      <HelmetProvider>
        <SEO routeKey="/finance/income-tax-calculator" />
      </HelmetProvider>
    );

    // Helmet flushes on rAF, so the title arrives a tick after render.
    await waitFor(() => expect(document.title).toMatch(/FY 2026-27/));

    // Title and description should reference BOTH financial years (IT-8).
    expect(document.title).toMatch(/2025-26/);

    const desc = document
      .querySelector('meta[name="description"]')
      ?.getAttribute('content') || '';
    expect(desc).toMatch(/2026-27/);
    expect(desc).toMatch(/2025-26/);
  });

  test('falls back to default title for an unknown route', async () => {
    render(
      <HelmetProvider>
        <SEO routeKey="/no/such/route" />
      </HelmetProvider>
    );
    // defaults.title is "Srinidhi BS — Finance, Tech & Trading"
    await waitFor(() => expect(document.title).toMatch(/Srinidhi BS/));
  });
});
