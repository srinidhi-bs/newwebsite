/**
 * LearnGate
 * ---------------------------------------------------------------------------
 * An INVISIBLE "Learn" link for the nav bar. Only Pannaga is told it sits just
 * to the right of "Contact". Clicking it opens a small password box. If the
 * password is correct, we leave the React app and load the static lesson pages.
 *
 * SECURITY NOTE (intentional — do not change):
 *   This password is checked in the browser, so it is NOT real security. It
 *   only hides the link from normal visitors. The lesson files under /learn/
 *   are public to anyone who knows the address. That is acceptable here because
 *   the lessons are non-sensitive study material.
 * ---------------------------------------------------------------------------
 */
import React, { useState } from 'react';
import { createPortal } from 'react-dom';

// The secret word Pannaga must type. (Lives in browser code — not truly secret.)
const SECRET = 'Learn';

// Where the lessons live. We point straight at index.html ON PURPOSE:
// the site is hosted on Vercel with a catch-all SPA rewrite (/(.*) -> /index.html)
// in vercel.json. Vercel checks the filesystem BEFORE applying that rewrite, so a
// REAL file path (/learn/index.html) is served directly as the static lesson page,
// while a bare folder path (/learn/) could fall through to the rewrite and load the
// React app instead. Pointing at index.html sidesteps that. (Same reasoning would
// apply to an Apache `!-f` rule — a real file always wins over the SPA fallback.)
const LESSON_URL = '/learn/index.html';

const LearnGate = () => {
  const [open, setOpen] = useState(false);   // is the password box showing?
  const [value, setValue] = useState('');     // what the user has typed
  const [error, setError] = useState(false);  // show the "wrong password" line?

  // Open the password box (called when the invisible link is clicked)
  const openGate = () => {
    console.log('[LearnGate] Hidden link clicked — showing password box.');
    setValue('');
    setError(false);
    setOpen(true);
  };

  // Close the box without doing anything
  const closeGate = () => setOpen(false);

  // Check the password when the little form is submitted
  const handleSubmit = (e) => {
    e.preventDefault(); // stop the browser from reloading the page
    if (value === SECRET) {
      console.log('[LearnGate] Correct password — opening lessons.');
      window.location.href = LESSON_URL; // leave React, load the static lessons
    } else {
      console.log('[LearnGate] Wrong password.');
      setError(true);
    }
  };

  return (
    <li>
      {/* The INVISIBLE link. "opacity-0" makes it unseen but still clickable.
          aria-hidden + tabIndex -1 keep it out of screen-readers and Tab order.

          "w-full text-left" matches the visible menu buttons: on MOBILE the menu is a
          vertical list, so this makes the whole row below "Contact" tappable (instead
          of just the 71px-wide word) — much easier to hit on a phone. On DESKTOP the
          menu is a horizontal flex row, which shrinks each item to its content width,
          so this stays a small invisible spot just to the right of "Contact" as before. */}
      <button
        type="button"
        onClick={openGate}
        aria-hidden="true"
        tabIndex={-1}
        className="opacity-0 w-full text-left px-4 py-2 lg:px-0 lg:py-0 cursor-default select-none"
      >
        Learn
      </button>

      {/* The password box. Only rendered when "open" is true.
          We render it through a PORTAL into <body>, not here inside the nav,
          because the site header uses `backdrop-blur`. A CSS backdrop-filter makes
          any `position: fixed` child size itself relative to the HEADER (~112px tall)
          instead of the whole screen — which clipped this box at the top. The portal
          moves the overlay out to <body> so `fixed inset-0` covers the real viewport
          and the box centres correctly. */}
      {open && createPortal(
        // Dark backdrop that covers the screen; clicking it closes the box.
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeGate}
        >
          {/* The white card. stopPropagation = clicking inside does NOT close it. */}
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
          >
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Enter the password
            </h2>

            <input
              type="password"
              autoFocus
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(false); }}
              placeholder="Password"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />

            {/* Shown only after a wrong try */}
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                Wrong password. Please try again.
              </p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeGate}
                className="rounded-md px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
              >
                Open
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}
    </li>
  );
};

export default LearnGate;
