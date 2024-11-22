import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './components/pages/Home';
import About from './components/pages/About';
import Services from './components/pages/Services';
import Blog from './components/pages/Blog';
import Compliances from './components/pages/Compliances';
import Calculators from './components/pages/Calculators';
import Trading from './components/pages/Trading';
import Travel from './components/pages/Travel';
import Contact from './components/pages/Contact';
import Tools from './components/pages/Tools';
import PDFMerger from './components/tools/PDFMerger';
import EMICalculator from './components/calculators/EMICalculator';
import HRACalculator from './components/calculators/HRACalculator';
import IncomeTaxCalculator from './components/calculators/IncomeTaxCalculator';

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

  const renderContent = () => {
    switch(currentPage.toLowerCase()) {
      case 'home':
        return <Home />;
      case 'about':
        return <About />;
      case 'services':
        return <Services />;
      case 'blog':
        return <Blog />;
      case 'compliances':
        return <Compliances />;
      case 'calculators':
        return <Calculators setCurrentPage={setCurrentPage} />;
      case 'tools':
        return <Tools setCurrentPage={setCurrentPage} />;
      case 'trading':
        return <Trading />;
      case 'travel':
        return <Travel />;
      case 'contact':
        return <Contact />;
      case 'pdf-merger':
        return <PDFMerger />;
      case 'emi-calculator':
        return <EMICalculator />;
      case 'hra-calculator':
        return <HRACalculator />;
      case 'income-tax-calculator':
        return <IncomeTaxCalculator />;
      default:
        return <Home />;
    }
  };

  return (
    <div className={`flex flex-col min-h-screen bg-gray-50 dark:bg-dark-primary text-gray-900 dark:text-dark-primary transition-colors duration-200 ${darkMode ? 'dark' : ''}`}>
      <Header 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      <main className="flex-grow container mx-auto px-4 mt-32 mb-16 w-full max-w-[1280px]">
        {renderContent()}
        {currentPage.includes('calculator') && currentPage !== 'calculators' && (
          <button
            onClick={() => setCurrentPage('calculators')}
            className="mt-6 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Calculators
          </button>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;