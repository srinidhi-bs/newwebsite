/**
 * Website Component
 * 
 * Main website container that handles:
 * - Page routing and navigation
 * - Content layout
 * - Theme switching
 * - Mobile responsiveness
 * 
 * Features:
 * - Responsive navigation
 * - Dark/light mode toggle
 * - Dynamic content loading
 * - Mobile-first design
 */

import React, { useState, useEffect } from 'react';
// Update the import path to be explicit
import Navigation from './layout/Navigation';

// Debug import
// const TravelComponent = Travel;
// console.log('Debug - Travel component loaded:', { Travel, TravelComponent });

const Website = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    console.log('Debug - Current page changed to:', currentPage);
  }, [currentPage]);

  const renderContent = () => {
    console.log('Debug - Rendering content for page:', currentPage);

    try {
      switch (currentPage.toLowerCase()) {
        case 'home':
          return (
            <div>
              <h2 className="text-2xl font-bold mb-4">Accountant | Tax Consultant | Stock Trader | Tech-Geek</h2>
            </div>
          );

        default:
          return (
            <div>
              <h2 className="text-2xl font-bold mb-4">{currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}</h2>
              <p>This section is coming soon!</p>
            </div>
          );
      }
    } catch (error) {
      console.error('Debug - Error in renderContent:', error);
      return <div>Error rendering content: {error.message}</div>;
    }
  };

  // Debug render
  console.log('Debug - Website rendering with page:', currentPage);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-800 text-white fixed top-0 w-full z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => {
                console.log('Debug - Home button clicked');
                setCurrentPage('home');
                setMenuOpen(false);
              }}
              className="text-2xl font-bold hover:text-gray-300"
            >
              Srinidhi BS
            </button>
            <div className="flex items-center space-x-4">
              <button
                className="lg:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-16 6h16" />
                </svg>
              </button>
            </div>
          </div>
          <Navigation
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
          />
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 mt-32 mb-16">
        {renderContent()}
      </main>

      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Srinidhi BS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Website;