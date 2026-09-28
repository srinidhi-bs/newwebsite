/**
 * RobotCompanion — the tiny, always-loaded "doorman" for the 3D robot.
 *
 * Why a separate file? The real robot (RobotWalker) pulls in three.js, which
 * is ~150 KB compressed. We don't want Home's first paint to wait for that.
 * So this file is tiny: it decides IF the robot should appear at all, and
 * only then asks React to fetch the heavy RobotWalker chunk (React.lazy).
 *
 * The robot is skipped when:
 *   • the browser has no WebGL at all (very old browsers, and the Jest/jsdom
 *     test environment — so tests never try to load three.js), or
 *   • the reader asked their OS for "reduce motion" (a walking robot is
 *     exactly the kind of motion they opted out of).
 *
 * Example: on a normal laptop Chrome → both checks pass → ~1 s after Home
 * shows, the robot chunk + model download and he appears on the header line.
 */
import React, { Suspense, lazy } from 'react';

// Lazy = webpack puts RobotWalker (and three.js) in its own file, fetched
// only when <RobotWalker /> is first rendered.
const RobotWalker = lazy(() => import('./RobotWalker'));

/** Can this browser draw 3D at all? A cheap check that never creates a context. */
function browserHasWebGL() {
  return typeof window !== 'undefined' && typeof window.WebGLRenderingContext !== 'undefined';
}

/** Did the reader ask for less motion in their OS settings? */
function prefersReducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false; // matchMedia missing → assume no preference
  }
}

/**
 * If the robot chunk fails to download (flaky phone network) or three.js
 * throws, swallow it HERE — otherwise the error would bubble up to the page's
 * error boundary and replace the whole Home page with an error screen.
 * A missing robot is fine; a broken Home page is not.
 */
class RobotErrorGuard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.warn('[Robot] Robot failed to load — hiding him, page unaffected:', error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const RobotCompanion = () => {
  if (!browserHasWebGL()) {
    console.log('[Robot] No WebGL in this browser — robot skipped');
    return null;
  }
  if (prefersReducedMotion()) {
    console.log('[Robot] Reader prefers reduced motion — robot skipped');
    return null;
  }
  // fallback={null}: while the chunk downloads, show nothing (he fades in later).
  return (
    <RobotErrorGuard>
      <Suspense fallback={null}>
        <RobotWalker />
      </Suspense>
    </RobotErrorGuard>
  );
};

export default RobotCompanion;
