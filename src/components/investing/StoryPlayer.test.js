/**
 * StoryPlayer tests — the engine of Investing, from zero (E1)
 * Uses its own tiny test sitting (not the real content file), so these tests
 * keep passing while the real story text changes session by session.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StoryPlayer from './StoryPlayer';
import { STORAGE_KEY, loadProgress } from './storyProgress';
import ui from '../../content/investing/en/ui';

// AnimatePresence mode="wait" holds the new beat back until the old one's
// exit animation finishes — jsdom doesn't run those animations, so render
// children straight through. (Everything else in framer-motion stays real.)
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return { ...actual, AnimatePresence: ({ children }) => <>{children}</> };
});

const testSitting = {
  id: 'sitting-test',
  number: 9,
  title: 'Test sitting',
  beats: [
    { id: 't-1', type: 'narration', kicker: 'JAN 2000', text: 'First screen' },
    { id: 't-2', type: 'narration', text: ['Second screen', 'with two paragraphs'] },
    { id: 't-3', type: 'narration', text: 'Third screen' },
  ],
};

const seed = (sittings) =>
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, sittings }));

beforeEach(() => {
  window.localStorage.clear();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

test('starts on the first beat with Back disabled', () => {
  render(<StoryPlayer sitting={testSitting} ui={ui} />);
  expect(screen.getByText('First screen')).toBeInTheDocument();
  expect(screen.getByText('JAN 2000')).toBeInTheDocument();
  expect(screen.getByTestId('beat-counter')).toHaveTextContent('1 / 3');
  expect(screen.getByRole('button', { name: ui.back })).toBeDisabled();
});

test('Next and Back move between beats and the place is saved', () => {
  render(<StoryPlayer sitting={testSitting} ui={ui} />);
  fireEvent.click(screen.getByRole('button', { name: ui.next }));
  expect(screen.getByText('with two paragraphs')).toBeInTheDocument();
  expect(screen.getByTestId('beat-counter')).toHaveTextContent('2 / 3');
  expect(loadProgress().sittings['sitting-test'].beatIndex).toBe(1);

  fireEvent.click(screen.getByRole('button', { name: ui.back }));
  expect(screen.getByText('First screen')).toBeInTheDocument();
});

test('returning reader resumes where they left off', () => {
  seed({ 'sitting-test': { beatIndex: 2, completed: false } });
  render(<StoryPlayer sitting={testSitting} ui={ui} />);
  expect(screen.getByText('Third screen')).toBeInTheDocument();
});

test('a saved place beyond the end falls back to the last beat', () => {
  seed({ 'sitting-test': { beatIndex: 99, completed: false } });
  render(<StoryPlayer sitting={testSitting} ui={ui} />);
  expect(screen.getByTestId('beat-counter')).toHaveTextContent('3 / 3');
});

test('finishing shows the end card, saves completed, and calls onComplete', () => {
  seed({ 'sitting-test': { beatIndex: 2, completed: false } });
  const onComplete = jest.fn();
  render(<StoryPlayer sitting={testSitting} ui={ui} onComplete={onComplete} />);
  fireEvent.click(screen.getByRole('button', { name: ui.finish }));
  expect(screen.getByText(ui.completeTitle)).toBeInTheDocument();
  expect(loadProgress().sittings['sitting-test'].completed).toBe(true);
  expect(onComplete).toHaveBeenCalledWith('sitting-test');
});

test('Play again restarts at beat 1 but keeps the sitting completed', () => {
  seed({ 'sitting-test': { beatIndex: 2, completed: true } });
  render(<StoryPlayer sitting={testSitting} ui={ui} />);
  fireEvent.click(screen.getByRole('button', { name: ui.playAgain }));
  expect(screen.getByText('First screen')).toBeInTheDocument();
  expect(loadProgress().sittings['sitting-test']).toEqual({ beatIndex: 0, completed: true, answers: {} });
});

test('a sitting with no beats renders nothing instead of crashing', () => {
  const { container } = render(<StoryPlayer sitting={{ ...testSitting, beats: [] }} ui={ui} />);
  expect(container).toBeEmptyDOMElement();
});

test('an unknown beat type shows a fallback instead of crashing', () => {
  const broken = { ...testSitting, beats: [{ id: 'x', type: 'naration', text: 'typo' }] };
  render(<StoryPlayer sitting={broken} ui={ui} />);
  expect(screen.getByText(ui.unknownBeat)).toBeInTheDocument();
});
