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
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { EMAIL_CONFIG } from '../../config/appConfig';

const Navigation = ({ currentPage, setCurrentPage, menuOpen, setMenuOpen }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user && EMAIL_CONFIG.ADMIN_EMAILS.includes(user.email);

  // Get base menu items
  const baseMenuItems = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'finance', label: 'Finance', path: '/finance' },
    { id: 'trading', label: 'Trading', path: '/trading' },
    { id: 'travel', label: 'Travel', path: '/travel' },
    { id: 'tools', label: 'Tools', path: '/tools' },
    { id: 'contact', label: 'Contact', path: '/contact' },
  ];

  // Add protected items based on auth state
  const menuItems = [
    ...baseMenuItems,
    ...(user ? [{ id: 'compliance-calendar', label: 'Compliance Calendar', path: '/compliance-calendar', protected: true }] : []),
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Dashboard', path: '/admin', protected: true, admin: true }] : [])
  ];

  const handleMenuClick = (item) => {
    if (item.protected && !user) {
      navigate('/login', { state: { from: item.path } });
    } else {
      navigate(item.path);
    }
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
                  ${currentPage === item.id ? 
                    'lg:text-gray-900 lg:dark:text-white lg:font-semibold lg:underline ' + 
                    'font-semibold underline text-gray-900 dark:text-white' : ''
                  }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {item.label}
                {item.protected && !user && (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="w-4 h-4 inline-block ml-1 mb-0.5 opacity-60"
                    aria-label="Login required"
                  >
                    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                  </svg>
                )}
                {item.admin && !isAdmin && (
                  <span className="hidden"></span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;