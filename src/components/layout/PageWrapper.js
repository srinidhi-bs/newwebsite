/**
 * PageWrapper Component
 *
 * Wraps every page with consistent background styling and Framer Motion
 * enter/exit animations for smooth page transitions.
 *
 * Animation behaviour:
 * - On enter: fades in + slides up 8px over 0.3s
 * - On exit:  fades out + slides up 8px over 0.3s
 * - Exit only fires when this component is inside AnimatePresence
 *   (i.e., as a direct route target via AnimatedRoutes)
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content to render
 * @returns {React.ReactElement} Animated page container
 */
import React from 'react';
import { motion } from 'framer-motion';
import Breadcrumbs from '../common/Breadcrumbs';

// ─── Page transition animation variants ─────────────────────────────────────
// initial: state when the page is about to enter (starting point)
// animate: state when the page is fully visible (target of enter animation)
// exit:    state when the page is leaving (triggered by AnimatePresence)
const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,       // Start 8px below final position
  },
  animate: {
    opacity: 1,
    y: 0,       // Settle into final position
  },
  exit: {
    opacity: 0,
    y: -8,      // Exit 8px above (upward movement as page "leaves")
  },
};

// ─── Transition timing ──────────────────────────────────────────────────────
// 0.3s is fast enough to feel responsive, slow enough to be visible.
// "easeInOut" provides smooth acceleration and deceleration.
const pageTransition = {
  duration: 0.3,
  ease: 'easeInOut',
};

const PageWrapper = ({ children }) => {
  return (
    <motion.div
      // Framer Motion animation props:
      // - initial: applied when component first mounts
      // - animate: target state (animates from initial to this)
      // - exit: applied when component unmounts (inside AnimatePresence)
      // - variants: maps named states to animation values
      // - transition: timing configuration for all animations
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className="min-h-screen bg-surface overflow-x-hidden"
    >
      <div className="relative">
        {/* ☀ Playground canvas: faint ink halftone dots on cream
            (zine print texture) — hidden in the Laboratory */}
        <div className="absolute inset-0 dark:hidden pointer-events-none">
          <div className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(rgba(16, 16, 16, 0.16) 1.5px, transparent 1.5px)`,
              backgroundSize: '22px 22px'
            }}>
          </div>
        </div>

        {/* 🌙 Laboratory canvas: two static aurora glows (indigo top-left,
            cyan bottom-right). Plain CSS gradients — no animation loops,
            no Core Web Vitals cost. Hidden in the Playground. */}
        <div className="absolute inset-0 hidden dark:block pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(900px 500px at 12% -5%, rgba(99, 102, 241, 0.22), transparent 60%),
                              radial-gradient(800px 520px at 95% 105%, rgba(34, 211, 238, 0.13), transparent 60%)`
          }}>
        </div>

        {/* Content container - Added top padding to prevent header overlap */}
        <div className="relative container mx-auto px-4 pt-24 pb-12">
          <Breadcrumbs />
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export default PageWrapper;
