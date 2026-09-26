/**
 * Sitting 1 — "Why invest at all?"  (English)
 * ===========================================================================
 * ⚠ PLACEHOLDER TEXT. The real story, look and interactive moments for this
 * sitting are decided together with Srinidhi in the S1 session. These three
 * screens exist only so the engine (E1) has something to play.
 *
 * HOW A SITTING FILE WORKS
 * ------------------------
 * A sitting is a list of "beats" — one beat = one screen the reader sees.
 * The StoryPlayer shows them in order, with Next / Back.
 *
 * Every beat has:
 *   id     — unique, never-changing name (used for debugging and, later, to
 *            remember the reader's choices). Prefix with the sitting: "s1-".
 *   type   — which kind of screen it is. Today only 'narration' exists;
 *            E2 adds 'guess', 'choice' and 'reveal'.
 *
 * A 'narration' beat also has:
 *   kicker — optional small label above the text, e.g. a date "JAN 2000".
 *   text   — one paragraph (string) or several (array of strings).
 *
 * Why text lives HERE and not in the page code: a Kannada or Hindi version
 * later is just a copy of this file in a `kn/` or `hi/` folder, translated —
 * no page code changes.
 * ===========================================================================
 */

const sitting1 = {
  id: 'sitting-1',
  number: 1,
  title: 'Why invest at all?',
  beats: [
    {
      id: 's1-hello',
      type: 'narration',
      kicker: 'JAN 2000',
      text: [
        "It's January 2000. You're 28, and you've just got your first real salary.",
        '(Placeholder — the real opening is written in the Sitting 1 session.)',
      ],
    },
    {
      id: 's1-dosa',
      type: 'narration',
      kicker: 'JAN 2000',
      text: 'A plate of masala dosa costs ₹10. Remember that number.',
    },
    {
      id: 's1-cliffhanger',
      type: 'narration',
      kicker: 'FAST-FORWARD ▶',
      text: 'Now let’s jump 26 years ahead and see what your money can still buy…',
    },
  ],
};

export default sitting1;
