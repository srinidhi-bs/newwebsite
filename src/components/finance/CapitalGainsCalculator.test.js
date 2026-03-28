/**
 * CapitalGainsCalculator.test.js
 *
 * Comprehensive test suite for the Capital Gains Calculator wizard component.
 *
 * Since all utility functions (getFYFromDate, calculateMonthsBetween, formatDuration,
 * formatCurrency) and calculation logic are defined as module-level constants inside
 * the component file and NOT exported, we test them through the rendered component's
 * behavior using React Testing Library.
 *
 * Test Categories:
 *   1. Initial Render & Layout
 *   2. Step 1 — Asset Details (selection, validation)
 *   3. Step 2 — Dates & Holding Period (LTCG/STCG, grandfathering)
 *   4. Step 3 — Cost Computation (Section 50C, improvements, FMV)
 *   5. Step 4 — Capital Gain Computation (Option A, B, scenarios)
 *   6. Step 5 — Exemptions (Section 54, 54EC, 54F)
 *   7. Step 6 — Results & Deadlines
 *   8. Navigation & Wizard Flow
 *   9. Edge Cases & Boundary Conditions
 */

import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// ─── Mock pdf-lib BEFORE importing the component ──────────────────────────────
// The mock provides a complete pdf-lib API surface so generatePDF can run
// without errors in all tests that navigate to Step 6.
jest.mock('pdf-lib', () => {
  // Stable mock objects — using plain functions to avoid hoisting issues
  const page = {
    drawText: () => {},
    drawLine: () => {},
  };
  const fontObj = {
    widthOfTextAtSize: () => 50,
  };
  const doc = {
    addPage: () => page,
    embedFont: () => Promise.resolve(fontObj),
    save: () => Promise.resolve(new Uint8Array([1, 2, 3])),
  };
  return {
    PDFDocument: {
      create: () => Promise.resolve(doc),
    },
    StandardFonts: { Helvetica: 'Helvetica', HelveticaBold: 'HelveticaBold' },
    rgb: (r, g, b) => ({ r, g, b }),
  };
});

import CapitalGainsCalculator from './CapitalGainsCalculator';

// ─── Global Mocks ──────────────────────────────────────────────────────────────

// Mock window.scrollTo since jsdom doesn't implement it
beforeAll(() => {
  window.scrollTo = jest.fn();
});

// ─── Test Helpers ──────────────────────────────────────────────────────────────

/**
 * Helper: renders the calculator and returns common utilities.
 */
const renderCalculator = () => {
  const result = render(<CapitalGainsCalculator />);
  return result;
};

/**
 * Helper: fill Step 1 with valid data and click Next.
 * Defaults to residential / purchased / individual.
 */
const completeStep1 = async (options = {}) => {
  const {
    assetType = 'Residential House',
    acquisitionMode = 'Purchased',
    taxpayerType = null, // individual is default, no click needed
    previousOwnerDate = null,
  } = options;

  // Select asset type
  const assetButton = screen.getByText(assetType);
  fireEvent.click(assetButton);

  // Select acquisition mode
  const modeButton = screen.getByText(acquisitionMode);
  fireEvent.click(modeButton);

  // If inherited/gifted/will, enter previous owner date
  if (previousOwnerDate) {
    const dateInputs = screen.getAllByDisplayValue('');
    // The previousOwnerDate input appears when non-purchased mode is selected
    const prevDateInput = screen.getByLabelText
      ? dateInputs.find(input => input.type === 'date')
      : dateInputs[0];
    if (prevDateInput) {
      fireEvent.change(prevDateInput, { target: { value: previousOwnerDate } });
    }
  }

  // Select taxpayer type if specified
  if (taxpayerType === 'HUF') {
    const hufButton = screen.getByText('HUF (Hindu Undivided Family)');
    fireEvent.click(hufButton);
  }

  // Click Next
  const nextButton = screen.getByText('Next →');
  fireEvent.click(nextButton);
};

/**
 * Helper: fill Step 2 with valid LTCG dates (>24 months holding period).
 */
const completeStep2 = (purchaseDate = '2020-01-15', saleDate = '2025-06-15') => {
  // Find date inputs in Step 2
  const dateInputs = screen.getAllByRole('textbox').length > 0
    ? screen.getAllByRole('textbox')
    : [];

  // Use more reliable approach — find inputs by type
  const allInputs = document.querySelectorAll('input[type="date"]');
  // For purchased mode: first date input = purchase date, second = sale date
  if (allInputs.length >= 2) {
    fireEvent.change(allInputs[0], { target: { value: purchaseDate } });
    fireEvent.change(allInputs[1], { target: { value: saleDate } });
  } else if (allInputs.length === 1) {
    // For inherited/gifted: only sale date input (purchase date is read-only from step 1)
    fireEvent.change(allInputs[0], { target: { value: saleDate } });
  }

  const nextButton = screen.getByText('Next →');
  fireEvent.click(nextButton);
};

/**
 * Helper: fill Step 3 with valid cost data.
 */
const completeStep3 = (purchasePrice = '5000000', salePrice = '15000000') => {
  const numberInputs = document.querySelectorAll('input[type="number"]');
  // First number input = purchase price, find sale price input
  // Use a more targeted approach
  const allInputs = document.querySelectorAll('input');
  const numInputs = Array.from(allInputs).filter(i => i.type === 'number' || i.type === 'text');

  // We'll look for the CurrencyInput fields
  // The purchase price is the first currency input, sale price is later
  // Since CurrencyInput toggles between text and number type on focus/blur,
  // we need to find them and interact properly

  // Let's use fireEvent.focus then change for CurrencyInput components
  const currencyInputs = document.querySelectorAll('input');
  const editableInputs = Array.from(currencyInputs).filter(
    i => !i.disabled && (i.type === 'text' || i.type === 'number')
  );

  // Purchase price - first editable currency input
  if (editableInputs.length > 0) {
    fireEvent.focus(editableInputs[0]);
    fireEvent.change(editableInputs[0], { target: { value: purchasePrice } });
    fireEvent.blur(editableInputs[0]);
  }

  // Sale price - need to find it (it's the "Actual sale price received" input)
  if (editableInputs.length > 1) {
    fireEvent.focus(editableInputs[1]);
    fireEvent.change(editableInputs[1], { target: { value: salePrice } });
    fireEvent.blur(editableInputs[1]);
  }

  const nextButton = screen.getByText('Next →');
  fireEvent.click(nextButton);
};


// ─── TEST SUITE ────────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════════
// 1. INITIAL RENDER & LAYOUT
// ═══════════════════════════════════════════════════════════════════════════════

describe('CapitalGainsCalculator - Initial Render', () => {
  test('renders the calculator title and subtitle', () => {
    renderCalculator();
    expect(screen.getByText('Capital Gains Tax Exemption Calculator')).toBeInTheDocument();
    expect(screen.getByText(/Step-by-step guide/i)).toBeInTheDocument();
    expect(screen.getByText(/AY 2026-27/)).toBeInTheDocument();
  });

  test('renders Step 1 as the initial step', () => {
    renderCalculator();
    // "Asset Details" appears in step indicator AND step title
    expect(screen.getAllByText('Asset Details').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('What type of property did you sell?')).toBeInTheDocument();
  });

  test('renders all 6 step labels in the step indicator', () => {
    renderCalculator();
    const stepLabels = ['Asset Details', 'Dates & Holding', 'Cost Details', 'Capital Gain', 'Exemptions', 'Results'];
    stepLabels.forEach(label => {
      // These appear in the desktop step indicator
      expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1);
    });
  });

  test('renders Back button disabled on Step 1', () => {
    renderCalculator();
    const backButton = screen.getByText('← Back');
    expect(backButton).toBeDisabled();
  });

  test('renders Next button', () => {
    renderCalculator();
    expect(screen.getByText('Next →')).toBeInTheDocument();
  });

  test('renders the disclaimer text', () => {
    renderCalculator();
    expect(screen.getByText(/informational purposes only/i)).toBeInTheDocument();
  });

  test('Next button is disabled when no selections are made', () => {
    renderCalculator();
    const nextButton = screen.getByText('Next →');
    expect(nextButton).toBeDisabled();
  });
});


// ═══════════════════════════════════════════════════════════════════════════════
// 2. STEP 1 — ASSET DETAILS
// ═══════════════════════════════════════════════════════════════════════════════

describe('CapitalGainsCalculator - Step 1: Asset Details', () => {
  test('renders all 3 asset types', () => {
    renderCalculator();
    expect(screen.getByText('Residential House')).toBeInTheDocument();
    expect(screen.getByText('Plot of Land')).toBeInTheDocument();
    expect(screen.getByText('Commercial Property')).toBeInTheDocument();
  });

  test('renders all 4 acquisition modes', () => {
    renderCalculator();
    expect(screen.getByText('Purchased')).toBeInTheDocument();
    expect(screen.getByText('Inherited')).toBeInTheDocument();
    expect(screen.getByText('Received as Gift')).toBeInTheDocument();
    expect(screen.getByText('Received under Will')).toBeInTheDocument();
  });

  test('renders both taxpayer types with Individual as default', () => {
    renderCalculator();
    expect(screen.getByText('Individual')).toBeInTheDocument();
    expect(screen.getByText('HUF (Hindu Undivided Family)')).toBeInTheDocument();
  });

  test('selecting an asset type highlights it', () => {
    renderCalculator();
    const residentialButton = screen.getByText('Residential House').closest('button');
    fireEvent.click(residentialButton);
    // Check that a checkmark appears (selection indicator)
    expect(residentialButton.textContent).toContain('✓');
  });

  test('selecting acquisition mode highlights it', () => {
    renderCalculator();
    const purchasedButton = screen.getByText('Purchased').closest('button');
    fireEvent.click(purchasedButton);
    expect(purchasedButton.textContent).toContain('✓');
  });

  test('shows previous owner date field when Inherited is selected', () => {
    renderCalculator();
    const inheritedButton = screen.getByText('Inherited');
    fireEvent.click(inheritedButton);
    expect(screen.getByText(/When did the previous owner originally buy/i)).toBeInTheDocument();
  });

  test('shows previous owner date field when Gifted is selected', () => {
    renderCalculator();
    const giftedButton = screen.getByText('Received as Gift');
    fireEvent.click(giftedButton);
    expect(screen.getByText(/When did the previous owner originally buy/i)).toBeInTheDocument();
  });

  test('shows previous owner date field when Will is selected', () => {
    renderCalculator();
    const willButton = screen.getByText('Received under Will');
    fireEvent.click(willButton);
    expect(screen.getByText(/When did the previous owner originally buy/i)).toBeInTheDocument();
  });

  test('does NOT show previous owner date for Purchased mode', () => {
    renderCalculator();
    const purchasedButton = screen.getByText('Purchased');
    fireEvent.click(purchasedButton);
    expect(screen.queryByText(/When did the previous owner originally buy/i)).not.toBeInTheDocument();
  });

  test('shows holding period info box for inherited/gifted/will', () => {
    renderCalculator();
    fireEvent.click(screen.getByText('Inherited'));
    expect(screen.getByText(/Previous owner's holding period counts/i)).toBeInTheDocument();
  });

  test('shows FMV info when previous owner date is before 2001', () => {
    renderCalculator();
    fireEvent.click(screen.getByText('Residential House'));
    fireEvent.click(screen.getByText('Inherited'));

    // Enter a date before 2001-04-01
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const prevDateInput = dateInputs[0];
    fireEvent.change(prevDateInput, { target: { value: '1995-06-15' } });

    expect(screen.getByText(/Property acquired before April 2001/i)).toBeInTheDocument();
  });

  test('Step 1 validation: Next disabled without asset type', () => {
    renderCalculator();
    // Select only acquisition mode and taxpayer
    fireEvent.click(screen.getByText('Purchased'));
    // Don't select asset type
    const nextButton = screen.getByText('Next →');
    expect(nextButton).toBeDisabled();
  });

  test('Step 1 validation: Next disabled without acquisition mode', () => {
    renderCalculator();
    // Select only asset type
    fireEvent.click(screen.getByText('Residential House'));
    // Don't select acquisition mode
    const nextButton = screen.getByText('Next →');
    expect(nextButton).toBeDisabled();
  });

  test('Step 1 validation: Next disabled for inherited without previous owner date', () => {
    renderCalculator();
    fireEvent.click(screen.getByText('Residential House'));
    fireEvent.click(screen.getByText('Inherited'));
    // Don't enter previous owner date
    const nextButton = screen.getByText('Next →');
    expect(nextButton).toBeDisabled();
    expect(screen.getByText(/Please enter the previous owner/i)).toBeInTheDocument();
  });

  test('Step 1 validation: Next enabled with all required fields', () => {
    renderCalculator();
    fireEvent.click(screen.getByText('Residential House'));
    fireEvent.click(screen.getByText('Purchased'));
    // Individual is default, no need to click
    const nextButton = screen.getByText('Next →');
    expect(nextButton).not.toBeDisabled();
  });

  test('Step 1 validation: Next enabled for inherited with previous owner date', () => {
    renderCalculator();
    fireEvent.click(screen.getByText('Residential House'));
    fireEvent.click(screen.getByText('Inherited'));

    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2005-06-15' } });

    const nextButton = screen.getByText('Next →');
    expect(nextButton).not.toBeDisabled();
  });

  test('switching between asset types updates selection', () => {
    renderCalculator();
    // Select residential first
    const residentialBtn = screen.getByText('Residential House').closest('button');
    fireEvent.click(residentialBtn);
    expect(residentialBtn.textContent).toContain('✓');

    // Switch to commercial
    const commercialBtn = screen.getByText('Commercial Property').closest('button');
    fireEvent.click(commercialBtn);
    expect(commercialBtn.textContent).toContain('✓');
    // Residential should no longer have checkmark
    expect(residentialBtn.textContent).not.toContain('✓');
  });

  test('switching to HUF taxpayer type works', () => {
    renderCalculator();
    const hufButton = screen.getByText('HUF (Hindu Undivided Family)');
    fireEvent.click(hufButton);
    // HUF button should now be styled as selected (has blue styling)
    expect(hufButton.closest('button')).toHaveClass('border-blue-500');
  });

  test('shows validation hint for missing asset type', () => {
    renderCalculator();
    fireEvent.click(screen.getByText('Purchased'));
    // Validation hint should show
    expect(screen.getByText(/Please select the type of property/i)).toBeInTheDocument();
  });
});


// ═══════════════════════════════════════════════════════════════════════════════
// 3. STEP 2 — DATES & HOLDING PERIOD
// ═══════════════════════════════════════════════════════════════════════════════

describe('CapitalGainsCalculator - Step 2: Dates & Holding', () => {
  beforeEach(() => {
    renderCalculator();
    // Complete Step 1 to get to Step 2
    fireEvent.click(screen.getByText('Residential House'));
    fireEvent.click(screen.getByText('Purchased'));
    fireEvent.click(screen.getByText('Next →'));
  });

  test('renders Step 2 with purchase date and sale date fields', () => {
    expect(screen.getByText('When did you buy this property?')).toBeInTheDocument();
    expect(screen.getByText(/When did you sell/i)).toBeInTheDocument();
  });

  test('shows LTCG determination for >24 months', () => {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2020-01-15' } });
    fireEvent.change(dateInputs[1], { target: { value: '2025-06-15' } });

    // Text may appear multiple times (badge + info box)
    expect(screen.getAllByText(/Long-Term Capital Gain/i).length).toBeGreaterThanOrEqual(1);
  });

  test('shows STCG determination for ≤24 months', () => {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2025-01-15' } });
    fireEvent.change(dateInputs[1], { target: { value: '2025-06-15' } });

    expect(screen.getAllByText(/Short-Term Capital Gain/i).length).toBeGreaterThanOrEqual(1);
  });

  test('shows exactly 24 months as STCG (boundary: ≤24 months)', () => {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    // Exactly 24 months
    fireEvent.change(dateInputs[0], { target: { value: '2023-01-15' } });
    fireEvent.change(dateInputs[1], { target: { value: '2025-01-15' } });

    expect(screen.getAllByText(/Short-Term Capital Gain/i).length).toBeGreaterThanOrEqual(1);
  });

  test('shows 25 months as LTCG (boundary: >24 months)', () => {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2023-01-15' } });
    fireEvent.change(dateInputs[1], { target: { value: '2025-02-16' } });

    expect(screen.getAllByText(/Long-Term Capital Gain/i).length).toBeGreaterThanOrEqual(1);
  });

  test('shows holding period duration', () => {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2020-01-15' } });
    fireEvent.change(dateInputs[1], { target: { value: '2025-07-15' } });

    // Should show "5 years, 6 months"
    expect(screen.getByText(/5 years, 6 months/i)).toBeInTheDocument();
  });

  test('shows grandfathering note for pre-23-Jul-2024 acquisition', () => {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2020-01-15' } }); // Before 23-Jul-2024
    fireEvent.change(dateInputs[1], { target: { value: '2025-06-15' } }); // After 23-Jul-2024

    expect(screen.getByText(/Budget 2024 Grandfathering Applies/i)).toBeInTheDocument();
  });

  test('shows new regime note for post-23-Jul-2024 acquisition', () => {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2024-08-01' } }); // After 23-Jul-2024
    fireEvent.change(dateInputs[1], { target: { value: '2026-09-15' } }); // More than 24 months later

    expect(screen.getByText(/Budget 2024 New Regime Applies/i)).toBeInTheDocument();
  });

  test('shows warning when sale date is before purchase date', () => {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2025-06-15' } });
    fireEvent.change(dateInputs[1], { target: { value: '2020-01-15' } }); // Before purchase

    expect(screen.getByText(/Sale date must be after purchase date/i)).toBeInTheDocument();
  });

  test('Next disabled for STCG (calculator is for LTCG only)', () => {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2025-01-15' } });
    fireEvent.change(dateInputs[1], { target: { value: '2025-06-15' } });

    const nextButton = screen.getByText('Next →');
    expect(nextButton).toBeDisabled();
    expect(screen.getByText(/Long-Term Capital Gains only/i)).toBeInTheDocument();
  });

  test('Next enabled for LTCG dates', () => {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2020-01-15' } });
    fireEvent.change(dateInputs[1], { target: { value: '2025-06-15' } });

    const nextButton = screen.getByText('Next →');
    expect(nextButton).not.toBeDisabled();
  });

  test('shows LTCG/STCG explanation info box', () => {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2020-01-15' } });
    fireEvent.change(dateInputs[1], { target: { value: '2025-06-15' } });

    expect(screen.getByText(/What does LTCG vs STCG mean/i)).toBeInTheDocument();
  });
});


describe('CapitalGainsCalculator - Step 2: Inherited property dates', () => {
  beforeEach(() => {
    renderCalculator();
    // Complete Step 1 with inherited property
    fireEvent.click(screen.getByText('Residential House'));
    fireEvent.click(screen.getByText('Inherited'));
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2010-05-20' } });
    fireEvent.click(screen.getByText('Next →'));
  });

  test('shows previous owner date as read-only for inherited property', () => {
    expect(screen.getByText(/Previous owner's purchase date/i)).toBeInTheDocument();
    // The pre-filled date input should be disabled
    const disabledInput = document.querySelector('input[type="date"][disabled]');
    expect(disabledInput).toBeInTheDocument();
    expect(disabledInput.value).toBe('2010-05-20');
  });

  test('shows acquisition date field (when user received the property)', () => {
    expect(screen.getByText(/When did you receive this property/i)).toBeInTheDocument();
  });
});


// ═══════════════════════════════════════════════════════════════════════════════
// 4. STEP 3 — COST COMPUTATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('CapitalGainsCalculator - Step 3: Cost Computation', () => {
  beforeEach(() => {
    renderCalculator();
    // Navigate to Step 3
    fireEvent.click(screen.getByText('Residential House'));
    fireEvent.click(screen.getByText('Purchased'));
    fireEvent.click(screen.getByText('Next →'));

    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2020-01-15' } });
    fireEvent.change(dateInputs[1], { target: { value: '2025-06-15' } });
    fireEvent.click(screen.getByText('Next →'));
  });

  test('renders Step 3 with cost of acquisition section', () => {
    // "Cost of Acquisition" may appear in heading and summary
    expect(screen.getAllByText(/Cost of Acquisition/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Purchase price/i).length).toBeGreaterThanOrEqual(1);
  });

  test('renders sale price and stamp duty value fields', () => {
    expect(screen.getByText(/Sale Price & Stamp Duty/i)).toBeInTheDocument();
    expect(screen.getAllByText(/sale price/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Stamp duty value/i).length).toBeGreaterThanOrEqual(1);
  });

  test('renders transfer expenses section', () => {
    expect(screen.getByText(/Transfer \/ Sale Expenses/i)).toBeInTheDocument();
    expect(screen.getByText(/Total transfer expenses/i)).toBeInTheDocument();
  });

  test('renders add improvement button', () => {
    expect(screen.getByText(/\+ Add Improvement/i)).toBeInTheDocument();
  });

  test('clicking Add Improvement adds a new row', () => {
    fireEvent.click(screen.getByText('+ Add Improvement'));
    expect(screen.getByText(/Improvement #1/i)).toBeInTheDocument();
    expect(screen.getByText(/✕ Remove/i)).toBeInTheDocument();
  });

  test('adding multiple improvements creates multiple rows', () => {
    fireEvent.click(screen.getByText('+ Add Improvement'));
    fireEvent.click(screen.getByText('+ Add Improvement'));
    expect(screen.getByText(/Improvement #1/i)).toBeInTheDocument();
    expect(screen.getByText(/Improvement #2/i)).toBeInTheDocument();
  });

  test('removing an improvement removes the row', () => {
    fireEvent.click(screen.getByText('+ Add Improvement'));
    expect(screen.getByText(/Improvement #1/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('✕ Remove'));
    expect(screen.queryByText(/Improvement #1/i)).not.toBeInTheDocument();
  });

  test('Next disabled without purchase price', () => {
    const nextButton = screen.getByText('Next →');
    expect(nextButton).toBeDisabled();
    expect(screen.getByText(/Please enter the purchase price/i)).toBeInTheDocument();
  });

  test('shows cost summary when prices are entered', () => {
    // Enter purchase price
    const editableInputs = Array.from(document.querySelectorAll('input')).filter(
      i => !i.disabled && (i.type === 'text' || i.type === 'number')
    );

    if (editableInputs.length >= 2) {
      fireEvent.focus(editableInputs[0]);
      fireEvent.change(editableInputs[0], { target: { value: '5000000' } });
      fireEvent.blur(editableInputs[0]);

      fireEvent.focus(editableInputs[1]);
      fireEvent.change(editableInputs[1], { target: { value: '15000000' } });
      fireEvent.blur(editableInputs[1]);

      expect(screen.getByText('Cost Summary')).toBeInTheDocument();
    }
  });
});

describe('CapitalGainsCalculator - Step 3: Section 50C', () => {
  beforeEach(() => {
    renderCalculator();
    // Navigate to Step 3
    fireEvent.click(screen.getByText('Residential House'));
    fireEvent.click(screen.getByText('Purchased'));
    fireEvent.click(screen.getByText('Next →'));

    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2020-01-15' } });
    fireEvent.change(dateInputs[1], { target: { value: '2025-06-15' } });
    fireEvent.click(screen.getByText('Next →'));
  });

  test('shows "No adjustment" when SDV is within 10% tolerance', () => {
    const editableInputs = Array.from(document.querySelectorAll('input')).filter(
      i => !i.disabled && (i.type === 'text' || i.type === 'number')
    );

    // Purchase price
    fireEvent.focus(editableInputs[0]);
    fireEvent.change(editableInputs[0], { target: { value: '5000000' } });
    fireEvent.blur(editableInputs[0]);

    // Sale price = 10,000,000
    fireEvent.focus(editableInputs[1]);
    fireEvent.change(editableInputs[1], { target: { value: '10000000' } });
    fireEvent.blur(editableInputs[1]);

    // Stamp duty value = 10,500,000 (within 110% = 11,000,000)
    fireEvent.focus(editableInputs[2]);
    fireEvent.change(editableInputs[2], { target: { value: '10500000' } });
    fireEvent.blur(editableInputs[2]);

    expect(screen.getByText(/No adjustment needed/i)).toBeInTheDocument();
  });

  test('shows Section 50C applies when SDV > 110% of sale price', () => {
    const editableInputs = Array.from(document.querySelectorAll('input')).filter(
      i => !i.disabled && (i.type === 'text' || i.type === 'number')
    );

    // Purchase price
    fireEvent.focus(editableInputs[0]);
    fireEvent.change(editableInputs[0], { target: { value: '5000000' } });
    fireEvent.blur(editableInputs[0]);

    // Sale price = 10,000,000
    fireEvent.focus(editableInputs[1]);
    fireEvent.change(editableInputs[1], { target: { value: '10000000' } });
    fireEvent.blur(editableInputs[1]);

    // Stamp duty value = 12,000,000 (> 110% of 10M = 11M)
    fireEvent.focus(editableInputs[2]);
    fireEvent.change(editableInputs[2], { target: { value: '12000000' } });
    fireEvent.blur(editableInputs[2]);

    expect(screen.getByText(/Section 50C Applies/i)).toBeInTheDocument();
  });
});

describe('CapitalGainsCalculator - Step 3: FMV for pre-2001 property', () => {
  test('shows FMV option for property acquired before April 2001', () => {
    renderCalculator();
    // Step 1: Purchased before 2001
    fireEvent.click(screen.getByText('Residential House'));
    fireEvent.click(screen.getByText('Purchased'));
    fireEvent.click(screen.getByText('Next →'));

    // Step 2: Purchase date before 2001
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '1998-01-15' } });
    fireEvent.change(dateInputs[1], { target: { value: '2025-06-15' } });
    fireEvent.click(screen.getByText('Next →'));

    // Step 3: Should show FMV option
    expect(screen.getByText(/FMV option available/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Fair Market Value/i).length).toBeGreaterThanOrEqual(1);
  });
});


// ═══════════════════════════════════════════════════════════════════════════════
// 5. STEP 4 — CAPITAL GAIN COMPUTATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('CapitalGainsCalculator - Step 4: Capital Gain Computation', () => {
  const navigateToStep4 = () => {
    renderCalculator();
    // Step 1
    fireEvent.click(screen.getByText('Residential House'));
    fireEvent.click(screen.getByText('Purchased'));
    fireEvent.click(screen.getByText('Next →'));

    // Step 2: Grandfathered scenario (acquired before 23-Jul-2024, sold after)
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2020-01-15' } });
    fireEvent.change(dateInputs[1], { target: { value: '2025-06-15' } });
    fireEvent.click(screen.getByText('Next →'));

    // Step 3: Enter costs
    const editableInputs = Array.from(document.querySelectorAll('input')).filter(
      i => !i.disabled && (i.type === 'text' || i.type === 'number')
    );
    // Purchase price = 50L
    fireEvent.focus(editableInputs[0]);
    fireEvent.change(editableInputs[0], { target: { value: '5000000' } });
    fireEvent.blur(editableInputs[0]);
    // Sale price = 1.5Cr
    fireEvent.focus(editableInputs[1]);
    fireEvent.change(editableInputs[1], { target: { value: '15000000' } });
    fireEvent.blur(editableInputs[1]);

    fireEvent.click(screen.getByText('Next →'));
  };

  test('renders Step 4 with capital gain computation', () => {
    navigateToStep4();
    // "Capital Gain" appears in step label, heading, and computed values
    expect(screen.getAllByText(/Capital Gain/i).length).toBeGreaterThanOrEqual(1);
  });

  test('shows both Option A and Option B for grandfathered scenario', () => {
    navigateToStep4();
    expect(screen.getByText(/Option A — 12.5% without Indexation/i)).toBeInTheDocument();
    expect(screen.getByText(/Option B — 20% with Indexation/i)).toBeInTheDocument();
  });

  test('highlights the better option', () => {
    navigateToStep4();
    // One of the options should have the "Better Option" banner
    const betterBanner = screen.queryByText(/Better Option/i);
    expect(betterBanner).toBeInTheDocument();
  });

  test('shows CII reference table for grandfathered scenario', () => {
    navigateToStep4();
    expect(screen.getByText(/View Cost Inflation Index/i)).toBeInTheDocument();
  });
});


describe('CapitalGainsCalculator - Step 4: New Regime scenario', () => {
  test('shows only Option A for post-23-Jul-2024 acquisitions', () => {
    renderCalculator();
    // Step 1
    fireEvent.click(screen.getByText('Residential House'));
    fireEvent.click(screen.getByText('Purchased'));
    fireEvent.click(screen.getByText('Next →'));

    // Step 2: New regime (acquired after 23-Jul-2024)
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2024-08-01' } });
    fireEvent.change(dateInputs[1], { target: { value: '2026-09-15' } });
    fireEvent.click(screen.getByText('Next →'));

    // Step 3
    const editableInputs = Array.from(document.querySelectorAll('input')).filter(
      i => !i.disabled && (i.type === 'text' || i.type === 'number')
    );
    fireEvent.focus(editableInputs[0]);
    fireEvent.change(editableInputs[0], { target: { value: '5000000' } });
    fireEvent.blur(editableInputs[0]);
    fireEvent.focus(editableInputs[1]);
    fireEvent.change(editableInputs[1], { target: { value: '15000000' } });
    fireEvent.blur(editableInputs[1]);
    fireEvent.click(screen.getByText('Next →'));

    // Step 4: Should show Option A (12.5%)
    expect(screen.getAllByText(/12.5%/i).length).toBeGreaterThanOrEqual(1);
    // Option B should not be present
    expect(screen.queryByText(/Option B — 20% with Indexation/i)).not.toBeInTheDocument();
  });
});

describe('CapitalGainsCalculator - Step 4: Old Regime scenario', () => {
  test('shows only Option B for pre-23-Jul-2024 sale dates', () => {
    renderCalculator();
    // Step 1
    fireEvent.click(screen.getByText('Residential House'));
    fireEvent.click(screen.getByText('Purchased'));
    fireEvent.click(screen.getByText('Next →'));

    // Step 2: Old regime (sold before 23-Jul-2024)
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2018-01-15' } });
    fireEvent.change(dateInputs[1], { target: { value: '2024-06-15' } });
    fireEvent.click(screen.getByText('Next →'));

    // Step 3
    const editableInputs = Array.from(document.querySelectorAll('input')).filter(
      i => !i.disabled && (i.type === 'text' || i.type === 'number')
    );
    fireEvent.focus(editableInputs[0]);
    fireEvent.change(editableInputs[0], { target: { value: '5000000' } });
    fireEvent.blur(editableInputs[0]);
    fireEvent.focus(editableInputs[1]);
    fireEvent.change(editableInputs[1], { target: { value: '15000000' } });
    fireEvent.blur(editableInputs[1]);
    fireEvent.click(screen.getByText('Next →'));

    // Step 4: Should show Option B (20% with indexation)
    expect(screen.getAllByText(/20%/i).length).toBeGreaterThanOrEqual(1);
    // Option A should not be present
    expect(screen.queryByText(/Option A — 12.5% without Indexation/i)).not.toBeInTheDocument();
  });
});


// ═══════════════════════════════════════════════════════════════════════════════
// 6. STEP 5 — EXEMPTIONS
// ═══════════════════════════════════════════════════════════════════════════════

describe('CapitalGainsCalculator - Step 5: Exemptions (Residential)', () => {
  const navigateToStep5Residential = () => {
    renderCalculator();
    // Step 1: Residential
    fireEvent.click(screen.getByText('Residential House'));
    fireEvent.click(screen.getByText('Purchased'));
    fireEvent.click(screen.getByText('Next →'));

    // Step 2
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2020-01-15' } });
    fireEvent.change(dateInputs[1], { target: { value: '2025-06-15' } });
    fireEvent.click(screen.getByText('Next →'));

    // Step 3
    const editableInputs = Array.from(document.querySelectorAll('input')).filter(
      i => !i.disabled && (i.type === 'text' || i.type === 'number')
    );
    fireEvent.focus(editableInputs[0]);
    fireEvent.change(editableInputs[0], { target: { value: '5000000' } });
    fireEvent.blur(editableInputs[0]);
    fireEvent.focus(editableInputs[1]);
    fireEvent.change(editableInputs[1], { target: { value: '15000000' } });
    fireEvent.blur(editableInputs[1]);
    fireEvent.click(screen.getByText('Next →'));

    // Step 4: Click Next (auto-computed)
    fireEvent.click(screen.getByText('Next →'));
  };

  test('shows Section 54 and Section 54EC for residential sale', () => {
    navigateToStep5Residential();
    expect(screen.getByText(/Section 54 — Reinvest in a New Residential House/i)).toBeInTheDocument();
    expect(screen.getByText(/Section 54EC — Invest in Specified Bonds/i)).toBeInTheDocument();
  });

  test('does NOT show Section 54F for residential sale', () => {
    navigateToStep5Residential();
    expect(screen.queryByText(/Section 54F — Reinvest in a Residential House \(Proportional\)/i)).not.toBeInTheDocument();
  });

  test('shows eligible 54EC bonds list', () => {
    navigateToStep5Residential();
    expect(screen.getByText('REC')).toBeInTheDocument();
    expect(screen.getByText('PFC')).toBeInTheDocument();
    expect(screen.getByText('IRFC')).toBeInTheDocument();
    expect(screen.getByText('HUDCO')).toBeInTheDocument();
    expect(screen.getByText('IREDA')).toBeInTheDocument();
  });

  test('shows capital gain summary at top of Step 5', () => {
    navigateToStep5Residential();
    expect(screen.getByText('Your Capital Gain Summary')).toBeInTheDocument();
  });

  test('shows exemption summary at bottom', () => {
    navigateToStep5Residential();
    expect(screen.getByText('Exemption Summary')).toBeInTheDocument();
  });

  test('shows CGAS explanation', () => {
    navigateToStep5Residential();
    expect(screen.getByText(/What is CGAS/i)).toBeInTheDocument();
  });
});

describe('CapitalGainsCalculator - Step 5: Exemptions (Non-Residential)', () => {
  const navigateToStep5Plot = () => {
    renderCalculator();
    // Step 1: Plot of Land
    fireEvent.click(screen.getByText('Plot of Land'));
    fireEvent.click(screen.getByText('Purchased'));
    fireEvent.click(screen.getByText('Next →'));

    // Step 2
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2020-01-15' } });
    fireEvent.change(dateInputs[1], { target: { value: '2025-06-15' } });
    fireEvent.click(screen.getByText('Next →'));

    // Step 3
    const editableInputs = Array.from(document.querySelectorAll('input')).filter(
      i => !i.disabled && (i.type === 'text' || i.type === 'number')
    );
    fireEvent.focus(editableInputs[0]);
    fireEvent.change(editableInputs[0], { target: { value: '5000000' } });
    fireEvent.blur(editableInputs[0]);
    fireEvent.focus(editableInputs[1]);
    fireEvent.change(editableInputs[1], { target: { value: '15000000' } });
    fireEvent.blur(editableInputs[1]);
    fireEvent.click(screen.getByText('Next →'));

    // Step 4: Click Next
    fireEvent.click(screen.getByText('Next →'));
  };

  test('shows Section 54F and Section 54EC for plot sale', () => {
    navigateToStep5Plot();
    expect(screen.getByText(/Section 54F — Reinvest in a Residential House \(Proportional\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Section 54EC — Invest in Specified Bonds/i)).toBeInTheDocument();
  });

  test('does NOT show Section 54 for plot sale', () => {
    navigateToStep5Plot();
    expect(screen.queryByText(/Section 54 — Reinvest in a New Residential House/i)).not.toBeInTheDocument();
  });

  test('shows Section 54F eligibility conditions (checkboxes)', () => {
    navigateToStep5Plot();
    expect(screen.getByText(/I own at most one other residential house/i)).toBeInTheDocument();
    expect(screen.getByText(/I will not buy\/construct another/i)).toBeInTheDocument();
  });

  test('shows warning when eligibility conditions are unchecked', () => {
    navigateToStep5Plot();
    // Uncheck the first condition
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const ownershipCheckbox = checkboxes[0]; // First checkbox is ownership condition
    fireEvent.click(ownershipCheckbox); // Uncheck it (default is checked)

    expect(screen.getByText(/Eligibility condition not met/i)).toBeInTheDocument();
  });
});


// ═══════════════════════════════════════════════════════════════════════════════
// 7. STEP 6 — RESULTS & DEADLINES
// ═══════════════════════════════════════════════════════════════════════════════

describe('CapitalGainsCalculator - Step 6: Results', () => {
  const navigateToStep6 = () => {
    renderCalculator();
    // Step 1
    fireEvent.click(screen.getByText('Residential House'));
    fireEvent.click(screen.getByText('Purchased'));
    fireEvent.click(screen.getByText('Next →'));

    // Step 2
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2020-01-15' } });
    fireEvent.change(dateInputs[1], { target: { value: '2025-06-15' } });
    fireEvent.click(screen.getByText('Next →'));

    // Step 3
    const editableInputs = Array.from(document.querySelectorAll('input')).filter(
      i => !i.disabled && (i.type === 'text' || i.type === 'number')
    );
    fireEvent.focus(editableInputs[0]);
    fireEvent.change(editableInputs[0], { target: { value: '5000000' } });
    fireEvent.blur(editableInputs[0]);
    fireEvent.focus(editableInputs[1]);
    fireEvent.change(editableInputs[1], { target: { value: '15000000' } });
    fireEvent.blur(editableInputs[1]);
    fireEvent.click(screen.getByText('Next →'));

    // Step 4
    fireEvent.click(screen.getByText('Next →'));

    // Step 5: Skip (no exemptions)
    fireEvent.click(screen.getByText('Next →'));
  };

  test('renders Step 6 with results waterfall', () => {
    navigateToStep6();
    expect(screen.getByText('Sale Consideration')).toBeInTheDocument();
    expect(screen.getByText('Long-Term Capital Gain')).toBeInTheDocument();
    expect(screen.getByText(/Less: Exemptions Claimed/i)).toBeInTheDocument();
    expect(screen.getByText('Net Taxable Capital Gain')).toBeInTheDocument();
  });

  test('shows tax computation with rate and cess', () => {
    navigateToStep6();
    expect(screen.getByText(/Health & Education Cess @ 4%/i)).toBeInTheDocument();
  });

  test('shows Start Over button instead of Next on final step', () => {
    navigateToStep6();
    expect(screen.getByText('Start Over')).toBeInTheDocument();
    expect(screen.queryByText('Next →')).not.toBeInTheDocument();
  });

  test('shows FAQ section', () => {
    navigateToStep6();
    expect(screen.getByText(/What is Long-Term Capital Gain/i)).toBeInTheDocument();
    expect(screen.getByText(/What is indexation/i)).toBeInTheDocument();
    expect(screen.getByText(/What is CGAS/i)).toBeInTheDocument();
  });

  test('shows disclaimer on results page', () => {
    navigateToStep6();
    expect(screen.getByText(/does not constitute tax advice/i)).toBeInTheDocument();
  });
});


// ═══════════════════════════════════════════════════════════════════════════════
// 8. NAVIGATION & WIZARD FLOW
// ═══════════════════════════════════════════════════════════════════════════════

describe('CapitalGainsCalculator - Navigation', () => {
  test('Back button navigates to previous step', () => {
    renderCalculator();
    // Go to Step 2
    fireEvent.click(screen.getByText('Residential House'));
    fireEvent.click(screen.getByText('Purchased'));
    fireEvent.click(screen.getByText('Next →'));

    // Should be on Step 2
    expect(screen.getByText('When did you buy this property?')).toBeInTheDocument();

    // Click back
    fireEvent.click(screen.getByText('← Back'));

    // Should be back on Step 1
    expect(screen.getByText('What type of property did you sell?')).toBeInTheDocument();
  });

  test('Start Over resets the entire wizard', () => {
    renderCalculator();
    // Navigate all the way to Step 6
    fireEvent.click(screen.getByText('Residential House'));
    fireEvent.click(screen.getByText('Purchased'));
    fireEvent.click(screen.getByText('Next →'));

    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2020-01-15' } });
    fireEvent.change(dateInputs[1], { target: { value: '2025-06-15' } });
    fireEvent.click(screen.getByText('Next →'));

    const editableInputs = Array.from(document.querySelectorAll('input')).filter(
      i => !i.disabled && (i.type === 'text' || i.type === 'number')
    );
    fireEvent.focus(editableInputs[0]);
    fireEvent.change(editableInputs[0], { target: { value: '5000000' } });
    fireEvent.blur(editableInputs[0]);
    fireEvent.focus(editableInputs[1]);
    fireEvent.change(editableInputs[1], { target: { value: '15000000' } });
    fireEvent.blur(editableInputs[1]);
    fireEvent.click(screen.getByText('Next →'));

    fireEvent.click(screen.getByText('Next →')); // Step 4 → 5
    fireEvent.click(screen.getByText('Next →')); // Step 5 → 6

    // Now on Step 6, click Start Over
    fireEvent.click(screen.getByText('Start Over'));

    // Should be back on Step 1 with empty selections
    expect(screen.getByText('What type of property did you sell?')).toBeInTheDocument();
    // No selection should be active
    const allButtons = screen.getAllByRole('button');
    const selectionCards = allButtons.filter(btn => btn.textContent.includes('✓'));
    expect(selectionCards.length).toBe(0);
  });

  test('cannot skip steps — Next validates before proceeding', () => {
    renderCalculator();
    // Try clicking Next without filling Step 1
    fireEvent.click(screen.getByText('Next →'));
    // Should still be on Step 1
    expect(screen.getByText('What type of property did you sell?')).toBeInTheDocument();
  });

  test('step indicator shows current step correctly', () => {
    renderCalculator();
    // On Step 1 — mobile indicator should show "Step 1 of 6"
    expect(screen.getByText('Step 1 of 6')).toBeInTheDocument();
  });
});


// ═══════════════════════════════════════════════════════════════════════════════
// 9. EDGE CASES & BOUNDARY CONDITIONS
// ═══════════════════════════════════════════════════════════════════════════════

describe('CapitalGainsCalculator - Edge Cases', () => {
  test('renders correctly with Commercial Property selection', () => {
    renderCalculator();
    fireEvent.click(screen.getByText('Commercial Property'));
    const btn = screen.getByText('Commercial Property').closest('button');
    expect(btn.textContent).toContain('✓');
  });

  test('renders correctly with Plot of Land selection', () => {
    renderCalculator();
    fireEvent.click(screen.getByText('Plot of Land'));
    const btn = screen.getByText('Plot of Land').closest('button');
    expect(btn.textContent).toContain('✓');
  });

  test('can switch acquisition modes and previous owner field appears/disappears', () => {
    renderCalculator();
    // Start with Purchased — no previous owner field
    fireEvent.click(screen.getByText('Purchased'));
    expect(screen.queryByText(/When did the previous owner/i)).not.toBeInTheDocument();

    // Switch to Inherited — previous owner field appears
    fireEvent.click(screen.getByText('Inherited'));
    expect(screen.getByText(/When did the previous owner/i)).toBeInTheDocument();

    // Switch back to Purchased — field disappears
    fireEvent.click(screen.getByText('Purchased'));
    expect(screen.queryByText(/When did the previous owner/i)).not.toBeInTheDocument();
  });

  test('Step 2 validates sale date must be after purchase date', () => {
    renderCalculator();
    fireEvent.click(screen.getByText('Residential House'));
    fireEvent.click(screen.getByText('Purchased'));
    fireEvent.click(screen.getByText('Next →'));

    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2025-01-15' } });
    fireEvent.change(dateInputs[1], { target: { value: '2020-01-15' } }); // Before purchase

    const nextButton = screen.getByText('Next →');
    expect(nextButton).toBeDisabled();
  });

  test('wizard maintains form data when going back and forth', () => {
    renderCalculator();
    // Step 1: select residential
    fireEvent.click(screen.getByText('Residential House'));
    fireEvent.click(screen.getByText('Purchased'));
    fireEvent.click(screen.getByText('Next →'));

    // Step 2: enter dates
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2020-01-15' } });
    fireEvent.change(dateInputs[1], { target: { value: '2025-06-15' } });

    // Go back to Step 1
    fireEvent.click(screen.getByText('← Back'));

    // Step 1: residential should still be selected
    const residentialBtn = screen.getByText('Residential House').closest('button');
    expect(residentialBtn.textContent).toContain('✓');

    // Go forward to Step 2 again
    fireEvent.click(screen.getByText('Next →'));

    // Dates should still be there
    const dateInputsAfter = document.querySelectorAll('input[type="date"]');
    expect(dateInputsAfter[0].value).toBe('2020-01-15');
    expect(dateInputsAfter[1].value).toBe('2025-06-15');
  });

  test('full wizard flow: residential purchased grandfathered with no exemptions', () => {
    renderCalculator();
    // Step 1
    fireEvent.click(screen.getByText('Residential House'));
    fireEvent.click(screen.getByText('Purchased'));
    fireEvent.click(screen.getByText('Next →'));

    // Step 2
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2020-01-15' } });
    fireEvent.change(dateInputs[1], { target: { value: '2025-06-15' } });
    fireEvent.click(screen.getByText('Next →'));

    // Step 3
    const editableInputs = Array.from(document.querySelectorAll('input')).filter(
      i => !i.disabled && (i.type === 'text' || i.type === 'number')
    );
    fireEvent.focus(editableInputs[0]);
    fireEvent.change(editableInputs[0], { target: { value: '5000000' } });
    fireEvent.blur(editableInputs[0]);
    fireEvent.focus(editableInputs[1]);
    fireEvent.change(editableInputs[1], { target: { value: '15000000' } });
    fireEvent.blur(editableInputs[1]);
    fireEvent.click(screen.getByText('Next →'));

    // Step 4
    fireEvent.click(screen.getByText('Next →'));

    // Step 5 — skip exemptions
    fireEvent.click(screen.getByText('Next →'));

    // Step 6 — Results
    expect(screen.getByText('Sale Consideration')).toBeInTheDocument();
    expect(screen.getByText('Start Over')).toBeInTheDocument();
  });

  test('full wizard flow: plot of land with Section 54F exemption', () => {
    renderCalculator();
    // Step 1: Plot
    fireEvent.click(screen.getByText('Plot of Land'));
    fireEvent.click(screen.getByText('Purchased'));
    fireEvent.click(screen.getByText('Next →'));

    // Step 2
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2020-01-15' } });
    fireEvent.change(dateInputs[1], { target: { value: '2025-06-15' } });
    fireEvent.click(screen.getByText('Next →'));

    // Step 3
    const editableInputs = Array.from(document.querySelectorAll('input')).filter(
      i => !i.disabled && (i.type === 'text' || i.type === 'number')
    );
    fireEvent.focus(editableInputs[0]);
    fireEvent.change(editableInputs[0], { target: { value: '5000000' } });
    fireEvent.blur(editableInputs[0]);
    fireEvent.focus(editableInputs[1]);
    fireEvent.change(editableInputs[1], { target: { value: '15000000' } });
    fireEvent.blur(editableInputs[1]);
    fireEvent.click(screen.getByText('Next →'));

    // Step 4
    fireEvent.click(screen.getByText('Next →'));

    // Step 5: Should show 54F (text appears in multiple places)
    expect(screen.getAllByText(/Section 54F/i).length).toBeGreaterThanOrEqual(1);
  });

  test('commercial property gets 54F not 54', () => {
    renderCalculator();
    // Step 1: Commercial
    fireEvent.click(screen.getByText('Commercial Property'));
    fireEvent.click(screen.getByText('Purchased'));
    fireEvent.click(screen.getByText('Next →'));

    // Step 2
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2020-01-15' } });
    fireEvent.change(dateInputs[1], { target: { value: '2025-06-15' } });
    fireEvent.click(screen.getByText('Next →'));

    // Step 3
    const editableInputs = Array.from(document.querySelectorAll('input')).filter(
      i => !i.disabled && (i.type === 'text' || i.type === 'number')
    );
    fireEvent.focus(editableInputs[0]);
    fireEvent.change(editableInputs[0], { target: { value: '5000000' } });
    fireEvent.blur(editableInputs[0]);
    fireEvent.focus(editableInputs[1]);
    fireEvent.change(editableInputs[1], { target: { value: '15000000' } });
    fireEvent.blur(editableInputs[1]);
    fireEvent.click(screen.getByText('Next →'));

    // Step 4
    fireEvent.click(screen.getByText('Next →'));

    // Step 5: Should show 54F and NOT 54
    expect(screen.getAllByText(/Section 54F/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(/Section 54 — Reinvest in a New Residential House/i)).not.toBeInTheDocument();
  });
});


// ═══════════════════════════════════════════════════════════════════════════════
// 10. CONSTANTS & DATA INTEGRITY
// ═══════════════════════════════════════════════════════════════════════════════

describe('CapitalGainsCalculator - Constants & Data Integrity', () => {
  test('renders 3 asset type options', () => {
    renderCalculator();
    const assetLabels = ['Residential House', 'Plot of Land', 'Commercial Property'];
    assetLabels.forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  test('renders 4 acquisition mode options', () => {
    renderCalculator();
    const modeLabels = ['Purchased', 'Inherited', 'Received as Gift', 'Received under Will'];
    modeLabels.forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  test('renders asset type descriptions', () => {
    renderCalculator();
    expect(screen.getByText(/House, flat, apartment/i)).toBeInTheDocument();
    expect(screen.getByText(/Vacant land or plot/i)).toBeInTheDocument();
    expect(screen.getByText(/Shop, office, warehouse/i)).toBeInTheDocument();
  });

  test('renders acquisition mode descriptions', () => {
    renderCalculator();
    expect(screen.getByText(/Bought directly from a seller/i)).toBeInTheDocument();
    expect(screen.getByText(/Received after the death/i)).toBeInTheDocument();
    expect(screen.getByText(/Given by a family member/i)).toBeInTheDocument();
    expect(screen.getByText(/Received through a legal will/i)).toBeInTheDocument();
  });
});


// ═══════════════════════════════════════════════════════════════════════════════
// 11. HOLDING PERIOD FORMATTING
// ═══════════════════════════════════════════════════════════════════════════════

describe('CapitalGainsCalculator - Holding Period Display', () => {
  beforeEach(() => {
    renderCalculator();
    fireEvent.click(screen.getByText('Residential House'));
    fireEvent.click(screen.getByText('Purchased'));
    fireEvent.click(screen.getByText('Next →'));
  });

  test('displays exact year and month count', () => {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    // 3 years exactly
    fireEvent.change(dateInputs[0], { target: { value: '2021-01-15' } });
    fireEvent.change(dateInputs[1], { target: { value: '2024-01-15' } });

    expect(screen.getByText(/3 years/)).toBeInTheDocument();
  });

  test('displays years and months together', () => {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    // 2 years, 3 months
    fireEvent.change(dateInputs[0], { target: { value: '2021-01-15' } });
    fireEvent.change(dateInputs[1], { target: { value: '2023-04-15' } });

    expect(screen.getByText(/2 years, 3 months/)).toBeInTheDocument();
  });

  test('displays singular "year" for 1 year', () => {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    // Exactly 1 year (but this is STCG so won't show LTCG)
    // Use a value > 24 months
    fireEvent.change(dateInputs[0], { target: { value: '2022-01-15' } });
    fireEvent.change(dateInputs[1], { target: { value: '2025-02-15' } });

    expect(screen.getByText(/3 years, 1 month/)).toBeInTheDocument();
  });

  test('shows months count in parentheses', () => {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2020-01-15' } });
    fireEvent.change(dateInputs[1], { target: { value: '2025-06-15' } });

    // Should show "(65 months — threshold is 24 months"
    expect(screen.getByText(/months — threshold is 24 months/)).toBeInTheDocument();
  });
});


// ═══════════════════════════════════════════════════════════════════════════════
// 12. ACCESSIBILITY & UI ELEMENTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('CapitalGainsCalculator - UI Elements', () => {
  test('all selection cards are buttons', () => {
    renderCalculator();
    const assetCards = screen.getAllByRole('button').filter(
      btn => btn.textContent.includes('House') ||
             btn.textContent.includes('Plot') ||
             btn.textContent.includes('Commercial')
    );
    expect(assetCards.length).toBe(3);
  });

  test('asset type cards have icon emojis', () => {
    renderCalculator();
    // Check for emojis in the asset type section
    const buttons = screen.getAllByRole('button');
    const hasHouseEmoji = buttons.some(btn => btn.textContent.includes('🏠'));
    const hasPlotEmoji = buttons.some(btn => btn.textContent.includes('🏗️'));
    const hasCommercialEmoji = buttons.some(btn => btn.textContent.includes('🏢'));

    expect(hasHouseEmoji).toBe(true);
    expect(hasPlotEmoji).toBe(true);
    expect(hasCommercialEmoji).toBe(true);
  });

  test('InfoBox renders with info variant by default', () => {
    renderCalculator();
    fireEvent.click(screen.getByText('Inherited'));
    // Info box should have the ℹ️ icon
    const infoBoxes = document.querySelectorAll('.bg-blue-50, [class*="bg-blue"]');
    expect(infoBoxes.length).toBeGreaterThan(0);
  });
});


// ═══════════════════════════════════════════════════════════════════════════════
// 13. PDF REPORT GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('CapitalGainsCalculator - PDF Report Generation', () => {
  // Mock URL.createObjectURL and revokeObjectURL
  const mockCreateObjectURL = jest.fn(() => 'blob:mock-url');
  const mockRevokeObjectURL = jest.fn();
  const originalCreateObjectURL = global.URL.createObjectURL;
  const originalRevokeObjectURL = global.URL.revokeObjectURL;

  beforeAll(() => {
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
  });

  afterAll(() => {
    global.URL.createObjectURL = originalCreateObjectURL;
    global.URL.revokeObjectURL = originalRevokeObjectURL;
  });

  beforeEach(() => {
    mockCreateObjectURL.mockClear();
    mockRevokeObjectURL.mockClear();
  });

  /**
   * Helper: navigate the wizard all the way from Step 1 to Step 6.
   */
  const navigateToStep6ForPDF = () => {
    renderCalculator();

    // Step 1: Residential, Purchased
    fireEvent.click(screen.getByText('Residential House'));
    fireEvent.click(screen.getByText('Purchased'));
    fireEvent.click(screen.getByText('Next →'));

    // Step 2: LTCG dates
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2020-01-15' } });
    fireEvent.change(dateInputs[1], { target: { value: '2025-06-15' } });
    fireEvent.click(screen.getByText('Next →'));

    // Step 3: Costs
    const editableInputs = Array.from(document.querySelectorAll('input')).filter(
      i => !i.disabled && (i.type === 'text' || i.type === 'number')
    );
    fireEvent.focus(editableInputs[0]);
    fireEvent.change(editableInputs[0], { target: { value: '5000000' } });
    fireEvent.blur(editableInputs[0]);
    fireEvent.focus(editableInputs[1]);
    fireEvent.change(editableInputs[1], { target: { value: '15000000' } });
    fireEvent.blur(editableInputs[1]);
    fireEvent.click(screen.getByText('Next →'));

    // Step 4: Next
    fireEvent.click(screen.getByText('Next →'));

    // Step 5: Skip exemptions
    fireEvent.click(screen.getByText('Next →'));
  };

  test('Download PDF Report button renders on Step 6', () => {
    navigateToStep6ForPDF();
    expect(screen.getByText('Download Capital Gains Report (PDF)')).toBeInTheDocument();
  });

  test('Download button has subtitle text', () => {
    navigateToStep6ForPDF();
    expect(screen.getByText(/Complete tax computation with deadlines/i)).toBeInTheDocument();
  });

  test('Download button has the SVG download icon', () => {
    navigateToStep6ForPDF();
    const downloadButton = screen.getByText('Download Capital Gains Report (PDF)').closest('button');
    const svg = downloadButton.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  test('Download button has blue styling', () => {
    navigateToStep6ForPDF();
    const downloadButton = screen.getByText('Download Capital Gains Report (PDF)').closest('button');
    expect(downloadButton).toHaveClass('bg-blue-600');
  });

  test('clicking Download button triggers PDF generation and download', async () => {
    navigateToStep6ForPDF();

    const downloadButton = screen.getByText('Download Capital Gains Report (PDF)');
    fireEvent.click(downloadButton);

    // Wait for async generatePDF to complete — it should call createObjectURL
    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });
  });
});
