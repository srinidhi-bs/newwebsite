/**
 * Navigation Component
 * 
 * Primary navigation menu that handles:
 * - Route navigation
 * - Active link highlighting
 * - Mobile menu state
 * - Responsive behavior
 * 
 * Features:
 * - Smooth transitions
 * - Mobile-first design
 * - Accessible navigation
 * - Dynamic active state
 * - Dark mode compatibility
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation = ({ setCurrentPage, menuOpen, setMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Menu items for the website
  const menuItems = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'finance', label: 'Finance', path: '/finance' },
    { id: 'trading', label: 'Trading', path: '/trading' },
    { id: 'tools', label: 'Tools', path: '/tools' },
    { id: 'contact', label: 'Contact', path: '/contact' },
  ];

  // Derive active page from the current URL path
  // Matches exact path or checks if the current path starts with the menu item's path
  // e.g. /finance/emi-calculator highlights "Finance", /tools/pdf-merger highlights "Tools"
  const getActivePage = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    const match = menuItems.find(item => item.path !== '/' && path.startsWith(item.path));
    return match ? match.id : 'home';
  };

  const activePage = getActivePage();

  const handleMenuClick = (item) => {
    navigate(item.path);
    setCurrentPage(item.id);
    setMenuOpen(false);
  };

  return (
    <nav className="relative">
      <div className={`${menuOpen ? 'block' : 'hidden'} lg:block absolute lg:relative left-0 right-0 bg-white dark:bg-gray-800 lg:bg-transparent lg:dark:bg-transparent shadow-lg lg:shadow-none rounded-lg mt-2 lg:mt-0 py-2 lg:py-0`}>
        <ul className="space-y-2 lg:space-y-0 lg:flex lg:space-x-8">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleMenuClick(item)}
                className={`w-full text-left px-4 py-2 lg:px-0 lg:py-0 
                  lg:text-gray-700 lg:dark:text-gray-300 lg:hover:text-gray-900 lg:dark:hover:text-white 
                  text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white 
                  hover:underline focus:outline-none focus:ring-0 focus:ring-offset-0 
                  ${activePage === item.id ?
                    'lg:text-gray-900 lg:dark:text-white lg:font-semibold lg:underline ' +
                    'font-semibold underline text-gray-900 dark:text-white' : ''
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