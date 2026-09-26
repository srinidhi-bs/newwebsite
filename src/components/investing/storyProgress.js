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
 * These are plain functions (no React) so they're easy to unit-test.
 * ===========================================================================
 */

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
