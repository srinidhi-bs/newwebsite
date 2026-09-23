/**
 * Home masthead — typewriter line tests (Session 49)
 * ===========================================================================
 * The masthead's third line types CODES → COOKS → TRADES in a loop with a
 * blinking caret. These tests pin down:
 *   1. the loop order + each word's accent colour,
 *   2. the reduced-motion fallback (a still "CODES", no caret, no timers),
 *   3. the h1's accessible name (screen readers get one clean sentence).
 *
 * Timing note: the typewriter schedules ONE setTimeout per step, and each next
 * timer is only created after React re-renders. So we fire timers one at a
 * time (stepUntil), each inside act(), letting React flush between them.
 * ===========================================================================
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '../../context/ThemeContext';
import Home from './Home';

// Toggle reduced motion per test. (jest only lets a mock factory reference
// outer variables whose names start with "mock".)
let mockReduced = false;
jest.mock('framer-motion', () => ({
  ...jest.requireActual('framer-motion'),
  useReducedMotion: () => mockReduced,
}));

// jsdom has no IntersectionObserver, but Home's scroll-reveal sections
// (Framer `whileInView`) create one on mount. A do-nothing stand-in is enough
// here — these tests only care about the masthead. Scoped to this file.
beforeAll(() => {
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

/** Advance the fake clock `ms` milliseconds in 20ms slices, flushing React. */
const tick = (ms) => {
  for (let t = 0; t < ms; t += 20) {
    act(() => {
      jest.advanceTimersByTime(20);
    });
  }
};

/**
 * Fire the typewriter's timers one at a time (flushing React after each, so
 * the next timer gets scheduled) until the line shows `word`. Fails if it
 * never gets there within `maxSteps` — i.e. the loop is stuck or skips it.
 * (maxSteps is generous because other timers — the 1 Hz clock, Framer's
 * animation frames — also count as steps.)
 */
const stepUntil = (line, word, maxSteps = 2000) => {
  for (let i = 0; i < maxSteps && line.textContent !== word; i++) {
    act(() => {
      jest.advanceTimersToNextTimer();
    });
  }
  expect(line.textContent).toBe(word);
};

/** Render Home with the providers it needs and return the typewriter span. */
const renderHome = () => {
  render(
    <HelmetProvider>
      <ThemeProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </ThemeProvider>
    </HelmetProvider>
  );
  const h1 = screen.getByRole('heading', { level: 1 });
  // h1 children: [ACCOUNTANT line, WHO line, typewriter line]
  return { h1, line: h1.children[2].firstElementChild };
};

beforeEach(() => {
  jest.useFakeTimers();
  mockReduced = false;
});

afterEach(() => {
  jest.useRealTimers();
});

test('h1 reads as one clean sentence for screen readers', () => {
  const { h1 } = renderHome();
  expect(h1).toHaveAttribute('aria-label', 'Srinidhi BS — an accountant who codes, cooks and trades');
});

test('types CODES → COOKS → TRADES → CODES, each in its own accent colour', () => {
  const { line } = renderHome();

  // Starts empty (only the caret), then types CODES letter by letter.
  expect(line.textContent).toBe('');
  stepUntil(line, 'C');
  stepUntil(line, 'CODES');
  expect(line).toHaveClass('text-accent-cta');

  // Backspaces all the way to empty before the next word appears.
  stepUntil(line, '');
  stepUntil(line, 'COOKS');
  expect(line).toHaveClass('text-accent-cooking');

  stepUntil(line, 'TRADES');
  expect(line).toHaveClass('text-accent-trading');

  // …and it wraps back round to CODES.
  stepUntil(line, 'CODES');
  expect(line).toHaveClass('text-accent-cta');
});

test('reduced motion: a still CODES with no caret, and it never changes', () => {
  mockReduced = true;
  const { line } = renderHome();

  expect(line.textContent).toBe('CODES');
  expect(line.children).toHaveLength(0); // no caret element at all

  tick(12000); // longer than a full cycle
  expect(line.textContent).toBe('CODES');
});
