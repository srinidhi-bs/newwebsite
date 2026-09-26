/**
 * S1 engine pieces — "your own numbers" placeholders, the spend/save pie
 * (split) and the one-guess-six-reveals basket — played through the real
 * StoryPlayer. Uses its own test sitting, not the real content.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StoryPlayer from '../StoryPlayer';
import { STORAGE_KEY, loadProgress, useStoryProgress } from '../storyProgress';
import { fillBeat, formatRupees, deriveVars } from '../storyText';
import { basketMultiple } from './BasketBeat';
import ui from '../../../content/investing/en/ui';

jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return { ...actual, AnimatePresence: ({ children }) => <>{children}</>, useReducedMotion: () => true };
});

const Harness = (props) => {
  const [progress, setProgress] = useStoryProgress();
  return <StoryPlayer {...props} progress={progress} setProgress={setProgress} />;
};

const items = [
  { icon: 'A', label: 'Apple', then: 10, now: 50 },
  { icon: 'B', label: 'Bread', then: 30, now: 90 },
];

const sitting = {
  id: 'sitting-s1test',
  number: 9,
  title: 'S1 test',
  derive: (answers) => ({ save: formatRupees((10000 * (100 - (answers['sp'] ?? 80))) / 100) }),
  beats: [
    {
      id: 'sp', type: 'split', question: 'How much do you spend?', total: 10000,
      min: 40, max: 95, step: 5, start: 70, spendLabel: 'Spend', saveLabel: 'Save',
      reveal: 'You keep {save} a month.',
    },
    { id: 'n', type: 'narration', text: 'Into the cupboard: {save}.' },
    {
      id: 'bk', type: 'basket', question: 'How many times costlier?', thenLabel: '2000', nowLabel: '2026',
      totalLabel: 'Whole basket', items, input: { min: 1, max: 10, step: 0.5, start: 2, suffix: '×' },
      reveal: 'Basket reveal',
    },
  ],
};

const seed = (s) => window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, sittings: { 'sitting-s1test': s } }));

beforeEach(() => {
  window.localStorage.clear();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

// ── storyText ──────────────────────────────────────────────────────────────
test('fillBeat fills text everywhere but never touches ids/types; unknown stays visible', () => {
  const beat = { id: '{x}', type: 'choice', text: ['Hi {name}', 'Bye {nope}'], options: [{ id: 'a', label: '{name}!' }] };
  const out = fillBeat(beat, { name: 'Ravi', x: 'NO' });
  expect(out.id).toBe('{x}');
  expect(out.text).toEqual(['Hi Ravi', 'Bye {nope}']);
  expect(out.options[0]).toEqual({ id: 'a', label: 'Ravi!' });
});

test('formatRupees uses Indian grouping; a crashing derive() yields no vars', () => {
  expect(formatRupees(150000)).toBe('₹1,50,000');
  expect(deriveVars({ id: 's', derive: () => { throw new Error('bug'); } }, {})).toEqual({});
});

// ── split (spend/save pie) ─────────────────────────────────────────────────
test('split: legend follows the slider; lock saves spend % and the reveal uses the reader\'s own number', () => {
  render(<Harness sitting={sitting} ui={ui} />);
  expect(screen.getByRole('button', { name: new RegExp(ui.next) })).toBeDisabled();
  fireEvent.change(screen.getByRole('slider'), { target: { value: '75' } });
  expect(screen.getByTestId('split-legend')).toHaveTextContent('₹7,500');
  expect(screen.getByTestId('split-legend')).toHaveTextContent('₹2,500');

  fireEvent.click(screen.getByRole('button', { name: ui.lockSplit }));
  expect(loadProgress().sittings['sitting-s1test'].answers.sp).toBe(75);
  expect(screen.getByText('You keep ₹2,500 a month.')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: new RegExp(ui.next) }));
  expect(screen.getByText('Into the cupboard: ₹2,500.')).toBeInTheDocument();
});

// ── basket ─────────────────────────────────────────────────────────────────
test('basketMultiple = total now ÷ total then, 1 decimal', () => {
  expect(basketMultiple(items)).toBe(3.5); // 140 / 40
});

test('basket: new prices hidden until the guess is locked, then all revealed with the real multiple', () => {
  seed({ beatIndex: 2, completed: false, answers: { sp: 80 } });
  render(<Harness sitting={sitting} ui={ui} />);
  expect(screen.getByTestId('basket-table')).not.toHaveTextContent('₹50');
  fireEvent.change(screen.getByRole('slider'), { target: { value: '5' } });
  fireEvent.click(screen.getByRole('button', { name: ui.lockGuess }));
  expect(screen.getByTestId('basket-table')).toHaveTextContent('₹50');
  expect(screen.getByTestId('basket-table')).toHaveTextContent('₹90');
  expect(screen.getByTestId('basket-guess')).toHaveTextContent('5.0×'); // 0.5-steps → 1 decimal
  expect(screen.getByTestId('basket-actual')).toHaveTextContent('3.5×');
  expect(screen.getByText('Basket reveal')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: new RegExp(ui.finish) })).toBeEnabled();
});

test('basket shows each price\'s real date, keeps paise, and lists its sources', () => {
  const dated = {
    ...sitting,
    beats: [{
      ...sitting.beats[2],
      items: [{ icon: 'P', label: 'Petrol', then: 25.94, thenDate: 'Jan 2000', now: 94, nowDate: 'Sep 2026' }],
      sources: [{ text: 'Petrol, Delhi — test source', url: 'https://example.org/petrol' }],
    }],
  };
  render(<Harness sitting={dated} ui={ui} />);
  expect(screen.getByTestId('basket-table')).toHaveTextContent('₹25.94');
  expect(screen.getByTestId('basket-table')).toHaveTextContent('Jan 2000');
  expect(screen.getByRole('link', { name: 'Petrol, Delhi — test source' })).toHaveAttribute('href', 'https://example.org/petrol');
});
