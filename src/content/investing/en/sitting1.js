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
 *   type   — which kind of screen it is: 'narration', 'guess' or 'choice'.
 *   kicker — optional small label on top, e.g. a date "JAN 2000".
 *
 * 'narration' — just text:
 *   text   — one paragraph (string) or several (array of strings).
 *
 * 'guess' — reader guesses, locks, then sees the real answer (+ reveal text).
 *   question, answer, reveal, and input = either
 *     { kind: 'slider', min, max, step, start, prefix, suffix }  (answer = number)
 *     { kind: 'options', options: [{ id, label }] }             (answer = option id)
 *
 * 'choice' — reader decides; sees what THEIR choice led to; story continues.
 *   text, options: [{ id, label, consequence }]
 *
 * Next stays locked on guess/choice screens until the reader answers.
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
      id: 's1-dosa-guess',
      type: 'guess',
      kicker: 'SEP 2026',
      question: 'Guess: what does that same plate cost today? (placeholder numbers)',
      input: { kind: 'slider', min: 10, max: 200, step: 5, start: 20, prefix: '₹', suffix: '' },
      answer: 100,
      reveal: 'Placeholder reveal — the real figure and its source come in the Sitting 1 session.',
    },
    {
      id: 's1-cash-guess',
      type: 'guess',
      question: 'So what happened to cash you kept at home since 2000? (placeholder)',
      input: {
        kind: 'options',
        options: [
          { id: 'same', label: 'It buys the same as before' },
          { id: 'less', label: 'It buys much less' },
          { id: 'more', label: 'It buys more' },
        ],
      },
      answer: 'less',
      reveal: 'Placeholder reveal.',
    },
    {
      id: 's1-where-choice',
      type: 'choice',
      text: 'Placeholder choice: where do you keep your savings?',
      options: [
        { id: 'home', label: 'At home', consequence: 'Placeholder consequence for "at home".' },
        { id: 'fd', label: 'In a bank FD', consequence: 'Placeholder consequence for "FD".' },
      ],
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
