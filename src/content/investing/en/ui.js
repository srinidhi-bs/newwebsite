/**
 * "Investing, from zero" — English words used by the game's buttons and
 * frame (NOT the story itself — that lives in the sitting files).
 *
 * Kept here, not inside the components, for the same reason as the story
 * text: a Kannada/Hindi version later = translate this file, no code changes.
 */

const ui = {
  pageKicker: 'Trading / Investing, from zero',
  pageTitle: 'Investing, from zero',
  pageStandfirst: 'A short game about money. No jargon, no fund tips — just how it all works.',
  sittingLabel: 'Sitting',          // "Sitting 1"
  back: '← Back',
  next: 'Next →',
  finish: 'Finish sitting ✓',
  completeTitle: 'Sitting complete',
  playAgain: 'Play it again',
  unknownBeat: 'This screen could not be shown.',
  // Guess screens (E2)
  lockGuess: 'Lock my guess',
  lockSplit: 'Lock it in',
  yourGuess: 'Your guess',
  actual: 'Actually',
  // Shown under a disabled Next button until the reader answers
  answerFirst: 'Make your pick to continue',
  // Level map (E3)
  backToMap: '← Back to the map',
  backToMapShort: '← Map',
  mapHint: 'Tap a glowing part of the page to play it.',
  play: 'PLAY ▸',
  done: 'DONE ✓',
  locked: 'LOCKED',
  soon: 'SOON',
  // {title} is replaced with the previous sitting's title
  lockedTitle: 'Locked for now',
  lockedBody: 'This part opens after “{title}”. The story builds step by step — but if you already know this, go ahead.',
  openAnyway: 'I know this — open it',
  cancel: 'Not now',
  soonTitle: 'Coming soon',
  soonBody: 'This part of the story is still being written. Check back soon!',
  // {title} = the sitting just finished / the one just unlocked
  celebrateDone: 'Sitting done: {title} ✨',
  celebrateNext: 'Unlocked: {title}',
  celebrateSoon: 'The next part is coming soon.',
};

export default ui;
