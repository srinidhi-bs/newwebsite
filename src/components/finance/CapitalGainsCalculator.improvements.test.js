/**
 * CapitalGainsCalculator.improvements.test.js
 *
 * Focused test: Add two improvements in Step 3, then verify both
 * Option A (12.5%) and Option B (20% with indexation) appear in Step 4
 * for a grandfathered scenario.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CapitalGainsCalculator from './CapitalGainsCalculator';

// Mock window.scrollTo (jsdom doesn't implement it)
beforeAll(() => {
  window.scrollTo = jest.fn();
});

/**
 * Helper: find all non-disabled text/number inputs on the page.
 */
const getEditableInputs = () =>
  Array.from(document.querySelectorAll('input')).filter(
    (i) => !i.disabled && (i.type === 'text' || i.type === 'number')
  );

/**
 * Helper: set a CurrencyInput value (focus → change → blur).
 */
const setCurrencyInput = (input, value) => {
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value } });
  fireEvent.blur(input);
};

describe('Step 3 Improvements → Step 4 dual-option display', () => {
  beforeEach(() => {
    render(<CapitalGainsCalculator />);

    // ── Step 1: Residential, Purchased, Individual ───────────────────
    fireEvent.click(screen.getByText('Residential House'));
    fireEvent.click(screen.getByText('Purchased'));
    fireEvent.click(screen.getByText('Next →'));

    // ── Step 2: Grandfathered dates (acquired before 23-Jul-2024,
    //            sold after → both options available) ────────────────
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2015-04-10' } }); // purchase
    fireEvent.change(dateInputs[1], { target: { value: '2025-08-20' } }); // sale
    fireEvent.click(screen.getByText('Next →'));
  });

  test('two improvements are added and both Option A & B appear in Step 4', () => {
    // ── Step 3: Enter cost data ──────────────────────────────────────

    // Purchase price = ₹40,00,000
    let inputs = getEditableInputs();
    setCurrencyInput(inputs[0], '4000000');

    // Sale price = ₹1,20,00,000
    inputs = getEditableInputs(); // re-query after state update
    setCurrencyInput(inputs[1], '12000000');

    // ── Add Improvement #1 ───────────────────────────────────────────
    fireEvent.click(screen.getByText('+ Add Improvement'));
    expect(screen.getByText('Improvement #1')).toBeInTheDocument();

    // Fill improvement #1 fields (description, amount, date)
    const imp1Row = screen.getByText('Improvement #1').closest('div[class*="rounded-lg"]');
    const imp1Inputs = imp1Row.querySelectorAll('input');
    // imp1Inputs[0] = description (text), [1] = amount (number), [2] = date
    fireEvent.change(imp1Inputs[0], { target: { value: 'Kitchen renovation' } });
    fireEvent.change(imp1Inputs[1], { target: { value: '500000' } });
    fireEvent.change(imp1Inputs[2], { target: { value: '2018-06-15' } });

    // ── Add Improvement #2 ───────────────────────────────────────────
    fireEvent.click(screen.getByText('+ Add Improvement'));
    expect(screen.getByText('Improvement #2')).toBeInTheDocument();

    const imp2Row = screen.getByText('Improvement #2').closest('div[class*="rounded-lg"]');
    const imp2Inputs = imp2Row.querySelectorAll('input');
    fireEvent.change(imp2Inputs[0], { target: { value: 'Bathroom remodeling' } });
    fireEvent.change(imp2Inputs[1], { target: { value: '300000' } });
    fireEvent.change(imp2Inputs[2], { target: { value: '2021-03-10' } });

    // Verify both improvements are visible
    expect(screen.getByText('Improvement #1')).toBeInTheDocument();
    expect(screen.getByText('Improvement #2')).toBeInTheDocument();

    // Next button should be enabled (all required fields filled)
    const nextButton = screen.getByText('Next →');
    expect(nextButton).not.toBeDisabled();

    // ── Navigate to Step 4 ───────────────────────────────────────────
    fireEvent.click(nextButton);

    // ── Verify Step 4: Both Option A and Option B are displayed ──────

    // Option A: 12.5% without Indexation
    expect(
      screen.getByText('Option A — 12.5% without Indexation')
    ).toBeInTheDocument();

    // Option B: 20% with Indexation
    expect(
      screen.getByText('Option B — 20% with Indexation')
    ).toBeInTheDocument();

    // The "Better Option" banner should appear on one of them
    expect(screen.getByText(/Better Option/i)).toBeInTheDocument();

    // CII table should be available (since this is grandfathered)
    expect(
      screen.getByText(/View Cost Inflation Index/i)
    ).toBeInTheDocument();

    // Both rate badges should be visible
    expect(screen.getAllByText('12.5%').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('20%').length).toBeGreaterThanOrEqual(1);
  });

  test('improvement amounts are reflected in the Step 4 calculation breakdown', () => {
    // ── Step 3: costs + two improvements ─────────────────────────────

    let inputs = getEditableInputs();
    setCurrencyInput(inputs[0], '4000000');   // purchase price
    inputs = getEditableInputs();
    setCurrencyInput(inputs[1], '12000000');  // sale price

    // Improvement #1: ₹5,00,000 in FY 2018-19
    fireEvent.click(screen.getByText('+ Add Improvement'));
    const imp1Row = screen.getByText('Improvement #1').closest('div[class*="rounded-lg"]');
    const imp1Inputs = imp1Row.querySelectorAll('input');
    fireEvent.change(imp1Inputs[0], { target: { value: 'Floor tiling' } });
    fireEvent.change(imp1Inputs[1], { target: { value: '500000' } });
    fireEvent.change(imp1Inputs[2], { target: { value: '2018-07-01' } });

    // Improvement #2: ₹3,00,000 in FY 2021-22
    fireEvent.click(screen.getByText('+ Add Improvement'));
    const imp2Row = screen.getByText('Improvement #2').closest('div[class*="rounded-lg"]');
    const imp2Inputs = imp2Row.querySelectorAll('input');
    fireEvent.change(imp2Inputs[0], { target: { value: 'Painting' } });
    fireEvent.change(imp2Inputs[1], { target: { value: '300000' } });
    fireEvent.change(imp2Inputs[2], { target: { value: '2021-09-15' } });

    // Go to Step 4
    fireEvent.click(screen.getByText('Next →'));

    // ── Verify both options exist ────────────────────────────────────
    expect(
      screen.getByText('Option A — 12.5% without Indexation')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Option B — 20% with Indexation')
    ).toBeInTheDocument();

    // ── Expand Option A breakdown ────────────────────────────────────
    // Find and click the "Show detailed breakdown" button
    const breakdownButtons = screen.getAllByText(/Show detailed breakdown/i);
    expect(breakdownButtons.length).toBeGreaterThanOrEqual(1);

    // Click the first breakdown button (Option A)
    fireEvent.click(breakdownButtons[0]);

    // After expanding, the breakdown should show cost of improvement line
    // The improvement total = 5L + 3L = 8L = ₹ 8,00,000
    expect(screen.getAllByText(/8,00,000/i).length).toBeGreaterThanOrEqual(1);
  });

  test('Step 4 Next button is enabled after computation with improvements', () => {
    // Quick setup: costs + one improvement
    let inputs = getEditableInputs();
    setCurrencyInput(inputs[0], '4000000');
    inputs = getEditableInputs();
    setCurrencyInput(inputs[1], '12000000');

    fireEvent.click(screen.getByText('+ Add Improvement'));
    const impRow = screen.getByText('Improvement #1').closest('div[class*="rounded-lg"]');
    const impInputs = impRow.querySelectorAll('input');
    fireEvent.change(impInputs[0], { target: { value: 'Extension' } });
    fireEvent.change(impInputs[1], { target: { value: '200000' } });
    fireEvent.change(impInputs[2], { target: { value: '2019-05-01' } });

    // Navigate to Step 4
    fireEvent.click(screen.getByText('Next →'));

    // Next should be enabled on Step 4
    const nextButton = screen.getByText('Next →');
    expect(nextButton).not.toBeDisabled();

    // Can proceed to Step 5
    fireEvent.click(nextButton);
    expect(screen.getByText('Exemption Summary')).toBeInTheDocument();
  });
});
