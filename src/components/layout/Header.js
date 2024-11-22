import React from 'react';
import Navigation from './Navigation';

const Header = ({ currentPage, setCurrentPage, menuOpen, setMenuOpen, darkMode, setDarkMode }) => {
  return (
    <header className="bg-gray-800 dark:bg-gray-900 text-white fixed top-0 w-full z-50 transition-colors duration-200">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => {
              console.log('Header: Navigating to home');
              setCurrentPage('home');
              setMenuOpen(false);
            }} 
            className="text-4xl font-bold hover:text-gray-300 transition-colors"
          >
            Srinidhi BS
          </button>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
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
  );
};

export default Header;