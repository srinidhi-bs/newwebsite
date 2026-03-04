/**
 * Finance Page Component
 *
 * Landing page for financial tools, displayed as a tile grid.
 * Each tile navigates to a dedicated calculator page.
 *
 * Pattern: Matches the Tools page layout (tile grid → individual pages).
 *
 * Available calculators:
 * - EMI Calculator (/finance/emi-calculator)
 * - Income Tax Calculator (/finance/income-tax-calculator)
 *
 * Features:
 * - Responsive tile grid layout
 * - Dark mode support
 * - Page transition animations (via PageWrapper)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../layout/PageWrapper';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const Finance = ({ setCurrentPage }) => {
  useDocumentTitle('Finance Tools');
  const navigate = useNavigate();

  // Navigate to the selected calculator page
  const handleToolClick = (path) => {
    navigate(path);
  };

  return (
    <PageWrapper>
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Finance Tools</h2>

      {/* Intro card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Explore our suite of financial calculators designed to help you plan your finances better.
          Whether you're planning a loan, calculating taxes, or optimizing your salary structure, we've got you covered.
        </p>
      </div>

      {/* Calculator tiles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* EMI Calculator Tile */}
        <div
          className="bg-white dark:bg-gray-800/50 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleToolClick('/finance/emi-calculator')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              EMI Calculator
            </h2>
            {/* Calculator icon */}
            <svg
              className="w-6 h-6 text-gray-500 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Calculate your Equated Monthly Installment for home loans, car loans, and personal loans. View detailed amortization schedules and interest breakdowns.
          </p>
          <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400">
            Try it now
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>

        {/* Income Tax Calculator Tile */}
        <div
          className="bg-white dark:bg-gray-800/50 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleToolClick('/finance/income-tax-calculator')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Income Tax Calculator
            </h2>
            {/* Document/tax icon */}
            <svg
              className="w-6 h-6 text-gray-500 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
              />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Compare Old and New tax regimes for the current financial year. Get a detailed tax breakdown with applicable deductions and exemptions.
          </p>
          <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400">
            Try it now
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>

        {/* More finance tools can be added here */}
      </div>
    </PageWrapper>
  );
};

export default Finance;
