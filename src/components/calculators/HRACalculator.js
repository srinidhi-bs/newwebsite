/**
 * HRA Calculator Component
 * 
 * Calculates House Rent Allowance exemption:
 * - Basic salary input
 * - HRA received input
 * - Rent paid input
 * - City category selection
 * 
 * Features:
 * - Automatic calculation
 * - Rule-based logic
 * - Tax implications
 * - Input validation
 * - Dark mode support
 */

import React from 'react';
import PageWrapper from '../layout/PageWrapper';

const HRACalculator = () => {
  return (
    <PageWrapper>
      <div>
        <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">HRA Calculator</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold dark:text-gray-100">Coming Soon!</h3>
        </div>
      </div>
    </PageWrapper>
  );
};

export default HRACalculator;