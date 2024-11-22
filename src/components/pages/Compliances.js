import React from 'react';
import PageWrapper from '../layout/PageWrapper';

const Compliances = () => {
  return (
    <PageWrapper>
      <div>
        <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">Compliances</h2>
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 dark:text-gray-100">Compliance-related information and resources</h3>
            <ul className="list-disc ml-6 space-y-2 dark:text-gray-300">
              <li>GST Returns Filing</li>
              <li>Income Tax Returns</li>
              <li>TDS Returns</li>
              <li>PF/ESI Returns</li>
              <li>ROC Filings</li>
            </ul>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Compliances;