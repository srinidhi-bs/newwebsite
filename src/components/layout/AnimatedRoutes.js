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
 *
 * @component
 * @param {Object} props
 * @param {Function} props.setCurrentPage - Callback to update active page in header
 * @returns {React.ReactElement} Animated route container
 */

import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// ─── Lazy-loaded page components ────────────────────────────────────────────
// Each page is loaded on-demand to reduce initial bundle size.
// Suspense boundaries catch the loading state while chunks download.
const Home = lazy(() => import('../pages/Home'));
const Finance = lazy(() => import('../pages/Finance'));
const Trading = lazy(() => import('../pages/Trading'));
const Tools = lazy(() => import('../pages/Tools'));
const Contact = lazy(() => import('../pages/Contact'));
const PDFMerger = lazy(() => import('../tools/pdf-merger/PDFMerger'));
const PDFSplitter = lazy(() => import('../tools/pdf-splitter/PDFSplitter'));
const PDFToJPG = lazy(() => import('../tools/pdf-to-jpg/PDFToJPG'));
const JPGToPDF = lazy(() => import('../tools/jpg-to-pdf/JPGToPDF'));
const ImageResizer = lazy(() => import('../tools/image-resizer/ImageResizer'));
const PDFResizer = lazy(() => import('../tools/pdf-resizer/PDFResizer'));
const PDFUnlock = lazy(() => import('../tools/pdf-unlock/PDFUnlock'));

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
        <Route path="/" element={<Home setCurrentPage={setCurrentPage} />} />
        <Route path="/finance" element={<Finance setCurrentPage={setCurrentPage} />} />
        <Route path="/trading" element={<Trading setCurrentPage={setCurrentPage} />} />

        {/* ─── Tools pages (with individual Suspense boundaries) ──── */}
        {/* Each tool has its own Suspense so that navigating between */}
        {/* tools shows a spinner only for that specific tool chunk.  */}
        <Route path="/tools" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Tools setCurrentPage={setCurrentPage} />
          </Suspense>
        } />
        <Route path="/tools/pdf-merger" element={
          <Suspense fallback={<LoadingSpinner />}>
            <PDFMerger setCurrentPage={setCurrentPage} />
          </Suspense>
        } />
        <Route path="/tools/pdf-splitter" element={
          <Suspense fallback={<LoadingSpinner />}>
            <PDFSplitter setCurrentPage={setCurrentPage} />
          </Suspense>
        } />
        <Route path="/tools/pdf-to-jpg" element={
          <Suspense fallback={<LoadingSpinner />}>
            <PDFToJPG setCurrentPage={setCurrentPage} />
          </Suspense>
        } />
        <Route path="/tools/jpg-to-pdf" element={
          <Suspense fallback={<LoadingSpinner />}>
            <JPGToPDF setCurrentPage={setCurrentPage} />
          </Suspense>
        } />
        <Route path="/tools/image-resizer" element={
          <Suspense fallback={<LoadingSpinner />}>
            <ImageResizer setCurrentPage={setCurrentPage} />
          </Suspense>
        } />
        <Route path="/tools/pdf-resizer" element={
          <Suspense fallback={<LoadingSpinner />}>
            <PDFResizer setCurrentPage={setCurrentPage} />
          </Suspense>
        } />
        <Route path="/tools/pdf-unlock" element={
          <Suspense fallback={<LoadingSpinner />}>
            <PDFUnlock setCurrentPage={setCurrentPage} />
          </Suspense>
        } />

        {/* ─── Contact page ────────────────────────────────────────── */}
        <Route path="/contact" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Contact setCurrentPage={setCurrentPage} />
          </Suspense>
        } />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
