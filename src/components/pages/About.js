import React from 'react';
import PageWrapper from '../layout/PageWrapper';

const About = () => {
  return (
    <PageWrapper>
      <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">About Us: Tech-powered Finance for Everyone!</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="mb-4 dark:text-gray-300">
          Welcome to my website! I'm Srinidhi, a tech enthusiast and accountant on a mission to bridge 
          the gap between technology and financial literacy, especially in India. Here, you'll discover 
          how leveraging technology can empower you to take control of your finances.
        </p>
        <ul className="list-disc ml-6 space-y-2 dark:text-gray-300">
          <li>
            <b className="dark:text-gray-100">Easy-to-understand articles:</b> Learn how to use technology tools and apps to manage 
            your finances, budget effectively, and invest smartly.
          </li>
          <li>
            <b className="dark:text-gray-100">Interactive calculators:</b> Simplify complex financial concepts with user-friendly 
            calculators for income tax, GST, interest rates, and EMIs.
          </li>
          <li>
            <b className="dark:text-gray-100">Tech-focused tips and tricks:</b> Discover how technology can streamline your financial 
            life and make informed decisions.
          </li>
        </ul>
      </div>
    </PageWrapper>
  );
};

export default About;