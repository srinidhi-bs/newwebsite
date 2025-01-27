/**
 * Home Page Component
 * 
 * Landing page that showcases:
 * - Personal introduction
 * - Featured projects
 * - Skills and expertise
 * - Recent activities
 * 
 * Features:
 * - Responsive layout
 * - Dynamic content sections
 * - Animated transitions
 * - Dark mode support
 * - SEO optimization
 */

import React from 'react';
import PageWrapper from '../layout/PageWrapper';

const Home = () => {
  return (
    <PageWrapper>
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Finance-Tech-Markets Enthusiast
      </h2>
      
      <div className="space-y-6">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-lg text-gray-800 dark:text-gray-300 mb-4">
            Welcome! I'm Srinidhi, a curious person by nature and love to try out new stuff. Through my love of the intersection of finance, technology, and markets, I share my insights and explorations. This website is dedicated to bridging the gap between technology and financial literacy.
          </p>
          <p className="text-lg text-gray-800 dark:text-gray-300 mb-4">
            Beyond the world of finance and tech, I'm an avid traveler who occasionally shares visual stories and experiences from journeys around the globe.
          </p>
          <ul className="list-disc ml-6 space-y-2 text-gray-800 dark:text-gray-300">
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
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Finance & Planning</h3>
            <p className="text-gray-800 dark:text-gray-300">
              Access comprehensive financial tools and insights tailored for personal and professional needs. From EMI calculations to tax planning, find resources that simplify financial decision-making.
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Trading & Markets</h3>
            <p className="text-gray-800 dark:text-gray-300">
              Explore market analysis, trading strategies, and investment insights. Follow along as I share my experiences and observations from the financial markets.
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Useful Tools</h3>
            <p className="text-gray-800 dark:text-gray-300">
              Discover practical tools designed to make your life easier. From financial calculators to PDF utilities, access resources that enhance productivity and decision-making.
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Travel & Life</h3>
            <p className="text-gray-800 dark:text-gray-300">
              Join me on my adventures around the world. Through photos and stories, I share the places, cultures, and experiences that shape my perspective.
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Home;
