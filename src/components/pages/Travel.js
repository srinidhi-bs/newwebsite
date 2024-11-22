import React from 'react';
import PageWrapper from '../layout/PageWrapper';

const Travel = () => {
  return (
    <PageWrapper>
      <div>
        <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">Travel</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold dark:text-gray-100">Coming Soon!</h3>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Travel;
