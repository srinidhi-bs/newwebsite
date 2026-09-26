/**
 * E2 tests — guess + choice screens, played through the real StoryPlayer
 * (so the "Next stays locked until you answer" rule and the saving of
 * answers are tested together with the screens themselves).
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StoryPlayer from '../StoryPlayer';
import { STORAGE_KEY, loadProgress } from '../storyProgress';
import ui from '../../../content/investing/en/ui';

// Reduced motion ON: the count-up jumps straight to the final number, and
// AnimatePresence renders children straight through (jsdom runs no animations).
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return { ...actual, AnimatePresence: ({ children }) => <>{children}</>, useReducedMotion: () => true };
});

const sitting = {
  id: 'sitting-e2',
  number: 9,
  title: 'E2 test',
  beats: [
    {
      id: 'g-slider', type: 'guess', question: 'How much today?',
      input: { kind: 'slider', min: 10, max: 200, step: 5, start: 20, prefix: '₹', suffix: '' },
      answer: 150000 / 1000, reveal: 'Slider reveal text',
    },
    {
      id: 'g-options', type: 'guess', question: 'Which is true?',
      input: { kind: 'options', options: [{ id: 'a', label: 'Option A' }, { id: 'b', label: 'Option B' }] },
      answer: 'b', reveal: 'Options reveal text',
    },
    {
      id: 'c-choice', type: 'choice', text: 'Sell or hold?',
      options: [
        { id: 'sell', label: 'SELL', consequence: 'You sold.' },
        { id: 'hold', label: 'HOLD', consequence: 'You held.' },
      ],
    },
  ],
};

const seed = (s) => window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, sittings: { 'sitting-e2': s } }));
const nextBtn = () => screen.getByRole('button', { name: new RegExp(`${ui.next}|${ui.finish}`) });

beforeEach(() => {
  window.localStorage.clear();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

test('slider guess: Next locked → drag + lock → shows guess vs actual + reveal, Next unlocks, saved', () => {
  render(<StoryPlayer sitting={sitting} ui={ui} />);
  expect(nextBtn()).toBeDisabled();
  expect(screen.getByText(ui.answerFirst)).toBeInTheDocument();

  fireEvent.change(screen.getByRole('slider', { name: 'How much today?' }), { target: { value: '40' } });
  fireEvent.click(screen.getByRole('button', { name: ui.lockGuess }));

  expect(screen.getByTestId('guess-yours')).toHaveTextContent('₹40');
  expect(screen.getByTestId('guess-actual')).toHaveTextContent('₹150');
  expect(screen.getByText('Slider reveal text')).toBeInTheDocument();
  expect(nextBtn()).toBeEnabled();
  expect(loadProgress().sittings['sitting-e2'].answers['g-slider']).toBe(40);
});

test('a locked guess survives a reload (no re-guessing with hindsight)', () => {
  seed({ beatIndex: 0, completed: false, answers: { 'g-slider': 60 } });
  render(<StoryPlayer sitting={sitting} ui={ui} />);
  expect(screen.getByTestId('guess-yours')).toHaveTextContent('₹60');
  expect(screen.queryByRole('button', { name: ui.lockGuess })).not.toBeInTheDocument();
});

test('options guess: wrong pick gets ✗, right answer gets ✓, options lock', () => {
  seed({ beatIndex: 1, completed: false, answers: { 'g-slider': 60 } });
  render(<StoryPlayer sitting={sitting} ui={ui} />);
  expect(nextBtn()).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Option A' }));
  expect(screen.getByRole('button', { name: 'Option A ✗' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Option B ✓' })).toBeInTheDocument();
  expect(screen.getByText('Options reveal text')).toBeInTheDocument();
  expect(nextBtn()).toBeEnabled();
});

test('choice: shows only the chosen consequence, locks, and Finish works', () => {
  seed({ beatIndex: 2, completed: false, answers: {} });
  render(<StoryPlayer sitting={sitting} ui={ui} />);
  expect(nextBtn()).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'HOLD' }));
  expect(screen.getByText('You held.')).toBeInTheDocument();
  expect(screen.queryByText('You sold.')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'SELL' })).toBeDisabled();
  fireEvent.click(nextBtn());
  expect(screen.getByText(ui.completeTitle)).toBeInTheDocument();
});

test('Play again wipes the answers so every guess can be made afresh', () => {
  seed({ beatIndex: 2, completed: true, answers: { 'g-slider': 60, 'c-choice': 'hold' } });
  render(<StoryPlayer sitting={sitting} ui={ui} />);
  fireEvent.click(screen.getByRole('button', { name: ui.playAgain }));
  expect(screen.getByRole('button', { name: ui.lockGuess })).toBeInTheDocument();
  expect(loadProgress().sittings['sitting-e2'].answers).toEqual({});
});
