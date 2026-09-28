/**
 * S2 engine pieces: the race (RaceBeat) and the comparison cards (CompareBeat).
 * Tiny test data (not the real sitting), so these keep passing while the
 * story text changes.
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import RaceBeat, { formatLakh } from './RaceBeat';
import CompareBeat from './CompareBeat';
import ui from '../../../content/investing/en/ui';

let mockReduced = false;
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return { ...actual, useReducedMotion: () => mockReduced };
});

const race = {
  id: 'r', type: 'race', kicker: '2000 ▶ 2002',
  labels: ['2000', '2001', '2002'],
  scaleMax: 10,
  priceLine: { label: 'Prices', values: [1, 1.1, 1.2] },
  runners: [
    { id: 'cash', icon: '🗄️', label: 'Cupboard', color: 'stone', values: [1, 1, 1] },
    { id: 'gold', icon: '🪙', label: 'Gold', color: 'amber', values: [1, 3, 12] },
    { id: 'land', icon: '🏠', label: 'Land', color: 'emerald', finalOnly: 150, note: 'No price until you sell' },
  ],
  events: [{ at: '2001', text: 'Gold starts to climb.' }],
  reveal: 'Race over.',
};

beforeEach(() => {
  mockReduced = false;
  jest.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks(); });

test('formatLakh speaks like a reader: lakh, one decimal under 10, crore above 100', () => {
  expect(formatLakh(1)).toBe('₹1 lakh');
  expect(formatLakh(2.503)).toBe('₹2.5 lakh');
  expect(formatLakh(22.466)).toBe('₹22 lakh');
  expect(formatLakh(150)).toBe('₹1.5 crore');
});

test('before the start: year 2000, land shows "?" and its no-price note', () => {
  render(<RaceBeat beat={race} answer={undefined} onAnswer={() => {}} ui={ui} />);
  expect(screen.getByTestId('race-year')).toHaveTextContent('2000');
  expect(screen.getByTestId('race-value-land')).toHaveTextContent('?');
  expect(screen.getByText('No price until you sell')).toBeInTheDocument();
});

test('the race ticks year by year, narrates events, then saves "watched" at the finish', () => {
  jest.useFakeTimers();
  const onAnswer = jest.fn();
  render(<RaceBeat beat={race} answer={undefined} onAnswer={onAnswer} ui={ui} />);
  fireEvent.click(screen.getByRole('button', { name: ui.raceStart }));
  act(() => { jest.advanceTimersByTime(550); });
  expect(screen.getByTestId('race-year')).toHaveTextContent('2001');
  expect(screen.getByTestId('race-note')).toHaveTextContent('Gold starts to climb.');
  expect(screen.getByTestId('race-value-gold')).toHaveTextContent('₹3 lakh');
  act(() => { jest.advanceTimersByTime(550); });
  expect(screen.getByTestId('race-year')).toHaveTextContent('2002');
  expect(onAnswer).toHaveBeenCalledWith('watched');
});

test('the finish: land jumps to its value, big values are marked off the chart', () => {
  render(<RaceBeat beat={race} answer="watched" onAnswer={() => {}} ui={ui} />);
  expect(screen.getByTestId('race-value-land')).toHaveTextContent('₹1.5 crore');
  expect(screen.getByTestId('race-value-gold')).toHaveTextContent('₹12 lakh');
  expect(screen.getAllByText(ui.raceOffChart)).toHaveLength(2); // gold 12 > 10, land 150
  expect(screen.getByText('Race over.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: ui.raceReplay })).toBeInTheDocument();
});

test('Skip jumps straight to the finish', () => {
  jest.useFakeTimers();
  const onAnswer = jest.fn();
  render(<RaceBeat beat={race} answer={undefined} onAnswer={onAnswer} ui={ui} />);
  fireEvent.click(screen.getByRole('button', { name: ui.raceStart }));
  fireEvent.click(screen.getByRole('button', { name: ui.raceSkip }));
  expect(screen.getByTestId('race-year')).toHaveTextContent('2002');
  expect(onAnswer).toHaveBeenCalledWith('watched');
});

test('reduced motion: Start goes straight to the finish (no animation)', () => {
  mockReduced = true;
  const onAnswer = jest.fn();
  render(<RaceBeat beat={race} answer={undefined} onAnswer={onAnswer} ui={ui} />);
  fireEvent.click(screen.getByRole('button', { name: ui.raceStart }));
  expect(screen.getByTestId('race-year')).toHaveTextContent('2002');
  expect(onAnswer).toHaveBeenCalledWith('watched');
});

test('CompareBeat: one card per place, every question answered, footer shown', () => {
  const beat = {
    id: 'c', type: 'compare', kicker: 'THE CATCH',
    columns: [{ key: 'grow', label: 'Beat prices?' }, { key: 'safe', label: 'How safe?' }],
    rows: [
      { icon: '🏦', label: 'Savings account', grow: '❌ No', safe: 'Very safe' },
      { icon: '📈', label: 'Shares', grow: '✅ Yes', safe: 'Can fall by half' },
    ],
    footer: 'Every choice gives up something.',
  };
  render(<CompareBeat beat={beat} />);
  expect(screen.getByTestId('compare-cards').children).toHaveLength(2);
  expect(screen.getByText('Can fall by half')).toBeInTheDocument();
  expect(screen.getAllByText('Beat prices?')).toHaveLength(2);
  expect(screen.getByText('Every choice gives up something.')).toBeInTheDocument();
});
