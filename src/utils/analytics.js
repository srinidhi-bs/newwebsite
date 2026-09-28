/**
 * analytics.js — one safe doorway to Umami custom events (Session 52)
 * ===========================================================================
 * Page views are counted automatically by the Umami script tag in
 * public/index.html (it also notices React Router page changes). This file
 * is only for CUSTOM events — things a page view can't tell us, like
 * "reached screen 4 of Sitting 1".
 *
 * Why a helper instead of calling window.umami.track() directly:
 *   - window.umami does NOT exist in tests, on some browsers with ad
 *     blockers, or before the script has loaded → a direct call would crash
 *     the game. Here that just becomes a quiet no-op.
 *   - The tracker only runs on www.srinidhibs.com (data-domains in
 *     index.html), so local dev never pollutes the real numbers.
 *   - One place to log every event, so it's visible in the browser console.
 *
 * Budget: Umami's free plan = 100K events/month, and EACH data property
 * counts as one extra event — keep `data` to one small property.
 *
 * Example:
 *   trackEvent('ifz-sitting-start', { sitting: 1 });
 * ===========================================================================
 */

/**
 * Send one custom event to Umami, if Umami is present.
 * @param {string} name  - event name (Umami limit: 50 characters)
 * @param {Object} [data] - optional properties (keep it to one)
 * @returns {boolean} true if handed to Umami, false if skipped
 */
export const trackEvent = (name, data) => {
  const umami = typeof window !== 'undefined' ? window.umami : undefined;
  if (!umami || typeof umami.track !== 'function') {
    console.log(`[Analytics] (not sent — Umami not loaded) ${name}`, data || '');
    return false;
  }
  try {
    umami.track(name, data);
    console.log(`[Analytics] sent ${name}`, data || '');
    return true;
  } catch (err) {
    // Tracking must never break the page — log and carry on.
    console.warn(`[Analytics] failed to send ${name}:`, err);
    return false;
  }
};
