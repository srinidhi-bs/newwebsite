/**
 * SIP Comparison Calculator Page
 *
 * Page wrapper for the SIP Comparison Calculator (FD vs Nifty).
 * Follows the same pattern as EMICalculatorPage, IncomeTaxCalculatorPage, etc.
 *
 * Provides:
 * - PageWrapper (animations, breadcrumbs, dot pattern)
 * - SEO meta tags via react-helmet-async
 */

import React from 'react';
import PageWrapper from '../layout/PageWrapper';
import SEO from '../common/SEO';
import SIPComparisonCalculator from '../finance/SIPComparisonCalculator';

const SIPComparisonCalculatorPage = ({ setCurrentPage }) => {
  return (
    <PageWrapper>
      <SEO routeKey="/finance/sip-comparison" />
      <SIPComparisonCalculator />
    </PageWrapper>
  );
};

export default SIPComparisonCalculatorPage;
