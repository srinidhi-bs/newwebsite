/**
 * IncomeTaxCalculator.test.js
 *
 * Tests for the Income Tax Calculator's multi-FY support (FY 2025-26 & FY 2026-27).
 *
 * Two layers:
 *   1. Engine unit tests — call the pure computeTaxForRegime() directly and assert
 *      exact rupee figures. Covers the 3 worked examples from
 *      docs/research-fy-2026-27.md §9, the senior/super-senior slab schedules, the
 *      "FY 2026-27 is numerically identical to FY 2025-26" invariant, and the
 *      date-based getCurrentFY() helper.
 *   2. RTL smoke tests — render the component to confirm the FY pills, the default
 *      FY heading, and that switching regime reveals the Old-Regime inputs. (UI
 *      behaviour that needs the DOM is covered here, matching the project's
 *      CapitalGainsCalculator.test.js convention.)
 *
 * Why unit-test the engine directly: computeTaxForRegime is a pure, FY-keyed
 * function (extracted in IT-2). Asserting tax math on it is exact and fast, and
 * avoids the brittleness of typing deduction values into DOM inputs.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock pdf-lib BEFORE importing the component (mirrors CapitalGainsCalculator.test.js).
// The component imports pdf-lib at module load; the mock keeps tests fast and lets
// the Download button render without pulling in the real (heavy) library.
jest.mock('pdf-lib', () => {
  const page = { drawText: () => {}, drawLine: () => {} };
  const font = { widthOfTextAtSize: () => 50 };
  const doc = {
    addPage: () => page,
    embedFont: () => Promise.resolve(font),
    save: () => Promise.resolve(new Uint8Array([1, 2, 3])),
  };
  return {
    PDFDocument: { create: () => Promise.resolve(doc) },
    StandardFonts: { Helvetica: 'Helvetica', HelveticaBold: 'HelveticaBold' },
    rgb: (r, g, b) => ({ r, g, b }),
  };
});

import IncomeTaxCalculator, { computeTaxForRegime } from './IncomeTaxCalculator';
import { TAX_CONFIG, FY_LIST, getCurrentFY } from './tax-config';

// =============================================================================
// Engine unit tests — worked examples (research-fy-2026-27.md §9)
// =============================================================================
describe('computeTaxForRegime — FY 2026-27 worked examples', () => {
  // Example A — salaried ₹10,00,000, no investments
  test('A: New Regime ₹10L → ₹0 (87A rebate applies)', () => {
    const r = computeTaxForRegime('2026-27', 'new', 'general', 1000000, 0);
    expect(r.totalTax).toBe(0);
    expect(r.rebateApplied).toBe(true);
  });

  test('A: Old Regime ₹10L, no deductions → ₹1,06,600', () => {
    const r = computeTaxForRegime('2026-27', 'old', 'general', 1000000, 0);
    expect(r.totalTax).toBe(106600);
  });

  // Example B — salaried ₹25,00,000; 80C 1.5L + 80CCD(1B) 50k + 80D 25k = ₹2.25L
  test('B: New Regime ₹25L → ₹3,19,800 (deductions not allowed)', () => {
    const r = computeTaxForRegime('2026-27', 'new', 'general', 2500000, 225000);
    expect(r.totalTax).toBe(319800);
  });

  test('B: Old Regime ₹25L, deductions ₹2.25L → ₹4,99,200', () => {
    const r = computeTaxForRegime('2026-27', 'old', 'general', 2500000, 225000);
    expect(r.totalTax).toBe(499200);
  });

  // Example C — senior (65), ₹60,00,000; 80C 1.5L + 80D 50k + 80TTB 10k = ₹2.1L
  // Exercises the surcharge path (income > ₹50L → 10%, marginal relief not triggered).
  test('C: New Regime senior ₹60L → ₹15,52,980 (incl. 10% surcharge)', () => {
    const r = computeTaxForRegime('2026-27', 'new', 'senior', 6000000, 210000);
    expect(r.totalTax).toBe(1552980);
    expect(r.surchargeRate).toBe(0.10);
    expect(r.marginalRelief).toBe(0);
  });

  test('C: Old Regime senior ₹60L, deductions ₹2.1L → ₹17,52,608', () => {
    const r = computeTaxForRegime('2026-27', 'old', 'senior', 6000000, 210000);
    expect(r.totalTax).toBe(1752608);
    expect(r.surchargeRate).toBe(0.10);
  });
});

// =============================================================================
// Engine unit tests — Old Regime age categories
// =============================================================================
// Same gross (₹15L) and deductions (₹1.75L = the UI defaults: 80C 1.5L + 80D 25k),
// so only the basic-exemption band differs. Higher exemption → progressively
// lower tax (super-senior ≤ senior ≤ general).
describe('computeTaxForRegime — Old Regime age categories @ ₹15L, deductions ₹1.75L', () => {
  const DED = 175000;

  test('General (<60) → ₹2,02,800', () => {
    expect(computeTaxForRegime('2026-27', 'old', 'general', 1500000, DED).totalTax).toBe(202800);
  });

  test('Senior (60–80) → ₹2,00,200', () => {
    expect(computeTaxForRegime('2026-27', 'old', 'senior', 1500000, DED).totalTax).toBe(200200);
  });

  test('Super Senior (80+) → ₹1,89,800', () => {
    expect(computeTaxForRegime('2026-27', 'old', 'superSenior', 1500000, DED).totalTax).toBe(189800);
  });

  test('exemption ordering: superSenior ≤ senior ≤ general', () => {
    const g = computeTaxForRegime('2026-27', 'old', 'general', 1500000, DED).totalTax;
    const s = computeTaxForRegime('2026-27', 'old', 'senior', 1500000, DED).totalTax;
    const ss = computeTaxForRegime('2026-27', 'old', 'superSenior', 1500000, DED).totalTax;
    expect(ss).toBeLessThanOrEqual(s);
    expect(s).toBeLessThanOrEqual(g);
  });
});

// =============================================================================
// Engine unit tests — FY 2026-27 ≡ FY 2025-26 (invariant)
// =============================================================================
// Finance Act 2026 changed no modelled value, so FY 2026-27 reuses FY 2025-26's
// config by reference. This invariant guards against an accidental future
// divergence (e.g., someone edits one FY's slabs but not the other).
describe('computeTaxForRegime — FY 2026-27 is identical to FY 2025-26', () => {
  const INCOMES = [750000, 2500000, 6000000, 30000000];
  // age is irrelevant under the New Regime, so only vary it for the Old Regime
  const CASES = [
    { regime: 'new', age: 'general' },
    { regime: 'old', age: 'general' },
    { regime: 'old', age: 'senior' },
    { regime: 'old', age: 'superSenior' },
  ];

  INCOMES.forEach((income) => {
    CASES.forEach(({ regime, age }) => {
      test(`identical @ ₹${income} / ${regime} / ${age}`, () => {
        const a = computeTaxForRegime('2026-27', regime, age, income, 150000);
        const b = computeTaxForRegime('2025-26', regime, age, income, 150000);
        expect(a).toEqual(b);
      });
    });
  });
});

// =============================================================================
// Engine unit tests — getCurrentFY (date-based default)
// =============================================================================
// Dates built with the numeric constructor (year, monthIndex, day) so they are
// LOCAL time — avoids the UTC-parse pitfall of new Date('2026-04-01').
describe('getCurrentFY — picks FY by date with fallback', () => {
  test('March 2026 (still FY 2025-26)', () => {
    expect(getCurrentFY(new Date(2026, 2, 15))).toBe('2025-26');
  });

  test('April 2026 (FY 2026-27 begins)', () => {
    expect(getCurrentFY(new Date(2026, 3, 1))).toBe('2026-27');
  });

  test('unconfigured future FY falls back to latest configured (FY_LIST[0])', () => {
    expect(getCurrentFY(new Date(2030, 5, 1))).toBe(FY_LIST[0]);
  });
});

// =============================================================================
// RTL smoke tests — UI wiring
// =============================================================================
describe('IncomeTaxCalculator — UI wiring', () => {
  test('renders both FY pills', () => {
    render(<IncomeTaxCalculator />);
    expect(screen.getByText('FY 2026-27 (AY 2027-28)')).toBeInTheDocument();
    expect(screen.getByText('FY 2025-26 (AY 2026-27)')).toBeInTheDocument();
  });

  test('default FY heading matches getCurrentFY()', () => {
    render(<IncomeTaxCalculator />);
    const expectedLabel = TAX_CONFIG[getCurrentFY()].shortLabel;
    expect(
      screen.getByText(`Income Tax Calculator (${expectedLabel})`)
    ).toBeInTheDocument();
  });

  test('switching to Old Regime reveals age category + deduction sections', () => {
    render(<IncomeTaxCalculator />);
    // Age Category and deductions are Old-Regime-only (progressive disclosure)
    expect(screen.queryByText('Age Category')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Old Regime'));

    expect(screen.getByText('Age Category')).toBeInTheDocument();
    expect(screen.getByText('Deductions (Chapter VI-A)')).toBeInTheDocument();
  });
});
