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

import React, { useState, Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AnimatedRoutes from './components/layout/AnimatedRoutes';
import { ThemeProvider } from './context/ThemeContext';
import { LoadingProvider } from './context/LoadingContext';
import GlobalLoader from './components/layout/GlobalLoader';
import './App.css';

// Loading fallback for the outer Suspense boundary
// Shown while the initial page chunk is downloading
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
            {/* Outer Suspense catches lazy-load boundaries for all pages. */}
            {/* AnimatedRoutes handles AnimatePresence + route definitions. */}
            <Suspense fallback={<LoadingSpinner />}>
              <main className="flex-grow container mx-auto px-4 pt-32 pb-16 w-full max-w-[1280px]">
                <AnimatedRoutes setCurrentPage={setCurrentPage} />
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