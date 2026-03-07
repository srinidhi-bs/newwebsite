# Session 25 — Error Boundaries & Income Tax Surcharge
**Date:** 2026-03-07

## What was done

### Feature 1: Error Boundaries
- Created custom ErrorBoundary class component (no new dependency)
- Created ErrorFallback with warning icon, Try Again/Go Home buttons, collapsible error details
- Global boundary in App.js (wraps Router, uses window.reload for recovery)
- Route-level boundaries in AnimatedRoutes.js (withErrorBoundary helper for all 16 routes)
- Dark mode support, auto-resets on navigation

### Feature 2: Income Tax Surcharge with Marginal Relief
- Added surcharge computation for AY 2026-27 (both Old and New regimes)
- Rates: 10% (50L-1Cr), 15% (1Cr-2Cr), 25% (2Cr-5Cr), 37%/25% (>5Cr old/new)
- Marginal relief prevents unfair tax jumps at thresholds
- Fixed cess calculation: now 4% of (tax + surcharge), not just base tax
- Income slider extended from 50L to 5 Crore
- Results UI reordered: Gross Income -> Standard Deduction -> Taxable Income -> Base Tax -> Surcharge -> Cess
- PDF report updated with surcharge/marginal relief rows
- All calculations verified against ClearTax reference data

## Files created (2)
- src/components/common/ErrorBoundary.js
- src/components/common/ErrorFallback.js

## Files modified (3)
- src/App.js (global error boundary)
- src/components/layout/AnimatedRoutes.js (route-level error boundaries, withErrorBoundary helper)
- src/components/finance/IncomeTaxCalculator.js (surcharge, marginal relief, UI reorder, slider range)

## Testing
- Build compiles with zero errors
- Surcharge calculations verified with 5 test cases (including marginal relief edge cases)
- Dev server tested locally

## Next session
- Consider: back-to-top button, accessibility improvements, performance optimization
- Remaining suggestions: image optimization, PWA/service worker, analytics
