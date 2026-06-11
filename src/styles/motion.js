/**
 * Motion Tokens — per-personality animation vocabularies (Phase 14, RD-1 / P4)
 *
 * Each personality MOVES differently, not just looks different:
 *
 *   ☀ Playground — springy & bouncy. Things overshoot slightly and snap
 *                  back, like stickers being slapped onto a notebook.
 *   🌙 Laboratory — smooth & precise. Things glide with ease-out tweens,
 *                  like instruments settling on a reading.
 *
 * Usage (in redesigned components only — old pages don't import this):
 *
 *   const { transition, isLab, reduced } = usePersonalityMotion();
 *   <motion.div whileHover={{ y: -4 }} transition={transition} />
 *
 * Accessibility: when the OS asks for reduced motion, `transition` collapses
 * to a near-instant tween so nothing bounces or glides — same content,
 * no movement (mirrors the IT-7 reduced-motion pattern).
 */

import { useReducedMotion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

// ─── The two vocabularies ────────────────────────────────────────────────────
// Playground: a stiff, lightly-damped spring → quick snap with a tiny overshoot
export const PLAYGROUND_TRANSITION = {
  type: 'spring',
  stiffness: 420,
  damping: 16,
};

// Laboratory: a calm tween → no overshoot, ever (labs don't bounce)
export const LAB_TRANSITION = {
  type: 'tween',
  duration: 0.45,
  ease: 'easeOut',
};

// Reduced motion: effectively instant (Framer needs a non-zero duration
// to still fire animation-complete callbacks reliably)
export const REDUCED_TRANSITION = {
  type: 'tween',
  duration: 0.01,
};

/**
 * Hook returning the active personality's motion settings.
 *
 * @returns {Object} result
 * @returns {Object}  result.transition - Framer Motion transition preset for the active personality
 * @returns {boolean} result.isLab      - true when the Laboratory (dark) personality is active
 * @returns {boolean} result.reduced    - true when the OS requests reduced motion
 */
export function usePersonalityMotion() {
  const { isDark } = useTheme();
  const reduced = useReducedMotion();

  const transition = reduced
    ? REDUCED_TRANSITION
    : isDark
      ? LAB_TRANSITION
      : PLAYGROUND_TRANSITION;

  return { transition, isLab: isDark, reduced };
}
