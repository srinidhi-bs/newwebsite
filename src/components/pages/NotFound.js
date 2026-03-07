/**
 * NotFound (404) Page Component
 *
 * Displayed when the user navigates to a route that does not exist.
 * Provides a friendly message and navigation links back to useful pages.
 *
 * Features:
 * - Clear "404 Page Not Found" message
 * - Link back to the home page
 * - Quick links to popular sections (Tools, Finance)
 * - Dark mode support
 * - SEO meta tags via the centralized SEO component
 *
 * Route: catch-all (*) in AnimatedRoutes.js
 *
 * @component
 * @returns {React.ReactElement} The 404 Not Found page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../layout/PageWrapper';
import SEO from '../common/SEO';

const NotFound = () => {
  return (
    <PageWrapper>
      <SEO routeKey="/404" />

      {/* Centered 404 content */}
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        {/* Large 404 number */}
        <h1 className="text-8xl font-extrabold text-gray-200 dark:text-gray-700 select-none mb-2">
          404
        </h1>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Primary action — go home */}
        <Link
          to="/"
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md mb-6"
        >
          Go Back Home
        </Link>

        {/* Secondary links to popular sections */}
        <div className="flex flex-wrap gap-4 justify-center text-sm">
          <Link
            to="/tools"
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Browse Tools
          </Link>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <Link
            to="/finance"
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Finance Calculators
          </Link>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <Link
            to="/contact"
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Contact
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
};

export default NotFound;
