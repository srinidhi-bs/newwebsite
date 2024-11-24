import React from 'react';
import PageWrapper from '../layout/PageWrapper';

const Home = () => {
  return (
    <PageWrapper>
      <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">
        Finance-Tech-Markets Enthusiast
      </h2>
      
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            Welcome! I'm Srinidhi, passionate about the intersection of finance, technology, and markets. Here, I share my experiences, insights, and explorations while helping bridge the gap between technology and financial literacy.
          </p>
          <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              <b className="text-gray-900 dark:text-gray-100">Financial Expertise:</b> Providing insights on personal finance, tax planning, and investment strategies.
            </li>
            <li>
              <b className="text-gray-900 dark:text-gray-100">Trading Journey:</b> Sharing market analysis, trading experiences, and investment approaches.
            </li>
            <li>
              <b className="text-gray-900 dark:text-gray-100">Tech Solutions:</b> Creating tools and resources to simplify financial calculations and everyday tasks.
            </li>
          </ul>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">Finance & Planning</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Access comprehensive financial tools and insights tailored for personal and professional needs. From EMI calculations to tax planning, find resources that simplify financial decision-making.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">Trading & Markets</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Explore market analysis, trading strategies, and investment insights. Follow along as I share my experiences and observations from the financial markets.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">Useful Tools</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Discover practical tools designed to make your life easier. From financial calculators to PDF utilities, access resources that enhance productivity and decision-making.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">Travel & Life</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Join me on my adventures around the world. Through photos and stories, I share the places, cultures, and experiences that shape my perspective.
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Home;
