import React from 'react';
import PageWrapper from '../layout/PageWrapper';

const Finance = () => {
  return (
    <PageWrapper>
      <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">Finance</h2>
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            Explore financial tools and resources designed to help you make informed decisions about your money.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">EMI Calculator</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Calculate your Equated Monthly Installments (EMI) for loans with our easy-to-use calculator.
            </p>
            <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">Coming Soon!</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">HRA Calculator</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Determine your House Rent Allowance benefits and tax savings.
            </p>
            <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">Coming Soon!</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">Income Tax Calculator</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Estimate your income tax liability under both old and new tax regimes.
            </p>
            <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">Coming Soon!</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">Financial Resources</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Access guides and articles about personal finance, tax planning, and investment basics.
            </p>
            <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">Coming Soon!</p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Finance;
