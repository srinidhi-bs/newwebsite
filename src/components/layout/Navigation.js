import React from 'react';

const Navigation = ({ currentPage, setCurrentPage, menuOpen, setMenuOpen }) => {
  const menuItems = [
    { id: 'home', label: 'Home' },
    { id: 'finance', label: 'Finance' },
    { id: 'trading', label: 'Trading' },
    { id: 'travel', label: 'Travel' },
    { id: 'tools', label: 'Tools' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleMenuClick = (pageId) => {
    setCurrentPage(pageId);
    setMenuOpen(false);
  };

  return (
    <nav className="relative">
      <div className="lg:hidden">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      <div className={`${menuOpen ? 'block' : 'hidden'} lg:block absolute lg:relative left-0 right-0 bg-white dark:bg-gray-800 lg:bg-transparent lg:dark:bg-transparent shadow-lg lg:shadow-none rounded-lg mt-2 lg:mt-0 py-2 lg:py-0`}>
        <ul className="space-y-2 lg:space-y-0 lg:flex lg:space-x-8">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleMenuClick(item.id)}
                className={`w-full text-left px-4 py-2 lg:px-0 lg:py-0 text-gray-300 hover:text-white hover:underline focus:outline-none focus:ring-0 focus:ring-offset-0 ${
                  currentPage === item.id ? 'font-semibold underline text-white' : ''
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;