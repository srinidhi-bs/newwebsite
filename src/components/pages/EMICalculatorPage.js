/**
 * EMI Calculator Page Component
 *
 * Standalone page wrapper for the EMI Calculator.
 * Wraps the EMICalculator component in PageWrapper for
 * consistent page transitions and layout.
 *
 * Route: /finance/emi-calculator
 */

import React from 'react';
import PageWrapper from '../layout/PageWrapper';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import EMICalculator from '../finance/EMICalculator';

const EMICalculatorPage = ({ setCurrentPage }) => {
  // Set browser tab title for SEO
  useDocumentTitle('EMI Calculator');

  return (
    <PageWrapper>
      <EMICalculator />
    </PageWrapper>
  );
};

export default EMICalculatorPage;
