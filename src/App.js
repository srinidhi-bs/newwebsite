/**
 * Root Application Component
 * 
 * Main app container that manages:
 * - Routing configuration
 * - Theme provider
 * - Global state
 * - Error boundaries
 * 
 * Features:
 * - React Router setup
 * - Dark mode context
 * - Global error handling
 * - Performance monitoring
 * - Development tools
 * 
 * @component
 * @returns {React.ReactElement} The root application component
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import './App.css';
import { EMAIL_CONFIG } from './config/appConfig';

// Lazy load components
const Home = lazy(() => import('./components/pages/Home'));
const Finance = lazy(() => import('./components/pages/Finance'));
const Trading = lazy(() => import('./components/pages/Trading'));
const Travel = lazy(() => import('./components/pages/Travel'));
const NortheastIndia = lazy(() => import('./components/pages/travels/NortheastIndia'));
const Tools = lazy(() => import('./components/pages/Tools'));
const Contact = lazy(() => import('./components/pages/Contact'));
const Login = lazy(() => import('./components/auth/Login'));
const SignUp = lazy(() => import('./components/auth/SignUp'));
const PDFMerger = lazy(() => import('./components/tools/pdf-merger/PDFMerger'));
const PDFSplitter = lazy(() => import('./components/tools/pdf-splitter/PDFSplitter'));
const PDFToJPG = lazy(() => import('./components/tools/pdf-to-jpg/PDFToJPG'));
const JPGToPDF = lazy(() => import('./components/tools/jpg-to-pdf/JPGToPDF'));
const ComplianceCalendar = lazy(() => import('./components/pages/ComplianceCalendar'));
const TaskPage = lazy(() => import('./components/pages/TaskPage'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
  </div>
);

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Update theme when darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-light-background dark:bg-dark-background text-light-onBackground dark:text-dark-onBackground transition-colors duration-200">
          <Header 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
          <Suspense fallback={<LoadingSpinner />}>
            <main className="flex-grow container mx-auto px-4 pt-32 pb-16 w-full max-w-[1280px]">
              <Routes>
                <Route path="/" element={<Home setCurrentPage={setCurrentPage} />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/finance" element={<Finance setCurrentPage={setCurrentPage} />} />
                <Route path="/trading" element={<Trading setCurrentPage={setCurrentPage} />} />
                <Route path="/travel" element={<Travel setCurrentPage={setCurrentPage} />} />
                <Route path="/northeast-india" element={<NortheastIndia setCurrentPage={setCurrentPage} />} />
                <Route path="/tools" element={<Suspense fallback={<LoadingSpinner />}><Tools setCurrentPage={setCurrentPage} /></Suspense>} />
                <Route path="/tools/pdf-merger" element={<Suspense fallback={<LoadingSpinner />}><PDFMerger setCurrentPage={setCurrentPage} /></Suspense>} />
                <Route path="/tools/pdf-splitter" element={<Suspense fallback={<LoadingSpinner />}><PDFSplitter setCurrentPage={setCurrentPage} /></Suspense>} />
                <Route path="/tools/pdf-to-jpg" element={<Suspense fallback={<LoadingSpinner />}><PDFToJPG setCurrentPage={setCurrentPage} /></Suspense>} />
                <Route path="/tools/jpg-to-pdf" element={<Suspense fallback={<LoadingSpinner />}><JPGToPDF setCurrentPage={setCurrentPage} /></Suspense>} />
                <Route path="/contact" element={<Suspense fallback={<LoadingSpinner />}><Contact setCurrentPage={setCurrentPage} /></Suspense>} />
                <Route
                  path="/compliance-calendar"
                  element={
                    <PrivateRoute>
                      <Suspense fallback={<LoadingSpinner />}>
                        <ComplianceCalendar setCurrentPage={setCurrentPage} />
                      </Suspense>
                    </PrivateRoute>
                  }
                />
                <Route path="/task/:taskId" element={<TaskPage />} />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
              </Routes>
            </main>
          </Suspense>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;