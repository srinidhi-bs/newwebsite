/**
 * Finance Page Component
 * 
 * Financial tools and information including:
 * - Investment calculators
 * - Market analysis
 * - Portfolio tracking
 * - Financial resources
 * 
 * Features:
 * - Interactive calculators
 * - Data visualization
 * - Real-time updates
 * - Educational content
 * - Dark mode support
 */

import React, { useState } from 'react';
import PageWrapper from '../layout/PageWrapper';
import EMICalculator from '../finance/EMICalculator';
import IncomeTaxCalculator from '../finance/IncomeTaxCalculator';
import HRACalculator from '../finance/HRACalculator';

const Finance = () => {
  const [activeTab, setActiveTab] = useState('emi');

  const tabs = [
    { id: 'emi', label: 'EMI Calculator' },
    { id: 'tax', label: 'Income Tax' },
    { id: 'hra', label: 'HRA Calculator' },
    { id: 'resources', label: 'Resources' },
  ];

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 dark:text-gray-100">Finance Tools</h2>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Explore our suite of financial calculators designed to help you plan your finances better.
            Whether you're planning a loan, calculating taxes, or optimizing your salary structure, we've got you covered.
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 dark:border-gray-700 pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-t-lg font-medium transition-all duration-200 ${activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg transform -translate-y-1'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300 ease-in-out">
          {activeTab === 'emi' && (
            <div className="animate-fadeIn">
              <EMICalculator />
            </div>
          )}

          {activeTab === 'tax' && (
            <div className="animate-fadeIn">
              <IncomeTaxCalculator />
            </div>
          )}

          {activeTab === 'hra' && (
            <div className="animate-fadeIn">
              <HRACalculator />
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 animate-fadeIn">
              <h3 className="text-2xl font-semibold mb-4 dark:text-gray-100">Financial Resources</h3>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  Here are some helpful resources to guide your financial journey:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <a href="https://www.incometax.gov.in/iec/foportal/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                      Income Tax Department Portal
                    </a> - Official site for filing returns and checking tax rules.
                  </li>
                  <li>
                    <a href="https://www.rbi.org.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                      Reserve Bank of India
                    </a> - For latest monetary policies and repo rates.
                  </li>
                  <li>
                    <a href="https://www.sebi.gov.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                      SEBI
                    </a> - Securities and Exchange Board of India for market regulations.
                  </li>
                </ul>
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Disclaimer:</strong> The calculators provided on this website are for informational purposes only.
                    Please consult a qualified financial advisor or tax professional before making any financial decisions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Finance;
