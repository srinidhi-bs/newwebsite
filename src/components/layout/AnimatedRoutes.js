/**
 * AnimatedRoutes Component
 *
 * Wraps all application routes with Framer Motion's AnimatePresence
 * to enable smooth page transition animations on navigation.
 *
 * How it works:
 * - useLocation() provides the current route location object
 * - location.pathname is used as the key on <Routes> so React treats
 *   each route as a unique element (enabling exit animations)
 * - AnimatePresence mode="wait" ensures the exiting page completes
 *   its exit animation before the entering page starts
 * - The location prop on <Routes> tells React Router to render based
 *   on this specific location snapshot (not the live URL), which is
 *   critical for exit animations to work properly
 * - Each route is wrapped with ErrorBoundary + Suspense so that a crash
 *   in one page doesn't take down the entire app (Header/Footer stay functional)
 *
 * @component
 * @param {Object} props
 * @param {Function} props.setCurrentPage - Callback to update active page in header
 * @returns {React.ReactElement} Animated route container
 */

import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ErrorBoundary from '../common/ErrorBoundary';

// ─── Lazy-loaded page components ────────────────────────────────────────────
// Each page is loaded on-demand to reduce initial bundle size.
// Suspense boundaries catch the loading state while chunks download.
const Home = lazy(() => import('../pages/Home'));
const Finance = lazy(() => import('../pages/Finance'));
const Trading = lazy(() => import('../pages/Trading'));
const Tools = lazy(() => import('../pages/Tools'));
const Contact = lazy(() => import('../pages/Contact'));
const EMICalculatorPage = lazy(() => import('../pages/EMICalculatorPage'));
const IncomeTaxCalculatorPage = lazy(() => import('../pages/IncomeTaxCalculatorPage'));
const CapitalGainsCalculatorPage = lazy(() => import('../pages/CapitalGainsCalculatorPage'));
const PDFMerger = lazy(() => import('../tools/pdf-merger/PDFMerger'));
const PDFSplitter = lazy(() => import('../tools/pdf-splitter/PDFSplitter'));
const PDFToJPG = lazy(() => import('../tools/pdf-to-jpg/PDFToJPG'));
const JPGToPDF = lazy(() => import('../tools/jpg-to-pdf/JPGToPDF'));
const ImageResizer = lazy(() => import('../tools/image-resizer/ImageResizer'));
const PDFResizer = lazy(() => import('../tools/pdf-resizer/PDFResizer'));
const PDFUnlock = lazy(() => import('../tools/pdf-unlock/PDFUnlock'));
const PDFLock = lazy(() => import('../tools/pdf-lock/PDFLock'));
const PDFRearrange = lazy(() => import('../tools/pdf-rearrange/PDFRearrange'));
const PDFOcr = lazy(() => import('../tools/pdf-ocr/PDFOcr'));
const NotFound = lazy(() => import('../pages/NotFound'));

// ─── Loading spinner for Suspense fallbacks ─────────────────────────────────
// Shown while lazy-loaded page chunks are downloading
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
  </div>
);

const AnimatedRoutes = ({ setCurrentPage }) => {
  // useLocation() must be called inside <Router> context (provided by App.js)
  const location = useLocation();

  // ─── Scroll to top on every route change ────────────────────────────────
  // Without this, navigating to a new page may retain the previous
  // scroll position, which feels jarring with page transitions.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  /**
   * Helper: wraps a page component with ErrorBoundary + Suspense.
   * - ErrorBoundary catches render crashes so the page shows a friendly
   *   fallback instead of crashing the entire app (Header/Footer stay intact).
   * - Suspense catches the lazy-loading state while the chunk downloads.
   * - The Routes key={location.pathname} already causes unmount/remount on
   *   navigation, which naturally resets the error boundary.
   *
   * @param {React.ReactElement} component - The page/tool component to wrap
   * @returns {React.ReactElement} The component wrapped with ErrorBoundary + Suspense
   */
  const withErrorBoundary = (component) => (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        {component}
      </Suspense>
    </ErrorBoundary>
  );

  return (
    // AnimatePresence mode="wait":
    // - Waits for exiting component to finish its exit animation
    //   before mounting the entering component
    // - Prevents both pages from being visible simultaneously
    <AnimatePresence mode="wait">
      {/*
        key={location.pathname}:
          Forces React to unmount/remount when the path changes,
          triggering exit/enter animations via PageWrapper's motion.div.

        location={location}:
          Tells Routes to render based on this location snapshot,
          not the live URL. Without this, React Router updates
          immediately and AnimatePresence cannot track the exit.
      */}
      <Routes location={location} key={location.pathname}>
        {/* ─── Main pages ──────────────────────────────────────────── */}
        <Route path="/" element={withErrorBoundary(<Home setCurrentPage={setCurrentPage} />)} />
        <Route path="/finance" element={withErrorBoundary(<Finance setCurrentPage={setCurrentPage} />)} />
        <Route path="/finance/emi-calculator" element={withErrorBoundary(<EMICalculatorPage setCurrentPage={setCurrentPage} />)} />
        <Route path="/finance/income-tax-calculator" element={withErrorBoundary(<IncomeTaxCalculatorPage setCurrentPage={setCurrentPage} />)} />
        <Route path="/finance/capital-gains-calculator" element={withErrorBoundary(<CapitalGainsCalculatorPage setCurrentPage={setCurrentPage} />)} />
        <Route path="/trading" element={withErrorBoundary(<Trading setCurrentPage={setCurrentPage} />)} />

        {/* ─── Tools pages ─────────────────────────────────────────── */}
        {/* Each tool is wrapped with ErrorBoundary + Suspense so that  */}
        {/* a crash in one tool doesn't affect other pages or the nav.  */}
        <Route path="/tools" element={withErrorBoundary(<Tools setCurrentPage={setCurrentPage} />)} />
        <Route path="/tools/pdf-merger" element={withErrorBoundary(<PDFMerger setCurrentPage={setCurrentPage} />)} />
        <Route path="/tools/pdf-splitter" element={withErrorBoundary(<PDFSplitter setCurrentPage={setCurrentPage} />)} />
        <Route path="/tools/pdf-to-jpg" element={withErrorBoundary(<PDFToJPG setCurrentPage={setCurrentPage} />)} />
        <Route path="/tools/jpg-to-pdf" element={withErrorBoundary(<JPGToPDF setCurrentPage={setCurrentPage} />)} />
        <Route path="/tools/image-resizer" element={withErrorBoundary(<ImageResizer setCurrentPage={setCurrentPage} />)} />
        <Route path="/tools/pdf-resizer" element={withErrorBoundary(<PDFResizer setCurrentPage={setCurrentPage} />)} />
        <Route path="/tools/pdf-unlock" element={withErrorBoundary(<PDFUnlock setCurrentPage={setCurrentPage} />)} />
        <Route path="/tools/pdf-lock" element={withErrorBoundary(<PDFLock setCurrentPage={setCurrentPage} />)} />
        <Route path="/tools/pdf-rearrange" element={withErrorBoundary(<PDFRearrange setCurrentPage={setCurrentPage} />)} />
        <Route path="/tools/pdf-ocr" element={withErrorBoundary(<PDFOcr setCurrentPage={setCurrentPage} />)} />

        {/* ─── Contact page ────────────────────────────────────────── */}
        <Route path="/contact" element={withErrorBoundary(<Contact setCurrentPage={setCurrentPage} />)} />

        {/* ─── 404 catch-all (must be last) ──────────────────────── */}
        <Route path="*" element={withErrorBoundary(<NotFound />)} />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
