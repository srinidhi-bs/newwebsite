/**
 * storyProgress tests — the "bookmark" of Investing, from zero (E1)
 * Pins down: fresh start, save→load round trip, corrupt/blocked storage never
 * crashes, defaults for unseen sittings, and immutable updates.
 */
import {
  STORAGE_KEY,
  emptyProgress,
  loadProgress,
  saveProgress,
  getSittingProgress,
  updateSitting,
  isSittingUnlocked,
  isSittingPlayable,
} from './storyProgress';

// Keep the test output readable — the module logs a lot on purpose.
beforeEach(() => {
  window.localStorage.clear();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

test('fresh reader gets empty progress', () => {
  expect(loadProgress()).toEqual(emptyProgress());
});

test('save then load returns the same progress', () => {
  const p = updateSitting(emptyProgress(), 'sitting-1', { beatIndex: 4 });
  saveProgress(p);
  expect(loadProgress()).toEqual(p);
});

test('corrupt JSON is ignored (fresh start, no crash)', () => {
  window.localStorage.setItem(STORAGE_KEY, '{not json');
  expect(loadProgress()).toEqual(emptyProgress());
});

test('unknown shape (wrong version) is ignored', () => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 99, sittings: {} }));
  expect(loadProgress()).toEqual(emptyProgress());
});

test('blocked storage: load and save both survive', () => {
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
  expect(loadProgress()).toEqual(emptyProgress());
  expect(() => saveProgress(emptyProgress())).not.toThrow();
});

test('unseen sitting defaults to screen 0, not completed; bad index → 0', () => {
  const p = emptyProgress();
  expect(getSittingProgress(p, 'sitting-7')).toEqual({ beatIndex: 0, completed: false, answers: {} });
  p.sittings['sitting-2'] = { beatIndex: -3, completed: true };
  expect(getSittingProgress(p, 'sitting-2')).toEqual({ beatIndex: 0, completed: true, answers: {} });
});

test('updateSitting returns a new object and keeps other fields', () => {
  const before = updateSitting(emptyProgress(), 'sitting-1', { completed: true });
  const after = updateSitting(before, 'sitting-1', { beatIndex: 2 });
  expect(after).not.toBe(before);
  expect(before.sittings['sitting-1'].beatIndex).toBe(0); // old one untouched
  expect(after.sittings['sitting-1']).toEqual({ beatIndex: 2, completed: true, answers: {} });
});

test('sittings unlock in order: first always open, next opens after the previous is completed', () => {
  const sittings = [{ id: 'sitting-1' }, { id: 'sitting-2' }, { id: 'sitting-3' }];
  let p = emptyProgress();
  expect(isSittingUnlocked(p, sittings, 0)).toBe(true);
  expect(isSittingUnlocked(p, sittings, 1)).toBe(false);
  p = updateSitting(p, 'sitting-1', { completed: true });
  expect(isSittingUnlocked(p, sittings, 1)).toBe(true);
  expect(isSittingUnlocked(p, sittings, 2)).toBe(false);
});

test('a sitting with no beats is not playable ("coming soon")', () => {
  expect(isSittingPlayable({ beats: [] })).toBe(false);
  expect(isSittingPlayable({ beats: [{ id: 'x' }] })).toBe(true);
});
