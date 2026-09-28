/**
 * trackEvent — the safe doorway to Umami (Session 52).
 * It must hand events to Umami when present and NEVER break the page when
 * Umami is missing (tests, ad blockers) or throws.
 */
import { trackEvent } from './analytics';

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
  delete window.umami;
  jest.restoreAllMocks();
});

test('quietly skips when Umami is not loaded', () => {
  expect(trackEvent('ifz-sitting-start', { sitting: 1 })).toBe(false);
});

test('hands the event and its data to umami.track', () => {
  window.umami = { track: jest.fn() };
  expect(trackEvent('ifz-sitting-start', { sitting: 1 })).toBe(true);
  expect(window.umami.track).toHaveBeenCalledWith('ifz-sitting-start', { sitting: 1 });
});

test('a failing tracker never throws into the page', () => {
  window.umami = { track: () => { throw new Error('blocked'); } };
  expect(() => trackEvent('ifz-screen', { at: 'S1 · 01/10' })).not.toThrow();
  expect(trackEvent('ifz-screen', { at: 'S1 · 01/10' })).toBe(false);
});
