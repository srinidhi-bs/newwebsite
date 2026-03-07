/**
 * Income Tax Calculator Page Component
 *
 * Standalone page wrapper for the Income Tax Calculator.
 * Wraps the IncomeTaxCalculator component in PageWrapper for
 * consistent page transitions and layout.
 *
 * Route: /finance/income-tax-calculator
 */

import React from 'react';
import PageWrapper from '../layout/PageWrapper';
import SEO from '../common/SEO';
import IncomeTaxCalculator from '../finance/IncomeTaxCalculator';

const IncomeTaxCalculatorPage = ({ setCurrentPage }) => {
  return (
    <PageWrapper>
      <SEO routeKey="/finance/income-tax-calculator" />
      <IncomeTaxCalculator />
    </PageWrapper>
  );
};

export default IncomeTaxCalculatorPage;
