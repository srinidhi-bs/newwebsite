import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './components/pages/Home';
import Finance from './components/pages/Finance';
import Trading from './components/pages/Trading';
import Travel from './components/pages/Travel';
import Contact from './components/pages/Contact';
import Tools from './components/pages/Tools';
import PDFMerger from './components/tools/PDFMerger';

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
      case 'finance':
        return <Finance />;
      case 'trading':
        return <Trading />;
      case 'travel':
        return <Travel />;
      case 'tools':
        return <Tools setCurrentPage={setCurrentPage} />;
      case 'contact':
        return <Contact />;
      case 'pdf-merger':
        return <PDFMerger />;
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
      </main>
      <Footer />
    </div>
  );
}

export default App;