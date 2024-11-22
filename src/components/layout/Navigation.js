import React from 'react';

const Navigation = ({ currentPage, setCurrentPage, menuOpen, setMenuOpen }) => {
  const handlePageChange = (newPage) => {
    // Guard against unnecessary updates
    if (currentPage === newPage) {
      console.log('Navigation: skipping update, already on page:', newPage);
      return;
    }

    console.log('Navigation: changing page from', currentPage, 'to', newPage);
    setCurrentPage(newPage);
    setMenuOpen(false);
  };

  const pages = [
    'home',
    'about',
    'services',
    'blog',
    'compliances',
    'calculators',
    'tools',
    'trading',
    'travel',
    'contact'
  ];

  return (
    <nav className={`${menuOpen ? 'block' : 'hidden'} lg:block mt-4 lg:mt-0`}>
      <ul className="lg:flex lg:space-x-8 space-y-2 lg:space-y-0">
        {pages.map((page) => (
          <li key={page}>
            <button
              onClick={() => handlePageChange(page)}
              className={`text-white hover:underline capitalize focus:outline-none focus:ring-0 focus:ring-offset-0 outline-none ${
                currentPage === page ? 'underline font-semibold' : ''
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {page}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;