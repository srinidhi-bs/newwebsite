import React from 'react';
import PageWrapper from '../layout/PageWrapper';

const Trading = () => {
  return (
    <PageWrapper>
      <div>
        <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">Trading</h2>
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 dark:text-gray-100">Stock Market Services</h3>
            <p className="mb-4 dark:text-gray-300">
              With years of experience in the Indian stock market, we provide comprehensive guidance 
              and analysis to help you make informed investment decisions.
            </p>
            <ul className="list-disc ml-6 space-y-2 dark:text-gray-300">
              <li>Technical Analysis</li>
              <li>Fundamental Analysis</li>
              <li>Portfolio Management</li>
              <li>Risk Assessment</li>
              <li>Market Research</li>
            </ul>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 dark:text-gray-100">Market Insights</h3>
            <p className="dark:text-gray-300">
              Regular updates and analysis coming soon. Stay tuned for expert insights into market trends
              and investment opportunities.
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Trading;