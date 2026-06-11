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
import LearnGate from './LearnGate';   // the hidden "Learn" link + password box

const Navigation = ({ setCurrentPage, menuOpen, setMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Menu items for the website
  const menuItems = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'finance', label: 'Finance', path: '/finance' },
    { id: 'trading', label: 'Trading', path: '/trading' },
    { id: 'tools', label: 'Tools', path: '/tools' },
    { id: 'cooking', label: 'Cooking', path: '/cooking' },
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
      {/* Mobile dropdown panel wears the card-skin (sticker card ☀ / frosted
          glass 🌙); on desktop (lg:) the panel dissolves into the header bar,
          so every skin property is explicitly reset at lg:.
          (Utilities can override the skin because Tailwind emits the
          utilities layer after the components layer.) */}
      <div className={`${menuOpen ? 'block' : 'hidden'} lg:block absolute lg:relative left-0 right-0 card-skin lg:bg-transparent lg:border-0 lg:shadow-none lg:rounded-none mt-2 lg:mt-0 py-2 lg:py-0`}>
        <ul className="space-y-2 lg:space-y-0 lg:flex lg:space-x-8">
          {menuItems.map((item) => (
            <li key={item.id}>
              {/* Link colors ride the tokens: muted ink that sharpens on
                  hover; the ACTIVE page gets a thick underline in the CTA
                  accent — pink marker stroke ☀ / cyan beam 🌙 */}
              <button
                onClick={() => handleMenuClick(item)}
                className={`w-full text-left px-4 py-2 lg:px-0 lg:py-0
                  font-bold transition-colors
                  focus:outline-none focus:ring-0 focus:ring-offset-0
                  ${activePage === item.id
                    ? 'text-ink underline decoration-accent-cta decoration-[3px] underline-offset-[6px]'
                    : 'text-ink-muted hover:text-ink'
                  }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {item.label}
              </button>
            </li>
          ))}

          {/* Hidden "Learn" link for Pannaga — invisible, to the right of Contact */}
          <LearnGate />
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;