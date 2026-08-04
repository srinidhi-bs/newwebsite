/**
 * Header Component
 * 
 * Main navigation header that provides:
 * - Site branding
 * - Navigation menu
 * - Theme toggle
 * - Mobile menu button
 * 
 * Features:
 * - Responsive design
 * - Sticky positioning
 * - Mobile menu toggle
 * - Smooth transitions
 * - Dark mode support
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import { useTheme } from '../../context/ThemeContext';

const Header = ({ currentPage, setCurrentPage, menuOpen, setMenuOpen }) => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  return (
    /* Dual Personality shell (RD-3): nav-skin = yellow slab + thick ink
       rule ☀ / glass strip + luminous hairline 🌙. backdrop-blur-md is
       invisible on the opaque Playground bar and IS the frost in the Lab. */
    <header className="nav-skin text-ink fixed top-0 w-full z-50 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => {
              console.log('Header: Navigating to home');
              setCurrentPage('home');
              setMenuOpen(false);
              navigate('/');
            }}
            /* display-skin = Archivo Black UPPERCASE ☀ / Space Grotesk 🌙;
               hover color is the section-mapped CTA accent (teal ☀ / cyan 🌙) */
            className="display-skin text-2xl sm:text-3xl font-bold hover:text-accent-cta transition-colors"
          >
            Srinidhi BS
          </button>
          <div className="flex items-center space-x-4">
            {/* The signature control: ink slab + yellow moon ☀ / glass pill
                + amber sun 🌙. Label tells you where the toggle TAKES you. */}
            <button
              onClick={toggleTheme}
              className="toggle-skin flex items-center gap-2 px-3 py-2"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
              <span className="hidden sm:inline font-labmono text-xs font-medium">
                {isDark ? 'Playground' : 'Enter the lab'}
              </span>
            </button>
            <button
              className="lg:hidden text-ink"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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