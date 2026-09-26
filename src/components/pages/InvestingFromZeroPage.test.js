/**
 * E3 tests — the whole game loop on the real page:
 *   map → tap a part → story → finish → back on the map, next part unlocked,
 *   plus the "locked → open anyway" and "coming soon" bottom sheet.
 * Uses its own fake sittings (mocked content file), so these tests don't
 * break when the real story text is written.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import InvestingFromZeroPage from './InvestingFromZeroPage';
import ui from '../../content/investing/en/ui';

jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return { ...actual, AnimatePresence: ({ children }) => <>{children}</>, useReducedMotion: () => true };
});

jest.mock('../../content/investing/en/sittings', () => {
  const stub = (n) => ({ id: `sitting-${n}`, number: n, title: `Title ${n}`, mapLabel: `Label ${n}`, mapSub: 'sub', beats: [] });
  return {
    __esModule: true,
    default: [
      { id: 'sitting-1', number: 1, title: 'Title 1', beats: [{ id: 'a', type: 'narration', text: 'Hello one' }] },
      { id: 'sitting-2', number: 2, title: 'Title 2', beats: [{ id: 'b', type: 'narration', text: 'Hello two' }] },
      stub(3), stub(4), stub(5), stub(6), stub(7),
    ],
    mapWords: {
      me: 'Me', earn: 'Earn', spend: 'Spend', save: 'Save', why: 'Why?', where: 'Where?',
      whereList: ['Cash', 'FD', 'Debt', 'Equity', 'Gold'], equityIndex: 3,
    },
  };
});

const renderPage = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/trading/investing-from-zero']}>
        <InvestingFromZeroPage />
      </MemoryRouter>
    </HelmetProvider>
  );

const part = (n) => screen.getByTestId(`map-sitting-${n}`);

beforeEach(() => {
  window.localStorage.clear();
  window.scrollTo = jest.fn();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

test('fresh reader: sitting 1 playable, sitting 2 locked, unwritten ones "soon"', () => {
  renderPage();
  expect(part(1)).toHaveAttribute('data-state', 'current');
  expect(part(2)).toHaveAttribute('data-state', 'locked');
  expect(part(3)).toHaveAttribute('data-state', 'soon');
  expect(part(1)).toHaveAttribute('aria-label', expect.stringContaining('Title 1'));
});

test('full loop: play sitting 1 → finish → back on the map, sitting 2 unlocked + celebration', () => {
  renderPage();
  fireEvent.click(part(1));
  expect(screen.getByText('Hello one')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: ui.finish }));

  expect(screen.getByTestId('celebration')).toHaveTextContent('Title 1');
  expect(screen.getByTestId('celebration')).toHaveTextContent('Title 2');
  expect(part(1)).toHaveAttribute('data-state', 'done');
  expect(part(2)).toHaveAttribute('data-state', 'current');
});

test('"← Map" button in the story returns to the map', () => {
  renderPage();
  fireEvent.click(part(1));
  fireEvent.click(screen.getByRole('button', { name: ui.backToMapShort }));
  expect(part(1)).toBeInTheDocument();
});

test('locked part → bottom sheet → "open it anyway" plays it', () => {
  renderPage();
  fireEvent.click(part(2));
  expect(screen.getByTestId('map-prompt')).toHaveTextContent(ui.lockedTitle);
  expect(screen.getByTestId('map-prompt')).toHaveTextContent('Title 1'); // "opens after Title 1"
  fireEvent.click(screen.getByRole('button', { name: ui.openAnyway }));
  expect(screen.getByText('Hello two')).toBeInTheDocument();
});

test('coming-soon part says so and can be dismissed', () => {
  renderPage();
  fireEvent.click(part(3));
  expect(screen.getByTestId('map-prompt')).toHaveTextContent(ui.soonTitle);
  expect(screen.queryByRole('button', { name: ui.openAnyway })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: ui.cancel }));
  expect(screen.queryByTestId('map-prompt')).not.toBeInTheDocument();
});

test('keyboard: Enter on a map part opens it', () => {
  renderPage();
  fireEvent.keyDown(part(1), { key: 'Enter' });
  expect(screen.getByText('Hello one')).toBeInTheDocument();
});
