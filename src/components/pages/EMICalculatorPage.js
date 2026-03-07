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
import SEO from '../common/SEO';
import EMICalculator from '../finance/EMICalculator';

const EMICalculatorPage = ({ setCurrentPage }) => {
  return (
    <PageWrapper>
      <SEO routeKey="/finance/emi-calculator" />
      <EMICalculator />
    </PageWrapper>
  );
};

export default EMICalculatorPage;
