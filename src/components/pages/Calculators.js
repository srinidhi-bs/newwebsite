import React from 'react';
import PageWrapper from '../layout/PageWrapper';

const Calculators = ({ setCurrentPage }) => {
  const handleCalculatorClick = (calculatorId) => {
    setCurrentPage(calculatorId);
  };

  const calculators = [
    {
      id: 'hra-calculator',
      title: 'HRA Calculator',
      description: 'Calculate your House Rent Allowance exemption',
      icon: '🏠'
    },
    {
      id: 'income-tax-calculator',
      title: 'Income Tax Calculator',
      description: 'Calculate your income tax liability for FY 2024-25',
      icon: '💰'
    },
    {
      id: 'emi-calculator',
      title: 'EMI Calculator',
      description: 'Calculate your loan EMI and total interest payment',
      icon: '🏦'
    }
  ];

  return (
    <PageWrapper>
      <div>
        <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">Financial Calculators</h2>
        <p className="mb-6 dark:text-gray-300">
          Use these calculators to help you make informed financial decisions. 
          All calculations are done instantly and securely in your browser.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calculators.map((calc) => (
            <div
              key={calc.id}
              onClick={() => handleCalculatorClick(calc.id)}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-3">{calc.icon}</div>
              <h3 className="text-lg font-semibold mb-2 dark:text-gray-100">{calc.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{calc.description}</p>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Calculators;