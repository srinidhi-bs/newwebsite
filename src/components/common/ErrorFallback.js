/**
 * ErrorFallback Component
 *
 * Friendly fallback UI displayed when an ErrorBoundary catches a render crash.
 * Matches the visual style of NotFound.js — centered content, large icon, action buttons.
 *
 * Features:
 * - "Something Went Wrong" heading with warning icon
 * - "Try Again" button (resets the error boundary or reloads the page)
 * - "Go Home" link (React Router Link for route-level, plain <a> for global-level)
 * - Collapsible "Error Details" section for debugging
 * - Full dark mode support via TailwindCSS dark: classes
 *
 * Props:
 * - error {Error} - The error object caught by the boundary
 * - resetErrorBoundary {Function} - Callback to reset the boundary and retry rendering
 * - level {string} - "route" (default) or "global"
 *   - "route": Uses React Router <Link> for navigation (Router is still intact)
 *   - "global": Uses plain <a href="/"> and window.location.reload() (Router may be broken)
 *
 * @component
 * @param {Object} props
 * @returns {React.ReactElement} The error fallback UI
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ErrorFallback = ({ error, resetErrorBoundary, level = 'route' }) => {
  // Determine if this is the global-level fallback (Router context may be unavailable)
  const isGlobal = level === 'global';

  /**
   * Handle the "Try Again" button click.
   * - Route-level: calls resetErrorBoundary to clear the error and re-render children.
   * - Global-level: reloads the entire page since the Router may be broken.
   */
  const handleRetry = () => {
    if (isGlobal) {
      window.location.reload();
    } else {
      resetErrorBoundary();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Warning icon */}
      <ExclamationTriangleIcon className="w-16 h-16 text-red-500 dark:text-red-400 mb-4" />

      {/* Heading */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        Something Went Wrong
      </h2>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        An unexpected error occurred. You can try again or go back to the home page.
      </p>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        {/* Try Again button */}
        <button
          onClick={handleRetry}
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
        >
          Try Again
        </button>

        {/* Go Home link — plain <a> for global (Router may be broken), <Link> for route */}
        {isGlobal ? (
          <a
            href="/"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Go Home
          </a>
        ) : (
          <Link
            to="/"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Go Home
          </Link>
        )}
      </div>

      {/* Collapsible error details for debugging */}
      <details className="text-left max-w-lg w-full text-sm">
        <summary className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 select-none">
          Error Details
        </summary>
        <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-auto text-red-600 dark:text-red-400 text-xs max-h-40">
          {error?.message || 'Unknown error'}
        </pre>
      </details>
    </div>
  );
};

export default ErrorFallback;
