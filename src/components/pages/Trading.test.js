/**
 * L1 test — the Trading page carries a real link to the
 * "Investing, from zero" story-game (keyboard-accessible, crawlable <a>).
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Trading from './Trading';

// jsdom has no IntersectionObserver, but the page's two analysis cards
// (Framer `whileInView`) create one on mount. A do-nothing stand-in is enough —
// same approach as Home.test.js. Scoped to this file.
beforeAll(() => {
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

test('Trading page links to the Investing, from zero game', () => {
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/trading']}>
        <Trading />
      </MemoryRouter>
    </HelmetProvider>
  );
  // The whole card is one link; its accessible name includes the card title
  const link = screen.getByRole('link', { name: /Investing, from zero/i });
  expect(link).toHaveAttribute('href', '/trading/investing-from-zero');
});
