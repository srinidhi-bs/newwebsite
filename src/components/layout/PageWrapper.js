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
      className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden"
    >
      <div className="relative">
        {/* Dot pattern overlay - only visible in light mode */}
        <div className="absolute inset-0 dark:hidden">
          <div className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(#94A3B8 1.5px, transparent 1.5px)`,
              backgroundSize: '20px 20px',
              opacity: 0.5
            }}>
          </div>
        </div>

        {/* Content container - Added top padding to prevent header overlap */}
        <div className="relative container mx-auto px-4 pt-24 pb-12">
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export default PageWrapper;
