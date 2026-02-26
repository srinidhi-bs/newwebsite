/**
 * useDocumentTitle Hook
 *
 * Sets the browser tab title dynamically per page/route.
 * Appends " | Srinidhi BS" suffix to maintain consistent branding.
 *
 * @param {string} title - Page-specific title (e.g., "Finance Tools")
 *
 * Example usage:
 *   useDocumentTitle('Finance Tools');
 *   // Browser tab shows: "Finance Tools | Srinidhi BS"
 */

import { useEffect } from 'react';

const SITE_NAME = 'Srinidhi BS';

const useDocumentTitle = (title) => {
  useEffect(() => {
    // Set the title with site name suffix for SEO and branding
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

    // Cleanup: restore default title when component unmounts
    return () => {
      document.title = SITE_NAME;
    };
  }, [title]);
};

export default useDocumentTitle;
