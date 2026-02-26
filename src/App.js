/**
 * Root Application Component
 * 
 * Main app container that manages:
 * - Routing configuration
 * - Theme provider
 * - Global state
 * 
 * Features:
 * - React Router setup
 * - Dark mode support
 * - Lazy loading
 * 
 * @component
 * @returns {React.ReactElement} The root application component
 */

import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { ThemeProvider } from './context/ThemeContext';
import { LoadingProvider } from './context/LoadingContext';
import GlobalLoader from './components/layout/GlobalLoader';
import './App.css';

// Lazy load components
const Home = lazy(() => import('./components/pages/Home'));
const Finance = lazy(() => import('./components/pages/Finance'));
const Trading = lazy(() => import('./components/pages/Trading'));

const Tools = lazy(() => import('./components/pages/Tools'));
const Contact = lazy(() => import('./components/pages/Contact'));
const PDFMerger = lazy(() => import('./components/tools/pdf-merger/PDFMerger'));
const PDFSplitter = lazy(() => import('./components/tools/pdf-splitter/PDFSplitter'));
const PDFToJPG = lazy(() => import('./components/tools/pdf-to-jpg/PDFToJPG'));
const JPGToPDF = lazy(() => import('./components/tools/jpg-to-pdf/JPGToPDF'));
const ImageResizer = lazy(() => import('./components/tools/image-resizer/ImageResizer'));
const PDFResizer = lazy(() => import('./components/tools/pdf-resizer/PDFResizer'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
  </div>
);

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <ThemeProvider>
      <LoadingProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-light-background dark:bg-dark-background text-light-onBackground dark:text-dark-onBackground transition-colors duration-200">
            <GlobalLoader />
            <Header
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              menuOpen={menuOpen}
              setMenuOpen={setMenuOpen}
            />
            <Suspense fallback={<LoadingSpinner />}>
              <main className="flex-grow container mx-auto px-4 pt-32 pb-16 w-full max-w-[1280px]">
                <Routes>
                  <Route path="/" element={<Home setCurrentPage={setCurrentPage} />} />
                  <Route path="/finance" element={<Finance setCurrentPage={setCurrentPage} />} />
                  <Route path="/trading" element={<Trading setCurrentPage={setCurrentPage} />} />

                  <Route path="/tools" element={<Suspense fallback={<LoadingSpinner />}><Tools setCurrentPage={setCurrentPage} /></Suspense>} />
                  <Route path="/tools/pdf-merger" element={<Suspense fallback={<LoadingSpinner />}><PDFMerger setCurrentPage={setCurrentPage} /></Suspense>} />
                  <Route path="/tools/pdf-splitter" element={<Suspense fallback={<LoadingSpinner />}><PDFSplitter setCurrentPage={setCurrentPage} /></Suspense>} />
                  <Route path="/tools/pdf-to-jpg" element={<Suspense fallback={<LoadingSpinner />}><PDFToJPG setCurrentPage={setCurrentPage} /></Suspense>} />
                  <Route path="/tools/jpg-to-pdf" element={<Suspense fallback={<LoadingSpinner />}><JPGToPDF setCurrentPage={setCurrentPage} /></Suspense>} />
                  <Route path="/tools/image-resizer" element={<Suspense fallback={<LoadingSpinner />}><ImageResizer setCurrentPage={setCurrentPage} /></Suspense>} />
                  <Route path="/tools/pdf-resizer" element={<Suspense fallback={<LoadingSpinner />}><PDFResizer setCurrentPage={setCurrentPage} /></Suspense>} />
                  <Route path="/contact" element={<Suspense fallback={<LoadingSpinner />}><Contact setCurrentPage={setCurrentPage} /></Suspense>} />
                </Routes>
              </main>
            </Suspense>
            <Footer />
          </div>
        </Router>
      </LoadingProvider>
    </ThemeProvider>
  );
}

export default App;