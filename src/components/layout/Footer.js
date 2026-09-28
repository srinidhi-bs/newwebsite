import React from 'react';

/**
 * Footer — Dual Personality shell (RD-3)
 *
 * footer-skin mirrors the header's rule: thick ink line on cream ☀ /
 * luminous hairline on deep-space 🌙. The right-hand sign-off uses the
 * mono "lab readout" voice (and a little Kannada pride).
 */
const Footer = () => {
  return (
    <footer className="mt-auto footer-skin text-ink-muted py-5">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
        <p>&copy; 2026 Srinidhi BS. All rights reserved.</p>
        <p className="font-labmono text-xs">
          Made in Bengaluru &middot; ಬೆಂಗಳೂರು
          {/* Avaturn's terms: the 3D avatar on Home must credit + link them and
              say it was modified (we enlarge the head). Session 53. */}
          {' '}&middot; 3D avatar by{' '}
          <a href="https://avaturn.me" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
            Avaturn
          </a>{' '}(modified)
        </p>
      </div>
    </footer>
  );
};

export default Footer;