/**
 * storyProgress — remembers how far the reader got in "Investing, from zero"
 * ===========================================================================
 * The explainer is a game played over several short "sittings". A reader may
 * close the tab halfway through and come back tomorrow, so we save their
 * place in the browser's localStorage (a small key–value store that lives on
 * THEIR device only — nothing is sent to any server).
 *
 * Saved shape (one JSON string under STORAGE_KEY):
 *   {
 *     version: 1,
 *     sittings: {
 *       "sitting-1": { beatIndex: 4, completed: false,
 *                      answers: { "s1-dosa-guess": 40 } },
 *       "sitting-2": { beatIndex: 0, completed: false, answers: {} }
 *     }
 *   }
 *
 * Example: reader is on the 5th screen (index 4) of sitting 1 and closes the
 * tab → next visit, getSittingProgress(p, "sitting-1").beatIndex === 4, so
 * the player reopens on that same screen.
 *
 * Why every read/write is wrapped in try/catch:
 *   localStorage can THROW (Safari "Block All Cookies", private windows,
 *   storage full). Same guard the ThemeContext uses. If storage is blocked,
 *   the game still works — it just starts from the top on the next visit.
 *
 * `answers` holds what the reader did on interactive screens (E2): the
 * number they guessed, the option they picked — keyed by the beat's id. So
 * if they reload mid-sitting, a locked guess stays locked and shows its
 * reveal, instead of letting them re-guess with hindsight.
 *
 * The helpers are plain functions (no React) so they're easy to unit-test.
 * useStoryProgress() at the bottom is the one React hook: the page calls it
 * ONCE and hands the same progress to both the level map and the story
 * player, so the two can never disagree about what's finished.
 * ===========================================================================
 */
import { useState, useEffect } from 'react';

// Versioned key: if the saved shape ever changes, bump to -v2 so an old,
// incompatible save is simply ignored instead of crashing the player.
export const STORAGE_KEY = 'ifz-progress-v1';

// What a brand-new reader starts with.
export const emptyProgress = () => ({ version: 1, sittings: {} });

/**
 * Read the saved progress from localStorage.
 * Returns emptyProgress() when nothing is saved, storage is blocked, or the
 * saved text is corrupt (e.g. someone edited it by hand).
 */
export const loadProgress = () => {
  let raw = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    console.warn('[InvestingStory] localStorage blocked — progress will not be remembered.', e);
    return emptyProgress();
  }

  if (!raw) {
    console.log('[InvestingStory] No saved progress — fresh start.');
    return emptyProgress();
  }

  try {
    const parsed = JSON.parse(raw);
    // Sanity check: must look like our shape, else start fresh.
    if (!parsed || parsed.version !== 1 || typeof parsed.sittings !== 'object' || parsed.sittings === null) {
      console.warn('[InvestingStory] Saved progress has an unknown shape — ignoring it.', parsed);
      return emptyProgress();
    }
    console.log('[InvestingStory] Loaded saved progress:', parsed);
    return parsed;
  } catch (e) {
    console.warn('[InvestingStory] Saved progress is not valid JSON — ignoring it.', e);
    return emptyProgress();
  }
};

/**
 * Write progress to localStorage. Failure is logged and swallowed — losing a
 * bookmark must never break the story itself.
 */
export const saveProgress = (progress) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('[InvestingStory] Could not save progress (storage blocked or full).', e);
  }
};

/**
 * Where is the reader inside one sitting?
 * Always returns a full object, even for a sitting never opened before.
 */
export const getSittingProgress = (progress, sittingId) => {
  const saved = progress.sittings[sittingId];
  return {
    beatIndex: saved && Number.isInteger(saved.beatIndex) && saved.beatIndex >= 0 ? saved.beatIndex : 0,
    completed: Boolean(saved && saved.completed),
    answers: saved && saved.answers && typeof saved.answers === 'object' ? saved.answers : {},
  };
};

/**
 * Return a NEW progress object with one sitting updated.
 * (We never mutate the old object — React state updates rely on getting a
 * new object so they know something changed.)
 *
 * Example:
 *   updateSitting(p, 'sitting-1', { beatIndex: 3 })
 *   → same as p, but sitting-1 is now on screen 4 (index 3).
 */
export const updateSitting = (progress, sittingId, changes) => ({
  ...progress,
  sittings: {
    ...progress.sittings,
    [sittingId]: { ...getSittingProgress(progress, sittingId), ...changes },
  },
});

/**
 * Can the reader open sitting number `index` (0-based) on the map?
 * Rule (agreed with Srinidhi, E3): sittings open IN ORDER — the first one is
 * always open, every later one opens once the previous one is completed.
 * (The map's "skip ahead" link can still open a locked one on purpose.)
 *
 * Example: sitting 1 completed → index 1 (sitting 2) unlocked, index 2 locked.
 */
export const isSittingUnlocked = (progress, sittings, index) =>
  index === 0 || getSittingProgress(progress, sittings[index - 1].id).completed;

/**
 * A sitting with no beats yet is a "coming soon" stub — shown on the map,
 * but it can't be played.
 */
export const isSittingPlayable = (sitting) => sitting.beats.length > 0;

/**
 * React hook: load progress once, save it on every change.
 * Returns [progress, setProgress] — same shape as useState.
 */
export const useStoryProgress = () => {
  // Function form → loadProgress runs only on the first render.
  const [progress, setProgress] = useState(() => loadProgress());
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);
  return [progress, setProgress];
};
