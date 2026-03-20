/**
 * Capital Gains Calculator Page Component
 *
 * Standalone page wrapper for the Capital Gains Tax Exemption Calculator.
 * Wraps the CapitalGainsCalculator component in PageWrapper for
 * consistent page transitions and layout.
 *
 * Route: /finance/capital-gains-calculator
 */

import React from 'react';
import PageWrapper from '../layout/PageWrapper';
import SEO from '../common/SEO';
import CapitalGainsCalculator from '../finance/CapitalGainsCalculator';

const CapitalGainsCalculatorPage = ({ setCurrentPage }) => {
  return (
    <PageWrapper>
      <SEO routeKey="/finance/capital-gains-calculator" />
      <CapitalGainsCalculator />
    </PageWrapper>
  );
};

export default CapitalGainsCalculatorPage;
