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
import useDocumentTitle from '../../hooks/useDocumentTitle';
import IncomeTaxCalculator from '../finance/IncomeTaxCalculator';

const IncomeTaxCalculatorPage = ({ setCurrentPage }) => {
  // Set browser tab title for SEO
  useDocumentTitle('Income Tax Calculator');

  return (
    <PageWrapper>
      <IncomeTaxCalculator />
    </PageWrapper>
  );
};

export default IncomeTaxCalculatorPage;
