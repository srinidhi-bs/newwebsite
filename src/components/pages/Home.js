import React from 'react';
import PageWrapper from '../layout/PageWrapper';

const Home = () => {
  return (
    <PageWrapper>
      <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">
        Accountant | Tax Consultant | Stock Trader | Tech-Geek
      </h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Welcome to my professional website where technology meets finance. I specialize in providing modern solutions for accounting, tax consulting, and trading, leveraging technology to deliver efficient and accurate services.
        </p>
      </div>
    </PageWrapper>
  );
};

export default Home;
