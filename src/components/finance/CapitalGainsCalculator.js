/**
 * CapitalGainsCalculator.js
 *
 * Multi-step wizard for computing capital gains on property sales in India
 * and claiming exemptions under Sections 54, 54EC, 54F.
 *
 * Wizard Steps:
 *   1. Asset Details (asset type, acquisition mode, taxpayer type)
 *   2. Dates & Holding Period (purchase/sale dates, STCG/LTCG determination)
 *   3. Cost Computation (placeholder)
 *   4. Capital Gain Computation (placeholder)
 *   5. Exemption Options (placeholder)
 *   6. Results & Deadlines (placeholder)
 *
 * Tax rules baseline: AY 2026-27 (FY 2025-26)
 * CII for FY 2025-26 = 376 (CBDT Notification No. 70/2025)
 *
 * @component
 */

import React, { useState, useMemo, useCallback } from 'react';

// ─── Constants ──────────────────────────────────────────────────────────────────

/** Total number of wizard steps */
const TOTAL_STEPS = 6;

/** Step labels for the progress indicator */
const STEP_LABELS = [
  'Asset Details',
  'Dates & Holding',
  'Cost Details',
  'Capital Gain',
  'Exemptions',
  'Results',
];

/** Asset types the user can select from */
const ASSET_TYPES = [
  {
    value: 'residential',
    label: 'Residential House',
    description: 'House, flat, apartment, or bungalow used for living',
    icon: '🏠',
  },
  {
    value: 'plot',
    label: 'Plot of Land',
    description: 'Vacant land or plot without any building on it',
    icon: '🏗️',
  },
  {
    value: 'commercial',
    label: 'Commercial Property',
    description: 'Shop, office, warehouse, or any non-residential building',
    icon: '🏢',
  },
];

/** How the property was acquired */
const ACQUISITION_MODES = [
  {
    value: 'purchased',
    label: 'Purchased',
    description: 'Bought directly from a seller',
    icon: '💰',
  },
  {
    value: 'inherited',
    label: 'Inherited',
    description: 'Received after the death of the previous owner',
    icon: '📜',
  },
  {
    value: 'gifted',
    label: 'Received as Gift',
    description: 'Given by a family member or anyone without payment',
    icon: '🎁',
  },
  {
    value: 'will',
    label: 'Received under Will',
    description: 'Received through a legal will / testament',
    icon: '📋',
  },
];

/** Taxpayer types eligible for Sections 54/54F */
const TAXPAYER_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'huf', label: 'HUF (Hindu Undivided Family)' },
];

/**
 * Holding period threshold for immovable property (in months).
 * If held > 24 months → Long-Term Capital Gain (LTCG).
 * Reduced from 36 to 24 months by Finance Act, 2017 (AY 2018-19).
 */
const LTCG_THRESHOLD_MONTHS = 24;

/**
 * Budget 2024 grandfathering cutoff date.
 * Properties acquired before this date get the choice between
 * 12.5% (no indexation) and 20% (with indexation).
 * Properties acquired on/after this date: only 12.5% without indexation.
 */
const GRANDFATHERING_CUTOFF = new Date('2024-07-23');

/**
 * Cost Inflation Index (CII) table from FY 2001-02 (base year = 100) to FY 2025-26.
 * Used for computing indexed cost of acquisition and improvements.
 * Base year changed from 1981-82 to 2001-02 by Finance Act 2017.
 * CII for FY 2025-26 = 376 (CBDT Notification No. 70/2025 dated 01-07-2025).
 *
 * Key format: 'YYYY-YY' (e.g. '2001-02')
 */
const CII_TABLE = {
  '2001-02': 100,
  '2002-03': 105,
  '2003-04': 109,
  '2004-05': 113,
  '2005-06': 117,
  '2006-07': 122,
  '2007-08': 129,
  '2008-09': 137,
  '2009-10': 148,
  '2010-11': 167,
  '2011-12': 184,
  '2012-13': 200,
  '2013-14': 220,
  '2014-15': 240,
  '2015-16': 254,
  '2016-17': 264,
  '2017-18': 272,
  '2018-19': 280,
  '2019-20': 289,
  '2020-21': 301,
  '2021-22': 317,
  '2022-23': 331,
  '2023-24': 348,
  '2024-25': 363,
  '2025-26': 376,
};

/**
 * Returns the financial year string ('YYYY-YY') for a given date.
 * FY runs from 1 April to 31 March.
 * e.g. '2024-07-15' → '2024-25', '2025-03-01' → '2024-25'
 *
 * @param {string} dateStr - ISO date string (YYYY-MM-DD)
 * @returns {string|null} FY string like '2024-25', or null if invalid
 */
const getFYFromDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;

  const year = d.getFullYear();
  const month = d.getMonth(); // 0-indexed (0 = Jan, 3 = Apr)

  // If month is Jan–Mar (0–2), FY started in the previous calendar year
  const fyStart = month < 3 ? year - 1 : year;
  const fyEnd = fyStart + 1;

  // Return in 'YYYY-YY' format (e.g. '2024-25')
  return `${fyStart}-${String(fyEnd).slice(2)}`;
};

/**
 * Formats a number as Indian currency (₹) with lakh/crore grouping.
 * e.g. 1234567 → '₹ 12,34,567'
 *
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹ 0';
  const num = Math.round(Number(amount));
  // Indian number system: first 3 digits, then groups of 2
  const str = Math.abs(num).toString();
  let result = '';
  if (str.length <= 3) {
    result = str;
  } else {
    result = str.slice(-3);
    let remaining = str.slice(0, -3);
    while (remaining.length > 2) {
      result = remaining.slice(-2) + ',' + result;
      remaining = remaining.slice(0, -2);
    }
    if (remaining.length > 0) {
      result = remaining + ',' + result;
    }
  }
  return `₹ ${num < 0 ? '-' : ''}${result}`;
};

// ─── Helper Functions ───────────────────────────────────────────────────────────

/**
 * Calculates the number of full months between two dates.
 * Holding period runs from date of acquisition to date of transfer.
 *
 * @param {string} startDateStr - ISO date string (YYYY-MM-DD) for purchase/acquisition
 * @param {string} endDateStr - ISO date string (YYYY-MM-DD) for sale/transfer
 * @returns {number} Number of full months, or 0 if dates are invalid
 */
const calculateMonthsBetween = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return 0;

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  // Validate dates
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  if (end <= start) return 0;

  // Calculate full months difference
  const yearDiff = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();
  const dayDiff = end.getDate() - start.getDate();

  // Total months: if the day-of-month in end is less than start,
  // we haven't completed that last month yet
  let totalMonths = yearDiff * 12 + monthDiff;
  if (dayDiff < 0) {
    totalMonths -= 1;
  }

  return Math.max(0, totalMonths);
};

/**
 * Formats a month count into a human-readable string.
 * e.g. 30 → "2 years, 6 months"
 *
 * @param {number} months - Total months
 * @returns {string} Formatted duration string
 */
const formatDuration = (months) => {
  if (months <= 0) return '—';
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  const parts = [];
  if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
  if (remainingMonths > 0) parts.push(`${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`);
  return parts.join(', ');
};

// ─── Sub-Components ─────────────────────────────────────────────────────────────

/**
 * InfoBox — a beginner-friendly information callout.
 * Used throughout the wizard to explain tax concepts in simple language.
 *
 * @param {Object} props
 * @param {string} props.title - Short heading for the info box
 * @param {React.ReactNode} props.children - Explanation text
 * @param {string} [props.variant='info'] - 'info' (blue) or 'warning' (amber)
 */
const InfoBox = ({ title, children, variant = 'info' }) => {
  // Color classes based on variant
  const colors = variant === 'warning'
    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200'
    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200';

  const iconBg = variant === 'warning'
    ? 'bg-amber-100 dark:bg-amber-800'
    : 'bg-blue-100 dark:bg-blue-800';

  return (
    <div className={`p-4 rounded-lg border ${colors} flex items-start gap-3`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full ${iconBg} flex items-center justify-center text-sm`}>
        {variant === 'warning' ? '⚠️' : 'ℹ️'}
      </div>
      <div>
        {title && <p className="font-semibold mb-1">{title}</p>}
        <div className="text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
};

/**
 * SelectionCard — a clickable card for choosing one option from a set.
 * Used for asset type, acquisition mode, etc.
 *
 * @param {Object} props
 * @param {string} props.icon - Emoji or icon string
 * @param {string} props.label - Primary label
 * @param {string} props.description - Secondary description
 * @param {boolean} props.selected - Whether this card is currently selected
 * @param {Function} props.onClick - Click handler
 */
const SelectionCard = ({ icon, label, description, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer
      ${selected
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400 shadow-md'
        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm'
      }`}
  >
    <div className="flex items-start gap-3">
      <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className={`font-semibold ${selected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>
          {label}
        </p>
        <p className={`text-sm mt-0.5 ${selected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {description}
        </p>
      </div>
      {/* Selection indicator */}
      {selected && (
        <span className="ml-auto flex-shrink-0 text-blue-500 dark:text-blue-400 text-xl">✓</span>
      )}
    </div>
  </button>
);

/**
 * StepIndicator — horizontal progress bar showing all wizard steps.
 * Highlights completed, current, and upcoming steps.
 *
 * @param {Object} props
 * @param {number} props.currentStep - Currently active step (1-based)
 * @param {number} props.totalSteps - Total number of steps
 * @param {string[]} props.labels - Array of step labels
 */
const StepIndicator = ({ currentStep, totalSteps, labels }) => (
  <div className="mb-8">
    {/* Desktop step indicator — full labels */}
    <div className="hidden md:flex items-center justify-between">
      {labels.map((label, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;

        return (
          <React.Fragment key={stepNum}>
            {/* Step circle + label */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors duration-200
                  ${isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isCurrent
                      ? 'bg-blue-500 border-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                  }`}
              >
                {isCompleted ? '✓' : stepNum}
              </div>
              <span
                className={`mt-2 text-xs font-medium text-center
                  ${isCurrent
                    ? 'text-blue-600 dark:text-blue-400'
                    : isCompleted
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
              >
                {label}
              </span>
            </div>

            {/* Connector line between steps */}
            {stepNum < totalSteps && (
              <div
                className={`flex-1 h-0.5 mx-2 mt-[-1rem] transition-colors duration-200
                  ${isCompleted
                    ? 'bg-green-400 dark:bg-green-500'
                    : 'bg-gray-200 dark:bg-gray-600'
                  }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>

    {/* Mobile step indicator — compact */}
    <div className="md:hidden">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
          {labels[currentStep - 1]}
        </span>
      </div>
      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  </div>
);

// ─── Step Components ────────────────────────────────────────────────────────────

/**
 * Step1AssetDetails — collects asset type, acquisition mode, and taxpayer type.
 *
 * If the property was inherited / gifted / received under will, an additional
 * field asks for the previous owner's original purchase date (needed for
 * holding period calculation per Section 2(42A) Explanation 1).
 *
 * @param {Object} props
 * @param {Object} props.formData - Current wizard form state
 * @param {Function} props.updateField - Callback to update a single field
 */
const Step1AssetDetails = ({ formData, updateField }) => (
  <div className="space-y-8">
    {/* ── Asset Type ─────────────────────────────────────────────────── */}
    <div>
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
        What type of property did you sell?
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Select the type of immovable property you transferred (or plan to transfer).
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {ASSET_TYPES.map((type) => (
          <SelectionCard
            key={type.value}
            icon={type.icon}
            label={type.label}
            description={type.description}
            selected={formData.assetType === type.value}
            onClick={() => updateField('assetType', type.value)}
          />
        ))}
      </div>
    </div>

    {/* ── Acquisition Mode ──────────────────────────────────────────── */}
    <div>
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
        How did you acquire this property?
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        This affects the cost of acquisition and holding period calculation.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ACQUISITION_MODES.map((mode) => (
          <SelectionCard
            key={mode.value}
            icon={mode.icon}
            label={mode.label}
            description={mode.description}
            selected={formData.acquisitionMode === mode.value}
            onClick={() => updateField('acquisitionMode', mode.value)}
          />
        ))}
      </div>

      {/* Info box for inherited/gifted/will — explain holding period inclusion */}
      {['inherited', 'gifted', 'will'].includes(formData.acquisitionMode) && (
        <div className="mt-4">
          <InfoBox title="Previous owner's holding period counts!">
            Under Section 2(42A), when you receive property through{' '}
            {formData.acquisitionMode === 'inherited' ? 'inheritance' :
             formData.acquisitionMode === 'gifted' ? 'gift' : 'a will'},{' '}
            the <strong>previous owner's holding period is added to yours</strong>.
            This means the property is more likely to qualify as long-term,
            which usually results in lower tax.
          </InfoBox>
        </div>
      )}
    </div>

    {/* ── Previous Owner's Purchase Date (conditional) ──────────────── */}
    {['inherited', 'gifted', 'will'].includes(formData.acquisitionMode) && (
      <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
          When did the previous owner originally buy this property?
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          We need this date to calculate the total holding period. If the previous
          owner also inherited/received it, enter the date the <em>earliest purchaser</em> bought it.
        </p>
        <input
          type="date"
          value={formData.previousOwnerDate}
          onChange={(e) => updateField('previousOwnerDate', e.target.value)}
          className="w-full sm:w-64 p-3 border border-gray-300 dark:border-gray-600 rounded-lg
            focus:ring-2 focus:ring-blue-500 outline-none
            bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
        />
        {/* Explain the FMV rule for pre-2001 acquisitions */}
        {formData.previousOwnerDate && new Date(formData.previousOwnerDate) < new Date('2001-04-01') && (
          <div className="mt-3">
            <InfoBox title="Property acquired before April 2001" variant="info">
              Since the original purchase was before 01-04-2001, you can use the
              <strong> Fair Market Value (FMV) as on 01-04-2001</strong> as your
              cost of acquisition (if it's higher than the actual purchase price).
              You'll enter this value in Step 3.
            </InfoBox>
          </div>
        )}
      </div>
    )}

    {/* ── Taxpayer Type ──────────────────────────────────────────────── */}
    <div>
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
        Taxpayer Type
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Capital gains exemptions under Sections 54 and 54F are available only to
        Individuals and HUFs. Companies and firms cannot claim these exemptions.
      </p>
      <div className="flex gap-3">
        {TAXPAYER_TYPES.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => updateField('taxpayerType', type.value)}
            className={`px-6 py-3 rounded-lg border-2 font-medium transition-all duration-200 cursor-pointer
              ${formData.taxpayerType === type.value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600'
              }`}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  </div>
);

/**
 * Step2DatesHolding — collects purchase/sale dates and determines STCG vs LTCG.
 *
 * For inherited/gifted/will properties, the purchase date is pre-filled from
 * the previous owner's date entered in Step 1. The acquisition date (when the
 * user received the property) is also collected for reference.
 *
 * Holding period threshold for immovable property: > 24 months = LTCG.
 *
 * @param {Object} props
 * @param {Object} props.formData - Current wizard form state
 * @param {Function} props.updateField - Callback to update a single field
 */
const Step2DatesHolding = ({ formData, updateField }) => {
  // Determine which date starts the holding period
  // For inherited/gifted/will: previous owner's purchase date
  // For purchased: the user's own purchase date
  const isTransferred = ['inherited', 'gifted', 'will'].includes(formData.acquisitionMode);
  const holdingStartDate = isTransferred ? formData.previousOwnerDate : formData.purchaseDate;

  // Calculate holding period in months
  const holdingMonths = useMemo(
    () => calculateMonthsBetween(holdingStartDate, formData.saleDate),
    [holdingStartDate, formData.saleDate]
  );

  // Determine STCG or LTCG
  const isLTCG = holdingMonths > LTCG_THRESHOLD_MONTHS;
  const hasValidDates = holdingStartDate && formData.saleDate && holdingMonths > 0;

  // Determine if property was acquired before 23-Jul-2024 (grandfathering cutoff)
  // This affects whether the 20%-with-indexation option is available in Step 4
  const acquisitionDate = isTransferred ? formData.previousOwnerDate : formData.purchaseDate;
  const acquiredBefore23Jul2024 = acquisitionDate
    ? new Date(acquisitionDate) < new Date('2024-07-23')
    : false;

  return (
    <div className="space-y-8">
      {/* ── Purchase / Acquisition Date ─────────────────────────────── */}
      {isTransferred ? (
        <>
          {/* For inherited/gifted/will: show previous owner date as read-only + ask for receipt date */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
              Previous owner's purchase date
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              This date was entered in Step 1. It determines your holding period.
            </p>
            <input
              type="date"
              value={formData.previousOwnerDate}
              disabled
              className="w-full sm:w-64 p-3 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 cursor-not-allowed"
            />
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
              When did you receive this property?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              The date you{' '}
              {formData.acquisitionMode === 'inherited' ? 'inherited' :
               formData.acquisitionMode === 'gifted' ? 'received the gift of' : 'received under will'}{' '}
              this property. This is for your records — the <em>holding period still starts from the
              previous owner's date</em>.
            </p>
            <input
              type="date"
              value={formData.acquisitionDate}
              onChange={(e) => updateField('acquisitionDate', e.target.value)}
              className="w-full sm:w-64 p-3 border border-gray-300 dark:border-gray-600 rounded-lg
                focus:ring-2 focus:ring-blue-500 outline-none
                bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            />
          </div>
        </>
      ) : (
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
            When did you buy this property?
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            The date of purchase (or allotment, if under-construction). This is when
            your holding period starts.
          </p>
          <input
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => updateField('purchaseDate', e.target.value)}
            className="w-full sm:w-64 p-3 border border-gray-300 dark:border-gray-600 rounded-lg
              focus:ring-2 focus:ring-blue-500 outline-none
              bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
          />
        </div>
      )}

      {/* ── Sale Date ───────────────────────────────────────────────── */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
          When did you sell (or plan to sell) this property?
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          The date of transfer / sale agreement. This determines the financial year
          for tax computation and deadlines for claiming exemptions.
        </p>
        <input
          type="date"
          value={formData.saleDate}
          onChange={(e) => updateField('saleDate', e.target.value)}
          className="w-full sm:w-64 p-3 border border-gray-300 dark:border-gray-600 rounded-lg
            focus:ring-2 focus:ring-blue-500 outline-none
            bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
        />
      </div>

      {/* ── Holding Period Result ────────────────────────────────────── */}
      {hasValidDates && (
        <div className="space-y-4">
          {/* Duration card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
              Holding Period Analysis
            </h3>

            {/* Duration display */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Holding Period</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {formatDuration(holdingMonths)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  ({holdingMonths} months — threshold is {LTCG_THRESHOLD_MONTHS} months for immovable property)
                </p>
              </div>
            </div>

            {/* STCG / LTCG determination badge */}
            <div
              className={`p-4 rounded-lg border-l-4 ${
                isLTCG
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                  : 'bg-amber-50 dark:bg-amber-900/20 border-amber-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{isLTCG ? '✅' : '⏱️'}</span>
                <div>
                  <p className={`text-lg font-bold ${
                    isLTCG
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-amber-700 dark:text-amber-300'
                  }`}>
                    {isLTCG ? 'Long-Term Capital Gain (LTCG)' : 'Short-Term Capital Gain (STCG)'}
                  </p>
                  <p className={`text-sm ${
                    isLTCG
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {isLTCG
                      ? 'Held for more than 24 months. You may be eligible for exemptions under Sections 54, 54EC, and 54F.'
                      : 'Held for 24 months or less. Short-term gains are taxed at your income tax slab rate. Exemptions under Sections 54/54F are not available for STCG.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Grandfathering note for pre-23-Jul-2024 acquisitions */}
            {isLTCG && acquiredBefore23Jul2024 && (
              <div className="mt-4">
                <InfoBox title="Budget 2024 Grandfathering Applies">
                  Since this property was acquired <strong>before 23 July 2024</strong>,
                  you have the choice between two tax rates in Step 4:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong>Option A:</strong> 20% tax with indexation benefit (traditional method)</li>
                    <li><strong>Option B:</strong> 12.5% tax without indexation (new method from Budget 2024)</li>
                  </ul>
                  The calculator will compare both and show you which saves more tax.
                </InfoBox>
              </div>
            )}

            {/* For post-23-Jul-2024 acquisitions */}
            {isLTCG && !acquiredBefore23Jul2024 && (
              <div className="mt-4">
                <InfoBox title="Budget 2024 New Regime Applies">
                  Since this property was acquired <strong>on or after 23 July 2024</strong>,
                  the tax rate is <strong>12.5% without indexation</strong> (no choice of the
                  old 20%-with-indexation method).
                </InfoBox>
              </div>
            )}
          </div>

          {/* Beginner info */}
          <InfoBox title="What does LTCG vs STCG mean?">
            <strong>Long-Term Capital Gain (LTCG)</strong> means you held the property for more
            than 24 months. LTCG on property is taxed at special rates (12.5% or 20%)
            and you can claim exemptions to reduce/eliminate the tax.
            <br /><br />
            <strong>Short-Term Capital Gain (STCG)</strong> means you held it for 24 months or less.
            STCG is added to your regular income and taxed at your normal slab rate — no
            special exemptions are available.
          </InfoBox>
        </div>
      )}

      {/* Validation hint if sale date is before purchase date */}
      {holdingStartDate && formData.saleDate && new Date(formData.saleDate) <= new Date(holdingStartDate) && (
        <InfoBox title="Sale date must be after purchase date" variant="warning">
          The sale date you entered is on or before the purchase/acquisition date.
          Please check and correct the dates.
        </InfoBox>
      )}
    </div>
  );
};

// ─── Currency Input Helper ──────────────────────────────────────────────────────

/**
 * CurrencyInput — a styled number input with ₹ prefix and Indian number formatting.
 * Shows formatted value when not focused, raw number when focused for editing.
 *
 * @param {Object} props
 * @param {string} props.label - Input label
 * @param {string} props.hint - Helper text below the input
 * @param {string|number} props.value - Current value (stored as string in formData)
 * @param {Function} props.onChange - Callback with new string value
 * @param {string} [props.placeholder='0'] - Placeholder text
 * @param {boolean} [props.disabled=false] - Whether input is disabled
 */
const CurrencyInput = ({ label, hint, value, onChange, placeholder = '0', disabled = false }) => {
  // Track focus to toggle between raw and formatted display
  const [isFocused, setIsFocused] = React.useState(false);

  // Parse the stored string value to a number for formatting
  const numericValue = value === '' ? '' : Number(value);

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {/* ₹ symbol prefix */}
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-medium">
          ₹
        </span>
        <input
          type={isFocused ? 'number' : 'text'}
          value={
            isFocused
              ? value // Raw number when editing
              : numericValue === '' ? '' : formatCurrency(numericValue).replace('₹ ', '') // Formatted when not editing
          }
          onChange={(e) => {
            // Only allow non-negative numbers
            const raw = e.target.value;
            if (raw === '' || (!isNaN(raw) && Number(raw) >= 0)) {
              onChange(raw);
            }
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-8 pr-4 py-3 border rounded-lg
            focus:ring-2 focus:ring-blue-500 outline-none transition-colors
            ${disabled
              ? 'bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 cursor-not-allowed'
              : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600'
            }`}
        />
      </div>
      {hint && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{hint}</p>
      )}
    </div>
  );
};

/**
 * Step3CostComputation — collects purchase price, FMV (for pre-2001), improvements,
 * sale price, stamp duty value (Section 50C), and transfer expenses.
 *
 * Key tax rules implemented:
 * - Pre-2001 property: user chooses between actual cost and FMV as on 01-04-2001
 * - Improvements: only those made AFTER 01-04-2001 are allowed
 * - Section 50C: if stamp duty value > 110% of sale price, SDV becomes full consideration
 * - Transfer expenses: deducted from full consideration to get net sale consideration
 *
 * @param {Object} props
 * @param {Object} props.formData - Current wizard form state
 * @param {Function} props.updateField - Callback to update a single field
 */
const Step3CostComputation = ({ formData, updateField }) => {
  // ── Derived values ──────────────────────────────────────────────────────────

  // Determine if property was acquired before 01-04-2001 (FMV option available)
  const isTransferred = ['inherited', 'gifted', 'will'].includes(formData.acquisitionMode);
  const acquisitionDateStr = isTransferred ? formData.previousOwnerDate : formData.purchaseDate;
  const acquiredBefore2001 = acquisitionDateStr
    ? new Date(acquisitionDateStr) < new Date('2001-04-01')
    : false;

  // ── Section 50C check ───────────────────────────────────────────────────────
  // If stamp duty value > 110% of actual sale price → stamp duty value is deemed consideration
  const salePriceNum = Number(formData.salePrice) || 0;
  const stampDutyNum = Number(formData.stampDutyValue) || 0;
  const transferExpensesNum = Number(formData.transferExpenses) || 0;

  // Section 50C triggers when SDV > sale price × 1.10 (10% tolerance)
  const section50CApplies = salePriceNum > 0 && stampDutyNum > 0 && stampDutyNum > (salePriceNum * 1.10);

  // Full value of consideration: actual sale price or stamp duty value (whichever applies)
  const fullValueOfConsideration = section50CApplies ? stampDutyNum : salePriceNum;

  // Net sale consideration = full value - transfer expenses
  const netSaleConsideration = Math.max(0, fullValueOfConsideration - transferExpensesNum);

  // ── Cost of acquisition ─────────────────────────────────────────────────────
  const purchasePriceNum = Number(formData.purchasePrice) || 0;
  const fmvNum = Number(formData.fmvOnApril2001) || 0;

  // For pre-2001: user chooses between actual cost and FMV (whichever is higher, typically)
  // The calculator shows both and lets user pick via the useFMV toggle
  const baseCostOfAcquisition = acquiredBefore2001 && formData.useFMV ? fmvNum : purchasePriceNum;

  // ── Cost of improvements ────────────────────────────────────────────────────
  const totalImprovements = formData.improvements.reduce(
    (sum, imp) => sum + (Number(imp.amount) || 0), 0
  );

  // ── Summary values ──────────────────────────────────────────────────────────
  const totalCost = baseCostOfAcquisition + totalImprovements;

  // ── Improvement handlers ────────────────────────────────────────────────────

  /** Add a new blank improvement row */
  const addImprovement = useCallback(() => {
    const newImprovement = {
      id: Date.now(), // Unique key for React list rendering
      description: '',
      amount: '',
      date: '',
    };
    updateField('improvements', [...formData.improvements, newImprovement]);
  }, [formData.improvements, updateField]);

  /** Remove an improvement by its ID */
  const removeImprovement = useCallback((id) => {
    updateField(
      'improvements',
      formData.improvements.filter((imp) => imp.id !== id)
    );
  }, [formData.improvements, updateField]);

  /** Update a single field in a specific improvement row */
  const updateImprovement = useCallback((id, field, value) => {
    updateField(
      'improvements',
      formData.improvements.map((imp) =>
        imp.id === id ? { ...imp, [field]: value } : imp
      )
    );
  }, [formData.improvements, updateField]);

  return (
    <div className="space-y-8">

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION A: COST OF ACQUISITION
          ══════════════════════════════════════════════════════════════════════ */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
          Cost of Acquisition (Purchase Price)
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {isTransferred
            ? `Since you ${formData.acquisitionMode === 'inherited' ? 'inherited' : formData.acquisitionMode === 'gifted' ? 'received as gift' : 'received under will'} this property, enter the cost at which the previous owner originally purchased it.`
            : 'Enter the total price you paid to buy this property (including registration charges paid at the time of purchase).'}
        </p>

        {/* Actual purchase price input */}
        <div className="max-w-md">
          <CurrencyInput
            label={isTransferred ? "Previous owner's purchase price" : "Purchase price"}
            hint="The amount actually paid to acquire the property"
            value={formData.purchasePrice}
            onChange={(val) => updateField('purchasePrice', val)}
          />
        </div>

        {/* ── FMV option for pre-2001 properties ─────────────────────────── */}
        {acquiredBefore2001 && (
          <div className="mt-6 space-y-4">
            <InfoBox title="Property acquired before April 2001 — FMV option available">
              Since this property was purchased <strong>before 01-04-2001</strong>, you can
              choose to use the <strong>Fair Market Value (FMV) as on 01-04-2001</strong> as
              your cost of acquisition (if it is higher than the actual purchase price). This
              typically reduces your taxable capital gain.
              <br /><br />
              The FMV should be based on a <strong>registered valuer's report</strong> or the
              stamp duty ready-reckoner rate as on 01-04-2001.
            </InfoBox>

            {/* FMV input */}
            <div className="max-w-md">
              <CurrencyInput
                label="Fair Market Value (FMV) as on 01-04-2001"
                hint="Get this from a registered valuer or stamp duty ready-reckoner"
                value={formData.fmvOnApril2001}
                onChange={(val) => updateField('fmvOnApril2001', val)}
              />
            </div>

            {/* FMV toggle — user opts to use FMV or actual cost */}
            {purchasePriceNum > 0 && fmvNum > 0 && (
              <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Which cost do you want to use as your cost of acquisition?
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Option: Actual cost */}
                  <button
                    type="button"
                    onClick={() => updateField('useFMV', false)}
                    className={`flex-1 p-3 rounded-lg border-2 text-left transition-all duration-200 cursor-pointer
                      ${!formData.useFMV
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-300'
                      }`}
                  >
                    <p className={`font-semibold text-sm ${!formData.useFMV ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      Actual Purchase Price
                    </p>
                    <p className={`text-lg font-bold mt-1 ${!formData.useFMV ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      {formatCurrency(purchasePriceNum)}
                    </p>
                  </button>

                  {/* Option: FMV */}
                  <button
                    type="button"
                    onClick={() => updateField('useFMV', true)}
                    className={`flex-1 p-3 rounded-lg border-2 text-left transition-all duration-200 cursor-pointer
                      ${formData.useFMV
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-300'
                      }`}
                  >
                    <p className={`font-semibold text-sm ${formData.useFMV ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      FMV as on 01-04-2001
                    </p>
                    <p className={`text-lg font-bold mt-1 ${formData.useFMV ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      {formatCurrency(fmvNum)}
                    </p>
                    {fmvNum > purchasePriceNum && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        ✓ Higher value — usually better for you
                      </p>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION B: COST OF IMPROVEMENTS
          ══════════════════════════════════════════════════════════════════════ */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
          Cost of Improvements (Renovations / Additions)
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Add any <strong>major renovations, structural additions, or capital improvements</strong> you
          made to the property. Routine maintenance and repairs do <em>not</em> count.
        </p>

        {/* Warning: only post-2001 improvements count */}
        {acquiredBefore2001 && (
          <div className="mb-4">
            <InfoBox title="Only improvements after April 2001 count" variant="warning">
              Since the base year for Cost Inflation Index is 2001-02, any improvements made
              <strong> before 01-04-2001 are completely excluded</strong> from the calculation.
              Only enter improvements made after that date.
            </InfoBox>
          </div>
        )}

        {/* Improvement rows */}
        {formData.improvements.length > 0 && (
          <div className="space-y-3 mb-4">
            {formData.improvements.map((imp, index) => {
              // Validate: improvement date must be after 01-04-2001
              const impDateInvalid = imp.date && new Date(imp.date) < new Date('2001-04-01');

              return (
                <div
                  key={imp.id}
                  className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Improvement #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeImprovement(imp.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium cursor-pointer"
                    >
                      ✕ Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Description */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={imp.description}
                        onChange={(e) => updateImprovement(imp.id, 'description', e.target.value)}
                        placeholder="e.g. Kitchen renovation"
                        className="w-full p-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                          focus:ring-2 focus:ring-blue-500 outline-none
                          bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                      />
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={imp.amount}
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (raw === '' || (!isNaN(raw) && Number(raw) >= 0)) {
                            updateImprovement(imp.id, 'amount', raw);
                          }
                        }}
                        placeholder="0"
                        min="0"
                        className="w-full p-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                          focus:ring-2 focus:ring-blue-500 outline-none
                          bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                      />
                    </div>

                    {/* Date of improvement */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Date (approximate)
                      </label>
                      <input
                        type="date"
                        value={imp.date}
                        onChange={(e) => updateImprovement(imp.id, 'date', e.target.value)}
                        min="2001-04-01"
                        className={`w-full p-2.5 text-sm border rounded-lg
                          focus:ring-2 focus:ring-blue-500 outline-none
                          bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100
                          ${impDateInvalid
                            ? 'border-red-400 dark:border-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                          }`}
                      />
                      {impDateInvalid && (
                        <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                          Must be after 01-04-2001
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add improvement button */}
        <button
          type="button"
          onClick={addImprovement}
          className="px-4 py-2.5 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600
            text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-500
            dark:hover:border-blue-500 dark:hover:text-blue-400
            transition-all duration-200 text-sm font-medium cursor-pointer w-full sm:w-auto"
        >
          + Add Improvement
        </button>

        {/* Total improvements display */}
        {totalImprovements > 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Total improvements: <span className="font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(totalImprovements)}</span>
          </p>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION C: SALE CONSIDERATION
          ══════════════════════════════════════════════════════════════════════ */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
          Sale Price & Stamp Duty Value
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Enter the actual amount you received (or will receive) from the sale, and the
          stamp duty value (circle rate / ready-reckoner value) of the property.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <CurrencyInput
            label="Actual sale price received"
            hint="Total amount received from buyer"
            value={formData.salePrice}
            onChange={(val) => updateField('salePrice', val)}
          />
          <CurrencyInput
            label="Stamp duty value (SDV / circle rate)"
            hint="Value as per stamp duty authority / ready-reckoner"
            value={formData.stampDutyValue}
            onChange={(val) => updateField('stampDutyValue', val)}
          />
        </div>

        {/* Section 50C analysis */}
        {salePriceNum > 0 && stampDutyNum > 0 && (
          <div className="mt-4">
            {section50CApplies ? (
              // Section 50C triggered — stamp duty value is deemed consideration
              <InfoBox title="Section 50C Applies — Stamp Duty Value Used" variant="warning">
                The stamp duty value ({formatCurrency(stampDutyNum)}) is <strong>more than 110%</strong> of
                your actual sale price ({formatCurrency(salePriceNum)}).
                <br /><br />
                Under <strong>Section 50C</strong>, the stamp duty value will be treated as your
                full sale consideration for capital gains computation. This means your taxable
                gain will be higher than what you actually received.
                <br /><br />
                <strong>Deemed sale consideration: {formatCurrency(stampDutyNum)}</strong>
              </InfoBox>
            ) : (
              // Section 50C not triggered — sale price within tolerance
              <InfoBox title="Section 50C — No adjustment needed">
                Your sale price is within the <strong>10% tolerance limit</strong> of the stamp duty
                value. Your actual sale price ({formatCurrency(salePriceNum)}) will be used as the
                sale consideration. No deemed value adjustment under Section 50C.
              </InfoBox>
            )}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION D: TRANSFER EXPENSES
          ══════════════════════════════════════════════════════════════════════ */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
          Transfer / Sale Expenses
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Costs you incurred <em>to complete the sale</em> — these are deducted from the sale
          consideration before computing capital gain.
        </p>
        <div className="max-w-md">
          <CurrencyInput
            label="Total transfer expenses"
            hint="Brokerage commission, legal fees, advertising costs, etc."
            value={formData.transferExpenses}
            onChange={(val) => updateField('transferExpenses', val)}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION E: COST SUMMARY CARD
          ══════════════════════════════════════════════════════════════════════ */}
      {(salePriceNum > 0 || purchasePriceNum > 0) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
            Cost Summary
          </h3>

          {/* Summary table */}
          <div className="space-y-3">
            {/* Sale side */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Actual Sale Price</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(salePriceNum)}</span>
            </div>
            {stampDutyNum > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Stamp Duty Value
                  {section50CApplies && <span className="text-amber-500 ml-1">(Sec 50C applies)</span>}
                </span>
                <span className={`font-medium ${section50CApplies ? 'text-amber-600 dark:text-amber-400' : 'text-gray-800 dark:text-gray-200'}`}>
                  {formatCurrency(stampDutyNum)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Full Value of Consideration
              </span>
              <span className="font-bold text-gray-800 dark:text-gray-100">
                {formatCurrency(fullValueOfConsideration)}
              </span>
            </div>
            {transferExpensesNum > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Less: Transfer Expenses</span>
                <span className="font-medium text-red-600 dark:text-red-400">- {formatCurrency(transferExpensesNum)}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Net Sale Consideration
              </span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(netSaleConsideration)}
              </span>
            </div>

            {/* Cost side */}
            <div className="pt-2">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Cost of Acquisition
                  {acquiredBefore2001 && formData.useFMV && <span className="text-blue-500 ml-1">(FMV used)</span>}
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(baseCostOfAcquisition)}</span>
              </div>
              {totalImprovements > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Cost of Improvements ({formData.improvements.length} item{formData.improvements.length !== 1 ? 's' : ''})
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(totalImprovements)}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Total Cost (before indexation)
                </span>
                <span className="font-bold text-gray-800 dark:text-gray-100">{formatCurrency(totalCost)}</span>
              </div>
            </div>

            {/* Preliminary gain indicator */}
            {salePriceNum > 0 && purchasePriceNum > 0 && (
              <div className={`mt-4 p-4 rounded-lg border-l-4 ${
                netSaleConsideration > totalCost
                  ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500'
                  : 'bg-green-50 dark:bg-green-900/20 border-green-500'
              }`}>
                <p className={`text-sm font-semibold ${
                  netSaleConsideration > totalCost
                    ? 'text-amber-700 dark:text-amber-300'
                    : 'text-green-700 dark:text-green-300'
                }`}>
                  {netSaleConsideration > totalCost
                    ? `Preliminary gain (before indexation): ${formatCurrency(netSaleConsideration - totalCost)}`
                    : `No capital gain before indexation — cost exceeds sale consideration`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  This is a rough estimate. The exact capital gain will be computed in Step 4
                  {netSaleConsideration > totalCost ? ' with indexation benefit (if applicable).' : '.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Step4CapitalGainComputation — computes the actual capital gain using two methods:
 *
 * Three scenarios based on acquisition/sale dates relative to 23-Jul-2024:
 *   1. Sold BEFORE 23-Jul-2024 → Old regime: 20% with indexation only
 *   2. Acquired BEFORE 23-Jul-2024, sold ON/AFTER → Grandfathered: lower of Option A or B
 *   3. Acquired ON/AFTER 23-Jul-2024 → New regime: 12.5% without indexation only
 *
 * Option A: 12.5% tax on gain WITHOUT indexation
 * Option B: 20% tax on gain WITH indexation (CII-based)
 *
 * Grandfathering is available only to resident Individuals and HUFs.
 *
 * @param {Object} props
 * @param {Object} props.formData - Current wizard form state
 * @param {Function} props.updateField - Callback to update a single field
 */
const Step4CapitalGainComputation = ({ formData, updateField }) => {
  // ── Track which breakdown cards are expanded ──────────────────────────────
  const [expandedOption, setExpandedOption] = React.useState(null); // 'A' | 'B' | null

  // ── Derived dates and scenario detection ──────────────────────────────────

  // Determine the effective acquisition date (previous owner's for inherited/gifted/will)
  const isTransferred = ['inherited', 'gifted', 'will'].includes(formData.acquisitionMode);
  const acquisitionDateStr = isTransferred ? formData.previousOwnerDate : formData.purchaseDate;
  const saleDateStr = formData.saleDate;

  // Scenario determination:
  // 'old_regime'      → sold before 23-Jul-2024 (20% with indexation only)
  // 'grandfathered'   → acquired before 23-Jul-2024, sold on/after (choose lower tax)
  // 'new_regime'      → acquired on/after 23-Jul-2024 (12.5% without indexation only)
  const scenario = useMemo(() => {
    if (!acquisitionDateStr || !saleDateStr) return null;
    const acqDate = new Date(acquisitionDateStr);
    const slDate = new Date(saleDateStr);
    if (slDate < GRANDFATHERING_CUTOFF) return 'old_regime';
    if (acqDate < GRANDFATHERING_CUTOFF) return 'grandfathered';
    return 'new_regime';
  }, [acquisitionDateStr, saleDateStr]);

  // ── Cost values from Step 3 ───────────────────────────────────────────────

  const purchasePriceNum = Number(formData.purchasePrice) || 0;
  const fmvNum = Number(formData.fmvOnApril2001) || 0;
  const salePriceNum = Number(formData.salePrice) || 0;
  const stampDutyNum = Number(formData.stampDutyValue) || 0;
  const transferExpensesNum = Number(formData.transferExpenses) || 0;

  // Pre-2001 FMV option
  const acquiredBefore2001 = acquisitionDateStr
    ? new Date(acquisitionDateStr) < new Date('2001-04-01')
    : false;
  const baseCostOfAcquisition = acquiredBefore2001 && formData.useFMV ? fmvNum : purchasePriceNum;

  // Section 50C: deemed sale consideration
  const section50CApplies = salePriceNum > 0 && stampDutyNum > 0 && stampDutyNum > (salePriceNum * 1.10);
  const fullValueOfConsideration = section50CApplies ? stampDutyNum : salePriceNum;
  const netSaleConsideration = Math.max(0, fullValueOfConsideration - transferExpensesNum);

  // Total cost of improvements (un-indexed)
  const totalImprovements = formData.improvements.reduce(
    (sum, imp) => sum + (Number(imp.amount) || 0), 0
  );

  // ── CII lookups ───────────────────────────────────────────────────────────

  // FY of sale → CII for sale year
  const saleFY = getFYFromDate(saleDateStr);
  const saleCII = saleFY ? CII_TABLE[saleFY] : null;

  // FY of acquisition → CII for purchase year
  // For pre-2001: use FY 2001-02 as the base (earliest CII year)
  const rawAcqFY = getFYFromDate(acquisitionDateStr);
  const acquisitionFY = acquiredBefore2001 ? '2001-02' : rawAcqFY;
  const acquisitionCII = acquisitionFY ? CII_TABLE[acquisitionFY] : null;

  // ── Option A: 12.5% without indexation ────────────────────────────────────

  const optionAResult = useMemo(() => {
    // Capital Gain = Net Sale Consideration - (Cost of Acquisition + Cost of Improvements)
    const totalCost = baseCostOfAcquisition + totalImprovements;
    const gain = netSaleConsideration - totalCost;
    const taxableGain = Math.max(0, gain); // Loss = 0 for tax calc display
    const tax = taxableGain * 0.125;
    const cess = tax * 0.04;
    const totalTax = tax + cess;

    return {
      label: 'Option A — 12.5% without Indexation',
      rate: '12.5%',
      netSaleConsideration,
      costOfAcquisition: baseCostOfAcquisition,
      costOfImprovement: totalImprovements,
      totalDeductions: totalCost,
      capitalGain: gain,
      taxableGain,
      tax,
      cess,
      totalTax,
      isLoss: gain < 0,
    };
  }, [netSaleConsideration, baseCostOfAcquisition, totalImprovements]);

  // ── Option B: 20% with indexation ─────────────────────────────────────────

  const optionBResult = useMemo(() => {
    // Can only compute if CII values are available
    if (!saleCII || !acquisitionCII) {
      return null;
    }

    // Indexed Cost of Acquisition = (Cost × CII of sale year) / CII of purchase year
    const indexedCostOfAcquisition = Math.round(
      (baseCostOfAcquisition * saleCII) / acquisitionCII
    );

    // Indexed Cost of Improvements: each improvement indexed by its own FY
    let indexedImprovements = 0;
    const improvementDetails = [];
    for (const imp of formData.improvements) {
      const impAmount = Number(imp.amount) || 0;
      if (impAmount > 0 && imp.date) {
        const impFY = getFYFromDate(imp.date);
        const impCII = impFY ? CII_TABLE[impFY] : null;
        if (impCII) {
          const indexedAmt = Math.round((impAmount * saleCII) / impCII);
          indexedImprovements += indexedAmt;
          improvementDetails.push({
            description: imp.description || `Improvement`,
            original: impAmount,
            fy: impFY,
            cii: impCII,
            indexed: indexedAmt,
          });
        }
      }
    }

    // Capital Gain = Net Sale Consideration - (Indexed Cost + Indexed Improvements)
    const totalIndexedDeductions = indexedCostOfAcquisition + indexedImprovements;
    const gain = netSaleConsideration - totalIndexedDeductions;
    const taxableGain = Math.max(0, gain);
    const tax = taxableGain * 0.20;
    const cess = tax * 0.04;
    const totalTax = tax + cess;

    return {
      label: 'Option B — 20% with Indexation',
      rate: '20%',
      netSaleConsideration,
      costOfAcquisition: baseCostOfAcquisition,
      indexedCostOfAcquisition,
      acquisitionCII,
      saleCII,
      costOfImprovement: totalImprovements,
      indexedCostOfImprovement: indexedImprovements,
      improvementDetails,
      totalDeductions: totalIndexedDeductions,
      capitalGain: gain,
      taxableGain,
      tax,
      cess,
      totalTax,
      isLoss: gain < 0,
    };
  }, [netSaleConsideration, baseCostOfAcquisition, totalImprovements, formData.improvements, saleCII, acquisitionCII]);

  // ── Determine the better option ───────────────────────────────────────────

  const comparison = useMemo(() => {
    if (scenario === 'new_regime') {
      // Only Option A available
      return { betterOption: 'A', onlyOneOption: true };
    }
    if (scenario === 'old_regime') {
      // Only Option B available
      return { betterOption: 'B', onlyOneOption: true };
    }
    // Grandfathered: compare both
    if (!optionBResult) {
      return { betterOption: 'A', onlyOneOption: true };
    }
    // Per research: if Option B produces a loss, it cannot be used
    if (optionBResult.isLoss) {
      return { betterOption: 'A', onlyOneOption: false, bLossNote: true };
    }
    // Compare total tax (including cess)
    if (optionAResult.totalTax <= optionBResult.totalTax) {
      return { betterOption: 'A', onlyOneOption: false, savings: optionBResult.totalTax - optionAResult.totalTax };
    }
    return { betterOption: 'B', onlyOneOption: false, savings: optionAResult.totalTax - optionBResult.totalTax };
  }, [scenario, optionAResult, optionBResult]);

  // ── The chosen result (what flows to Step 5) ──────────────────────────────
  // Store the selected capital gain in formData so later steps can use it
  const selectedResult = comparison.betterOption === 'A' ? optionAResult : optionBResult;
  const selectedGain = selectedResult ? selectedResult.capitalGain : 0;
  const selectedTax = selectedResult ? selectedResult.totalTax : 0;

  // Persist the selected values to formData for use in Steps 5 & 6
  React.useEffect(() => {
    if (selectedResult) {
      updateField('computedCapitalGain', selectedResult.capitalGain);
      updateField('computedTaxBeforeExemption', selectedResult.totalTax);
      updateField('selectedTaxOption', comparison.betterOption);
      updateField('selectedTaxRate', comparison.betterOption === 'A' ? 12.5 : 20);
      // Also store net sale consideration — needed by Section 54F (proportional formula)
      updateField('computedNetSaleConsideration', netSaleConsideration);
    }
  }, [selectedResult, comparison.betterOption, updateField, netSaleConsideration]);

  // ── Helper: render a single option card ────────────────────────────────────

  /**
   * Renders one option card (A or B) with summary and expandable breakdown.
   *
   * @param {Object} result - Computed result object (optionAResult or optionBResult)
   * @param {string} optionKey - 'A' or 'B'
   * @param {boolean} isBetter - Whether this is the recommended option
   * @param {boolean} isOnly - Whether this is the only available option
   */
  const renderOptionCard = (result, optionKey, isBetter, isOnly) => {
    if (!result) return null;

    const isExpanded = expandedOption === optionKey;
    const borderColor = isBetter
      ? 'border-green-400 dark:border-green-500'
      : 'border-gray-200 dark:border-gray-600';
    const bgColor = isBetter
      ? 'bg-green-50/50 dark:bg-green-900/10'
      : 'bg-white dark:bg-gray-800';

    return (
      <div className={`rounded-xl border-2 ${borderColor} ${bgColor} overflow-hidden transition-all duration-300`}>
        {/* Better option banner */}
        {isBetter && !isOnly && (
          <div className="bg-green-500 dark:bg-green-600 text-white text-center py-2 text-sm font-bold">
            ✓ Better Option — Saves you {formatCurrency(comparison.savings || 0)} in tax
          </div>
        )}

        {/* Card header */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                {result.label}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {optionKey === 'A'
                  ? 'Flat 12.5% tax on the actual (non-indexed) capital gain'
                  : 'CII-adjusted costs reduce taxable gain, then taxed at 20%'}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
              isBetter
                ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              {result.rate}
            </span>
          </div>

          {/* Key numbers summary */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Capital Gain</p>
              <p className={`text-xl font-bold mt-1 ${
                result.isLoss
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-800 dark:text-gray-100'
              }`}>
                {result.isLoss ? 'Loss' : formatCurrency(result.capitalGain)}
              </p>
              {result.isLoss && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {formatCurrency(Math.abs(result.capitalGain))} capital loss
                </p>
              )}
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tax + Cess</p>
              <p className={`text-xl font-bold mt-1 ${
                result.totalTax === 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {result.totalTax === 0 ? 'Nil' : formatCurrency(result.totalTax)}
              </p>
              {result.totalTax > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Tax {formatCurrency(result.tax)} + Cess {formatCurrency(result.cess)}
                </p>
              )}
            </div>
          </div>

          {/* Expand/collapse button */}
          <button
            type="button"
            onClick={() => setExpandedOption(isExpanded ? null : optionKey)}
            className="w-full text-center text-sm font-medium text-blue-600 dark:text-blue-400
              hover:text-blue-700 dark:hover:text-blue-300 py-2 cursor-pointer
              border-t border-gray-100 dark:border-gray-700 mt-2"
          >
            {isExpanded ? '▲ Hide detailed breakdown' : '▼ Show detailed breakdown'}
          </button>
        </div>

        {/* Expandable breakdown section */}
        {isExpanded && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-5">
            <h5 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
              Step-by-step Calculation
            </h5>
            <div className="space-y-2 text-sm">
              {/* Net Sale Consideration */}
              <div className="flex justify-between py-1.5">
                <span className="text-gray-600 dark:text-gray-400">Net Sale Consideration</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(result.netSaleConsideration)}</span>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

              {/* Cost of Acquisition */}
              <div className="flex justify-between py-1.5">
                <span className="text-gray-600 dark:text-gray-400">
                  Cost of Acquisition {optionKey === 'A' ? '(actual)' : '(original)'}
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(result.costOfAcquisition)}</span>
              </div>

              {/* Indexed cost details for Option B */}
              {optionKey === 'B' && result.indexedCostOfAcquisition !== undefined && (
                <div className="ml-4 py-1 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <p>CII of purchase year ({acquisitionFY}): {result.acquisitionCII}</p>
                  <p>CII of sale year ({saleFY}): {result.saleCII}</p>
                  <p>
                    Indexed Cost = {formatCurrency(result.costOfAcquisition)} × {result.saleCII} / {result.acquisitionCII}
                    {' '}= <strong className="text-gray-700 dark:text-gray-300">{formatCurrency(result.indexedCostOfAcquisition)}</strong>
                  </p>
                </div>
              )}

              {/* Cost of Improvements */}
              {result.costOfImprovement > 0 && (
                <>
                  <div className="flex justify-between py-1.5">
                    <span className="text-gray-600 dark:text-gray-400">
                      Cost of Improvements {optionKey === 'B' ? '(indexed)' : '(actual)'}
                    </span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {formatCurrency(optionKey === 'B' ? result.indexedCostOfImprovement : result.costOfImprovement)}
                    </span>
                  </div>

                  {/* Per-improvement indexed details for Option B */}
                  {optionKey === 'B' && result.improvementDetails && result.improvementDetails.length > 0 && (
                    <div className="ml-4 py-1 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      {result.improvementDetails.map((imp, idx) => (
                        <p key={idx}>
                          {imp.description}: {formatCurrency(imp.original)} × {result.saleCII}/{imp.cii} (FY {imp.fy})
                          {' '}= <strong className="text-gray-700 dark:text-gray-300">{formatCurrency(imp.indexed)}</strong>
                        </p>
                      ))}
                    </div>
                  )}
                </>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

              {/* Total deductions */}
              <div className="flex justify-between py-1.5">
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  Total Deductions {optionKey === 'B' ? '(indexed)' : ''}
                </span>
                <span className="font-bold text-gray-800 dark:text-gray-200">{formatCurrency(result.totalDeductions)}</span>
              </div>

              <div className="border-t-2 border-gray-300 dark:border-gray-600 my-1" />

              {/* Capital Gain */}
              <div className="flex justify-between py-1.5">
                <span className="text-gray-700 dark:text-gray-300 font-semibold">Capital Gain</span>
                <span className={`font-bold ${
                  result.isLoss
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-800 dark:text-gray-100'
                }`}>
                  {result.isLoss ? `(${formatCurrency(Math.abs(result.capitalGain))})` : formatCurrency(result.capitalGain)}
                </span>
              </div>

              {/* Tax calculation */}
              {!result.isLoss && result.capitalGain > 0 && (
                <>
                  <div className="flex justify-between py-1.5">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tax @ {result.rate}
                    </span>
                    <span className="font-medium text-red-600 dark:text-red-400">{formatCurrency(result.tax)}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-gray-600 dark:text-gray-400">
                      Health & Education Cess @ 4%
                    </span>
                    <span className="font-medium text-red-600 dark:text-red-400">{formatCurrency(result.cess)}</span>
                  </div>
                  <div className="border-t-2 border-gray-300 dark:border-gray-600 my-1" />
                  <div className="flex justify-between py-1.5">
                    <span className="text-gray-700 dark:text-gray-300 font-bold">Total Tax Payable</span>
                    <span className="font-bold text-red-600 dark:text-red-400 text-lg">{formatCurrency(result.totalTax)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Scenario label for the info banner ────────────────────────────────────
  const getScenarioInfo = () => {
    switch (scenario) {
      case 'old_regime':
        return {
          title: 'Old Tax Regime Applies',
          text: 'Since you sold this property before 23 July 2024, the old regime applies — your capital gain is taxed at 20% with indexation benefit.',
          variant: 'info',
        };
      case 'grandfathered':
        return {
          title: 'Budget 2024 Grandfathering — You Get to Choose!',
          text: 'Since you acquired this property before 23 July 2024 but sold it on or after that date, you can choose the option that results in lower tax. The calculator compares both for you below.',
          variant: 'info',
        };
      case 'new_regime':
        return {
          title: 'New Tax Regime (Post Budget 2024)',
          text: 'Since you acquired this property on or after 23 July 2024, the new regime applies — your capital gain is taxed at a flat 12.5% without indexation. The old 20%-with-indexation option is not available.',
          variant: 'info',
        };
      default:
        return null;
    }
  };

  const scenarioInfo = getScenarioInfo();

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Scenario info banner */}
      {scenarioInfo && (
        <InfoBox title={scenarioInfo.title} variant={scenarioInfo.variant}>
          {scenarioInfo.text}
        </InfoBox>
      )}

      {/* Beginner explainer */}
      <InfoBox title="What is indexation?">
        <strong>Indexation</strong> adjusts your old purchase price for inflation using the
        Cost Inflation Index (CII). This increases your "cost" on paper, which reduces your
        taxable profit. However, when indexation is used, the tax rate is higher (20% vs 12.5%).
        <br /><br />
        The calculator checks both methods and picks the one that results in <strong>less tax for you</strong>.
      </InfoBox>

      {/* ── Option Cards ───────────────────────────────────────────────────── */}
      {scenario === 'grandfathered' ? (
        // Grandfathered: show both side-by-side
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
            Tax Comparison — Which option saves you more?
          </h3>

          {/* Option B loss warning */}
          {comparison.bLossNote && (
            <div className="mb-4">
              <InfoBox title="Option B produces a capital loss" variant="warning">
                With indexation, the indexed cost exceeds the sale consideration, resulting in a
                capital loss. Per tax rules, <strong>this loss cannot be used to offset Option A's gain</strong>.
                Therefore, Option A applies by default.
              </InfoBox>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {renderOptionCard(optionAResult, 'A', comparison.betterOption === 'A', false)}
            {renderOptionCard(optionBResult, 'B', comparison.betterOption === 'B', false)}
          </div>
        </div>
      ) : scenario === 'old_regime' ? (
        // Old regime: only Option B
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
            Capital Gain Computation (20% with Indexation)
          </h3>
          <div className="max-w-xl">
            {renderOptionCard(optionBResult, 'B', true, true)}
          </div>
        </div>
      ) : scenario === 'new_regime' ? (
        // New regime: only Option A
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
            Capital Gain Computation (12.5% without Indexation)
          </h3>
          <div className="max-w-xl">
            {renderOptionCard(optionAResult, 'A', true, true)}
          </div>
        </div>
      ) : null}

      {/* ── Selected result summary card ──────────────────────────────────── */}
      {selectedResult && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
            Summary — Moving to Exemptions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">Capital Gain</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {selectedGain < 0 ? 'Loss' : formatCurrency(selectedGain)}
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-xs text-red-600 dark:text-red-400 uppercase tracking-wide mb-1">Tax Before Exemptions</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                {selectedTax === 0 ? 'Nil' : formatCurrency(selectedTax)}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wide mb-1">Tax Rate Applied</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {comparison.betterOption === 'A' ? '12.5%' : '20%'}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {comparison.betterOption === 'A' ? 'Without indexation' : 'With indexation'}
              </p>
            </div>
          </div>

          {selectedGain > 0 && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                <strong>Next step:</strong> You can reduce this tax by claiming exemptions under
                Sections 54, 54EC, or 54F (based on your asset type and reinvestment plans).
                Continue to Step 5 to explore your options.
              </p>
            </div>
          )}

          {selectedGain <= 0 && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>No capital gain!</strong> Since there is no taxable capital gain, you do not
                need to claim any exemptions. You can still continue to see the exemption options
                available for future reference.
              </p>
            </div>
          )}
        </div>
      )}

      {/* CII reference table (collapsible) */}
      {(scenario === 'old_regime' || scenario === 'grandfathered') && (
        <details className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <summary className="p-4 cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
            📊 View Cost Inflation Index (CII) Table — FY 2001-02 to 2025-26
          </summary>
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
              {Object.entries(CII_TABLE).map(([fy, cii]) => {
                // Highlight the FYs used in this calculation
                const isAcqFY = fy === acquisitionFY;
                const isSaleFY = fy === saleFY;
                const highlight = isAcqFY || isSaleFY;

                return (
                  <div
                    key={fy}
                    className={`flex justify-between px-3 py-1.5 rounded ${
                      highlight
                        ? 'bg-blue-100 dark:bg-blue-900/30 font-semibold text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <span>{fy}</span>
                    <span>{cii}</span>
                    {isAcqFY && <span className="text-xs ml-1">(buy)</span>}
                    {isSaleFY && <span className="text-xs ml-1">(sale)</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </details>
      )}
    </div>
  );
};

// ─── Step 5: Exemption Options ──────────────────────────────────────────────────

/**
 * Maximum exemption cap for Sections 54 and 54F combined (Budget 2023).
 * Investment amounts above this are not considered for exemption.
 */
const SEC54_54F_CAP = 10_00_00_000; // Rs. 10 crore

/**
 * Maximum investment allowed in Section 54EC bonds.
 * Applies cumulatively across the FY of transfer and the next FY.
 * The March-April loophole was closed by Finance Act 2014.
 */
const SEC54EC_MAX = 50_00_000; // Rs. 50 lakh

/**
 * Two-house option threshold under Section 54.
 * Available only if LTCG ≤ Rs. 2 crore. One-time lifetime option (Budget 2019).
 */
const TWO_HOUSE_LTCG_LIMIT = 2_00_00_000; // Rs. 2 crore

/**
 * Section 54EC eligible bonds for FY 2025-26.
 * NHAI stopped issuing from FY 2022-23.
 * HUDCO and IREDA added by Budget 2025.
 */
const SEC54EC_BONDS = [
  { name: 'REC', fullName: 'Rural Electrification Corporation', active: true },
  { name: 'PFC', fullName: 'Power Finance Corporation', active: true },
  { name: 'IRFC', fullName: 'Indian Railway Finance Corporation', active: true },
  { name: 'HUDCO', fullName: 'Housing & Urban Development Corporation', active: true, note: 'Budget 2025' },
  { name: 'IREDA', fullName: 'Indian Renewable Energy Development Agency', active: true, note: 'Budget 2025' },
];

/**
 * Step5ExemptionOptions — lets users claim tax exemptions to reduce or eliminate
 * their capital gains tax.
 *
 * Auto-filters available exemptions based on asset type:
 *   - Residential house sold → Section 54 (buy/construct new house) + Section 54EC (bonds)
 *   - Plot / Commercial sold → Section 54F (proportional formula) + Section 54EC (bonds)
 *
 * Exemption logic:
 *   - Section 54: Exemption = min(Capital Gain, Investment + CGAS, Rs. 10 Cr)
 *   - Section 54EC: Exemption = min(Remaining Gain, Bond Investment, Rs. 50 lakh)
 *   - Section 54F: Exemption = (Capital Gain × Investment) / Net Sale Consideration
 *   - Total exemption across all sections cannot exceed total capital gain.
 *
 * @param {Object} props
 * @param {Object} props.formData - Current wizard form state
 * @param {Function} props.updateField - Callback to update a single field
 */
const Step5ExemptionOptions = ({ formData, updateField }) => {
  // ── Derived values from previous steps ────────────────────────────────────

  // Capital gain from Step 4 (the selected better option)
  const capitalGain = Number(formData.computedCapitalGain) || 0;
  // Net sale consideration (needed for Section 54F proportional formula)
  const netSaleConsideration = Number(formData.computedNetSaleConsideration) || 0;
  // Tax rate selected in Step 4
  const taxRate = Number(formData.selectedTaxRate) || 12.5;

  // Determine which exemption sections are available based on asset type
  // Residential house → 54 + 54EC; Plot/Commercial → 54F + 54EC
  const isResidential = formData.assetType === 'residential';
  const showSec54 = isResidential;   // Section 54 only for residential house
  const showSec54F = !isResidential; // Section 54F only for non-residential
  const showSec54EC = true;          // Section 54EC available for all property types

  // ── Section 54 exemption computation ──────────────────────────────────────

  const sec54Exemption = useMemo(() => {
    if (!showSec54 || capitalGain <= 0) return 0;

    const investment = Number(formData.sec54Investment) || 0;
    const cgas = Number(formData.sec54CGASDeposit) || 0;

    // Total investment = amount in new house + CGAS deposit, capped at Rs. 10 Cr
    const totalInvestment = Math.min(investment + cgas, SEC54_54F_CAP);

    // Exemption = lower of capital gain or total investment
    return Math.min(capitalGain, totalInvestment);
  }, [showSec54, capitalGain, formData.sec54Investment, formData.sec54CGASDeposit]);

  // ── Section 54EC exemption computation ────────────────────────────────────

  const sec54ECExemption = useMemo(() => {
    if (!showSec54EC || capitalGain <= 0) return 0;

    const bondInvestment = Number(formData.sec54ECInvestment) || 0;
    // Capped at Rs. 50 lakh
    const cappedInvestment = Math.min(bondInvestment, SEC54EC_MAX);

    // Exemption limited to remaining gain after other exemptions
    // (will be further capped in total computation)
    return Math.min(capitalGain, cappedInvestment);
  }, [showSec54EC, capitalGain, formData.sec54ECInvestment]);

  // ── Section 54F exemption computation ─────────────────────────────────────

  const sec54FExemption = useMemo(() => {
    if (!showSec54F || capitalGain <= 0 || netSaleConsideration <= 0) return 0;

    // Ownership condition must be met
    if (!formData.sec54FOwnsMaxOneHouse || !formData.sec54FNoFutureHousePurchase) return 0;

    const investment = Number(formData.sec54FInvestment) || 0;
    const cgas = Number(formData.sec54FCGASDeposit) || 0;

    // Total investment capped at Rs. 10 Cr (Budget 2023)
    const totalInvestment = Math.min(investment + cgas, SEC54_54F_CAP);

    // If invested >= net sale consideration → full exemption
    if (totalInvestment >= netSaleConsideration) return capitalGain;

    // Proportional formula: Exemption = (Capital Gain × Investment) / Net Sale Consideration
    return Math.round((capitalGain * totalInvestment) / netSaleConsideration);
  }, [showSec54F, capitalGain, netSaleConsideration, formData.sec54FInvestment,
      formData.sec54FCGASDeposit, formData.sec54FOwnsMaxOneHouse, formData.sec54FNoFutureHousePurchase]);

  // ── Total exemption (cannot exceed capital gain) ──────────────────────────

  const totalExemption = useMemo(() => {
    // Section 54 and 54F are mutually exclusive (different asset types)
    const houseExemption = showSec54 ? sec54Exemption : sec54FExemption;

    // Total = house-based exemption + bond exemption, capped at capital gain
    return Math.min(capitalGain, houseExemption + sec54ECExemption);
  }, [capitalGain, showSec54, sec54Exemption, sec54FExemption, sec54ECExemption]);

  // ── Derived tax after exemption ───────────────────────────────────────────

  const netTaxableGain = Math.max(0, capitalGain - totalExemption);
  const taxAfterExemption = netTaxableGain * (taxRate / 100);
  const cessAfterExemption = taxAfterExemption * 0.04;
  const totalTaxAfterExemption = taxAfterExemption + cessAfterExemption;

  // ── Store computed exemption in formData for Step 6 ───────────────────────
  React.useEffect(() => {
    updateField('computedTotalExemption', totalExemption);
  }, [totalExemption, updateField]);

  // ── Sale date for deadline computation ────────────────────────────────────
  const saleDate = formData.saleDate ? new Date(formData.saleDate) : null;

  /**
   * Computes a deadline date as a human-readable string.
   * @param {Date} fromDate - The sale date
   * @param {number} years - Years to add
   * @param {number} months - Additional months to add (for 6-month bond deadline)
   * @returns {string} Formatted date string
   */
  const computeDeadline = (fromDate, years, months = 0) => {
    if (!fromDate) return '—';
    const d = new Date(fromDate);
    d.setFullYear(d.getFullYear() + years);
    d.setMonth(d.getMonth() + months);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  // If capital gain is zero or negative, no exemptions needed
  if (capitalGain <= 0) {
    return (
      <div className="space-y-6">
        <InfoBox title="No Exemptions Needed">
          Your computed capital gain is {formatCurrency(capitalGain)}.
          Since there is no positive capital gain, you do not need to claim any exemptions.
        </InfoBox>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── Context summary from Step 4 ──────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
          Your Capital Gain Summary
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Capital Gain</p>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{formatCurrency(capitalGain)}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Tax Rate</p>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{taxRate}%</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Asset Sold</p>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-100 capitalize">{formData.assetType || '—'}</p>
          </div>
        </div>
      </div>

      {/* ── Eligible exemptions explanation ───────────────────────────────── */}
      <InfoBox title="Which exemptions can you claim?">
        {isResidential ? (
          <>
            Since you sold a <strong>residential house</strong>, you can claim:
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li><strong>Section 54</strong> — Buy or construct a new residential house in India</li>
              <li><strong>Section 54EC</strong> — Invest in specified government bonds</li>
            </ul>
            You can use both together to cover more of your capital gain.
          </>
        ) : (
          <>
            Since you sold a <strong>{formData.assetType === 'plot' ? 'plot of land' : 'commercial property'}</strong>, you can claim:
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li><strong>Section 54F</strong> — Buy or construct a new residential house in India (proportional exemption)</li>
              <li><strong>Section 54EC</strong> — Invest in specified government bonds</li>
            </ul>
            You can use both together. Section 54F has a different formula — it is based on your
            total sale consideration, not just the capital gain.
          </>
        )}
      </InfoBox>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 54 — Buy/construct new residential house                  */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {showSec54 && (
        <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-green-200 dark:border-green-800 overflow-hidden">
          {/* Section header */}
          <div className="bg-green-50 dark:bg-green-900/30 px-6 py-4 border-b border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏠</span>
              <div>
                <h4 className="text-lg font-bold text-green-800 dark:text-green-200">
                  Section 54 — Reinvest in a New Residential House
                </h4>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Buy or construct a new residential house in India to save tax
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Beginner info */}
            <InfoBox title="How Section 54 works (in simple terms)">
              If you use the money from selling your old house to <strong>buy or build a new house</strong>,
              the government won't tax the amount you reinvest. Think of it as a "swap" — you're replacing
              one house with another, so no tax on the reinvested portion.
              <br /><br />
              <strong>Key rules:</strong>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>New house must be in <strong>India</strong></li>
                <li>Buy within <strong>1 year before</strong> or <strong>2 years after</strong> sale date</li>
                <li>Or construct within <strong>3 years</strong> of sale date</li>
                <li>Maximum exemption capped at <strong>Rs. 10 crore</strong> (Budget 2023)</li>
                <li>Don't sell the new house within <strong>3 years</strong> or the exemption is reversed</li>
              </ul>
            </InfoBox>

            {/* Investment amount */}
            <CurrencyInput
              label="Amount invested (or to invest) in new residential house"
              hint={`How much have you spent or plan to spend on buying/constructing a new house? Maximum exemption: ${formatCurrency(Math.min(capitalGain, SEC54_54F_CAP))}`}
              value={formData.sec54Investment}
              onChange={(val) => updateField('sec54Investment', val)}
              placeholder="0"
            />

            {/* CGAS deposit */}
            <CurrencyInput
              label="Amount deposited in Capital Gains Account Scheme (CGAS)"
              hint="If you haven't bought the new house yet, you can park the money in a CGAS account at a bank before your ITR filing deadline (usually 31 July). This preserves your exemption claim."
              value={formData.sec54CGASDeposit}
              onChange={(val) => updateField('sec54CGASDeposit', val)}
              placeholder="0"
            />

            {/* Two-house option (only if LTCG ≤ Rs. 2 Cr) */}
            {capitalGain <= TWO_HOUSE_LTCG_LIMIT && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sec54TwoHouseOption}
                    onChange={(e) => updateField('sec54TwoHouseOption', e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <p className="font-semibold text-purple-800 dark:text-purple-200">
                      Two-House Option (Budget 2019)
                    </p>
                    <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                      Since your capital gain is ≤ Rs. 2 crore, you can invest in <strong>two</strong> residential
                      houses instead of one. This is a <strong>one-time lifetime option</strong> — once used,
                      it cannot be used again for any future sale.
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Section 54 exemption result */}
            {sec54Exemption > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-300 dark:border-green-700">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-green-800 dark:text-green-200">Section 54 Exemption</span>
                  <span className="text-lg font-bold text-green-700 dark:text-green-300">{formatCurrency(sec54Exemption)}</span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  = min(Capital Gain {formatCurrency(capitalGain)}, Investment + CGAS {formatCurrency(
                    (Number(formData.sec54Investment) || 0) + (Number(formData.sec54CGASDeposit) || 0)
                  )}, Rs. 10 Cr cap)
                </p>
              </div>
            )}

            {/* Deadlines */}
            {saleDate && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Deadlines</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-gray-500 dark:text-gray-400">Purchase new house by</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">{computeDeadline(saleDate, 2)}</p>
                    <p className="text-xs text-gray-400">(2 years from sale)</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-gray-500 dark:text-gray-400">Construct new house by</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">{computeDeadline(saleDate, 3)}</p>
                    <p className="text-xs text-gray-400">(3 years from sale)</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-gray-500 dark:text-gray-400">Don't sell new house before</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">{computeDeadline(saleDate, 3)}</p>
                    <p className="text-xs text-gray-400">(3-year lock-in)</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 54F — Proportional exemption for non-residential assets    */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {showSec54F && (
        <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-teal-200 dark:border-teal-800 overflow-hidden">
          {/* Section header */}
          <div className="bg-teal-50 dark:bg-teal-900/30 px-6 py-4 border-b border-teal-200 dark:border-teal-800">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏡</span>
              <div>
                <h4 className="text-lg font-bold text-teal-800 dark:text-teal-200">
                  Section 54F — Reinvest in a Residential House (Proportional)
                </h4>
                <p className="text-sm text-teal-600 dark:text-teal-400">
                  Buy or construct a residential house using your sale proceeds
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Beginner info */}
            <InfoBox title="How Section 54F works (in simple terms)">
              Since you sold a non-residential property (land/commercial), Section 54F gives you
              a <strong>proportional exemption</strong> based on how much of your <strong>total sale
              proceeds</strong> you reinvest in a residential house.
              <br /><br />
              <strong>Key difference from Section 54:</strong> To get <em>full</em> exemption, you must
              invest the <strong>entire net sale consideration</strong> (not just the capital gain).
              If you invest only a portion, the exemption is proportionally reduced.
              <br /><br />
              <strong>Formula:</strong> Exemption = (Capital Gain × Amount Invested) ÷ Net Sale Consideration
              <br /><br />
              <strong>Example:</strong> You sold a plot for Rs. 1 Cr (net), gain = Rs. 40 lakh, reinvested
              Rs. 60 lakh → Exemption = (40 × 60) ÷ 100 = <strong>Rs. 24 lakh</strong>
            </InfoBox>

            {/* Ownership condition */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Eligibility Conditions</p>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <input
                  type="checkbox"
                  checked={formData.sec54FOwnsMaxOneHouse}
                  onChange={(e) => updateField('sec54FOwnsMaxOneHouse', e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    I own at most one other residential house
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    On the date of sale, you must not own more than one residential house (other than the new one you're buying).
                    If you own 2+ houses, Section 54F exemption is denied.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <input
                  type="checkbox"
                  checked={formData.sec54FNoFutureHousePurchase}
                  onChange={(e) => updateField('sec54FNoFutureHousePurchase', e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    I will not buy/construct another residential house within 2/3 years
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    After claiming 54F, you must not purchase any other residential house within 2 years or construct
                    one within 3 years of the sale. Violation reverses the exemption.
                  </p>
                </div>
              </label>
            </div>

            {/* Ownership warning */}
            {(!formData.sec54FOwnsMaxOneHouse || !formData.sec54FNoFutureHousePurchase) && (
              <InfoBox title="Eligibility condition not met" variant="warning">
                {!formData.sec54FOwnsMaxOneHouse
                  ? 'You indicated you own more than one residential house. Section 54F exemption cannot be claimed.'
                  : 'You indicated you may buy/construct another house. If you do, the Section 54F exemption will be reversed.'}
              </InfoBox>
            )}

            {/* Investment amount */}
            {formData.sec54FOwnsMaxOneHouse && formData.sec54FNoFutureHousePurchase && (
              <>
                <CurrencyInput
                  label="Amount invested (or to invest) in new residential house"
                  hint={`Your net sale consideration is ${formatCurrency(netSaleConsideration)}. Invest the full amount for 100% exemption. Maximum Rs. 10 crore cap applies.`}
                  value={formData.sec54FInvestment}
                  onChange={(val) => updateField('sec54FInvestment', val)}
                  placeholder="0"
                />

                <CurrencyInput
                  label="Amount deposited in Capital Gains Account Scheme (CGAS)"
                  hint="Park money in CGAS before ITR filing deadline if you haven't purchased the house yet."
                  value={formData.sec54FCGASDeposit}
                  onChange={(val) => updateField('sec54FCGASDeposit', val)}
                  placeholder="0"
                />

                {/* Section 54F exemption result */}
                {sec54FExemption > 0 && (
                  <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4 border border-teal-300 dark:border-teal-700">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-teal-800 dark:text-teal-200">Section 54F Exemption</span>
                      <span className="text-lg font-bold text-teal-700 dark:text-teal-300">{formatCurrency(sec54FExemption)}</span>
                    </div>
                    {(() => {
                      const inv = Math.min(
                        (Number(formData.sec54FInvestment) || 0) + (Number(formData.sec54FCGASDeposit) || 0),
                        SEC54_54F_CAP
                      );
                      const isFullExemption = inv >= netSaleConsideration;
                      return (
                        <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                          {isFullExemption
                            ? `Full exemption — investment (${formatCurrency(inv)}) ≥ net sale consideration (${formatCurrency(netSaleConsideration)})`
                            : `= (${formatCurrency(capitalGain)} × ${formatCurrency(inv)}) ÷ ${formatCurrency(netSaleConsideration)}`
                          }
                        </p>
                      );
                    })()}
                  </div>
                )}

                {/* Deadlines */}
                {saleDate && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Deadlines</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <p className="text-gray-500 dark:text-gray-400">Purchase new house by</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-100">{computeDeadline(saleDate, 2)}</p>
                        <p className="text-xs text-gray-400">(2 years from sale)</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <p className="text-gray-500 dark:text-gray-400">Construct new house by</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-100">{computeDeadline(saleDate, 3)}</p>
                        <p className="text-xs text-gray-400">(3 years from sale)</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <p className="text-gray-500 dark:text-gray-400">Don't sell new house before</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-100">{computeDeadline(saleDate, 3)}</p>
                        <p className="text-xs text-gray-400">(3-year lock-in)</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 54EC — Investment in specified bonds                       */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {showSec54EC && (
        <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-amber-200 dark:border-amber-800 overflow-hidden">
          {/* Section header */}
          <div className="bg-amber-50 dark:bg-amber-900/30 px-6 py-4 border-b border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📈</span>
              <div>
                <h4 className="text-lg font-bold text-amber-800 dark:text-amber-200">
                  Section 54EC — Invest in Specified Bonds
                </h4>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Invest in government-backed bonds to save tax (max Rs. 50 lakh)
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Beginner info */}
            <InfoBox title="How Section 54EC works (in simple terms)">
              Instead of buying a house, you can invest your capital gain amount (up to Rs. 50 lakh)
              in special <strong>government bonds</strong>. The invested amount is exempt from tax.
              These bonds have a <strong>5-year lock-in</strong> — you cannot sell or take a loan against
              them for 5 years.
              <br /><br />
              <strong>Key points:</strong>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>Must invest within <strong>6 months</strong> of the sale date</li>
                <li>Maximum investment: <strong>Rs. 50 lakh</strong> (cumulative, not per transaction)</li>
                <li>Bonds earn ~5.25% interest (taxable as income)</li>
                <li>Available to <strong>any taxpayer</strong> (individuals, companies, firms, etc.)</li>
                <li>Can be combined with Section {showSec54 ? '54' : '54F'} for the same sale</li>
              </ul>
            </InfoBox>

            {/* Eligible bonds */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Eligible Bonds (FY 2025-26)
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SEC54EC_BONDS.filter(b => b.active).map((bond) => (
                  <div
                    key={bond.name}
                    className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-700"
                  >
                    <p className="font-semibold text-amber-800 dark:text-amber-200 text-sm">{bond.name}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">{bond.fullName}</p>
                    {bond.note && (
                      <span className="inline-block mt-1 text-[10px] bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded">
                        {bond.note}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bond investment amount */}
            <CurrencyInput
              label="Amount invested (or to invest) in 54EC bonds"
              hint={`Maximum: ${formatCurrency(SEC54EC_MAX)} (Rs. 50 lakh). This limit is cumulative for the FY of sale and the next FY.`}
              value={formData.sec54ECInvestment}
              onChange={(val) => {
                // Auto-cap at Rs. 50 lakh
                const num = Number(val);
                if (num > SEC54EC_MAX) {
                  updateField('sec54ECInvestment', String(SEC54EC_MAX));
                } else {
                  updateField('sec54ECInvestment', val);
                }
              }}
              placeholder="0"
            />

            {/* Over-limit warning */}
            {Number(formData.sec54ECInvestment) > SEC54EC_MAX && (
              <InfoBox title="Investment capped at Rs. 50 lakh" variant="warning">
                The maximum allowable investment in 54EC bonds is Rs. 50 lakh.
                Your exemption will be calculated based on this cap.
              </InfoBox>
            )}

            {/* Section 54EC exemption result */}
            {sec54ECExemption > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-300 dark:border-amber-700">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-amber-800 dark:text-amber-200">Section 54EC Exemption</span>
                  <span className="text-lg font-bold text-amber-700 dark:text-amber-300">{formatCurrency(sec54ECExemption)}</span>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  = min(Capital Gain {formatCurrency(capitalGain)}, Bond Investment {formatCurrency(
                    Math.min(Number(formData.sec54ECInvestment) || 0, SEC54EC_MAX)
                  )})
                </p>
              </div>
            )}

            {/* Bond deadline */}
            {saleDate && (
              <div className="mt-2">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-sm inline-block">
                  <p className="text-gray-500 dark:text-gray-400">Invest in bonds by</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{computeDeadline(saleDate, 0, 6)}</p>
                  <p className="text-xs text-gray-400">(6 months from sale date — no CGAS facility for bonds)</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* RUNNING TOTAL — Exemption summary + tax savings                    */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-6 border-2 border-emerald-300 dark:border-emerald-700">
        <h4 className="font-bold text-emerald-800 dark:text-emerald-200 text-lg mb-4">
          Exemption Summary
        </h4>

        {/* Breakdown table */}
        <div className="space-y-2 mb-4">
          {showSec54 && sec54Exemption > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">Section 54 (House Reinvestment)</span>
              <span className="font-semibold text-green-700 dark:text-green-300">{formatCurrency(sec54Exemption)}</span>
            </div>
          )}
          {showSec54F && sec54FExemption > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">Section 54F (Proportional)</span>
              <span className="font-semibold text-green-700 dark:text-green-300">{formatCurrency(sec54FExemption)}</span>
            </div>
          )}
          {sec54ECExemption > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">Section 54EC (Bonds)</span>
              <span className="font-semibold text-green-700 dark:text-green-300">{formatCurrency(sec54ECExemption)}</span>
            </div>
          )}
          {totalExemption === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              No exemptions claimed yet. Enter investment amounts above to see your tax savings.
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-emerald-300 dark:border-emerald-700 pt-4 space-y-3">
          {/* Total exemption */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-800 dark:text-gray-200">Total Exemption</span>
            <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(totalExemption)}</span>
          </div>

          {/* Net taxable gain */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Net Taxable Capital Gain ({formatCurrency(capitalGain)} − {formatCurrency(totalExemption)})
            </span>
            <span className={`font-semibold ${netTaxableGain === 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'}`}>
              {formatCurrency(netTaxableGain)}
            </span>
          </div>

          {/* Tax after exemption */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Tax @ {taxRate}% + 4% cess
            </span>
            <span className={`font-semibold ${totalTaxAfterExemption === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(totalTaxAfterExemption)}
            </span>
          </div>

          {/* Tax saved */}
          {totalExemption > 0 && (
            <div className="bg-emerald-100 dark:bg-emerald-900/40 rounded-lg p-3 mt-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-emerald-800 dark:text-emerald-200">
                  Tax Saved by Claiming Exemptions
                </span>
                <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(Number(formData.computedTaxBeforeExemption) - totalTaxAfterExemption)}
                </span>
              </div>
            </div>
          )}

          {/* Full exemption celebration */}
          {capitalGain > 0 && netTaxableGain === 0 && (
            <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4 text-center mt-2 border border-green-300 dark:border-green-700">
              <p className="text-lg font-bold text-green-800 dark:text-green-200">
                Your entire capital gain is exempt!
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                No tax is payable on this capital gain, provided you follow through on the
                reinvestment within the prescribed deadlines.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CGAS beginner info */}
      <InfoBox title="What is CGAS (Capital Gains Account Scheme)?">
        CGAS is a <strong>special bank account</strong> where you park the capital gains money temporarily
        if you haven't bought/constructed the new house yet by the ITR filing deadline (usually 31 July).
        It's like a "holding account" — the money is locked there and can only be used for buying/constructing
        a house. Interest earned on CGAS is taxable as regular income.
        <br /><br />
        <strong>If you don't use the money</strong> within the prescribed time (2 years for purchase,
        3 years for construction), the unused amount will be taxed as capital gains.
      </InfoBox>
    </div>
  );
};

// ─── Step 6: Results, Deadlines & FAQ ────────────────────────────────────────

/**
 * Step6Results — Final results page showing:
 * 1. Waterfall summary: Sale Price → Capital Gain → Exemptions → Net CG → Tax + Cess
 * 2. Timeline of important deadlines computed from the sale date
 * 3. Beginner-friendly FAQ section
 * 4. Disclaimer
 *
 * @param {Object} props
 * @param {Object} props.formData - Current wizard form state (all steps)
 */
const Step6Results = ({ formData }) => {
  // ── Pull values from previous steps ──────────────────────────────────────

  // Capital gain & tax details from Step 4
  const capitalGain = Number(formData.computedCapitalGain) || 0;
  const taxRate = Number(formData.selectedTaxRate) || 12.5;
  const taxOption = formData.selectedTaxOption || 'A'; // 'A' = 12.5%, 'B' = 20% indexed
  const taxBeforeExemption = Number(formData.computedTaxBeforeExemption) || 0;

  // Exemptions from Step 5
  const totalExemption = Number(formData.computedTotalExemption) || 0;

  // Net sale consideration from Step 4 (for display)
  const netSaleConsideration = Number(formData.computedNetSaleConsideration) || 0;

  // Sale price and costs from Step 3
  const salePrice = Number(formData.salePrice) || 0;
  const stampDutyValue = Number(formData.stampDutyValue) || 0;
  // Section 50C: use higher of sale price or stamp duty (if stamp duty > 110% of sale price)
  const effectiveSalePrice = (stampDutyValue > salePrice * 1.1) ? stampDutyValue : salePrice;
  const transferExpenses = Number(formData.transferExpenses) || 0;

  // ── Computed final values ────────────────────────────────────────────────

  // Net taxable gain after exemptions
  const netTaxableGain = Math.max(0, capitalGain - totalExemption);

  // Tax on net taxable gain
  const taxOnNetGain = netTaxableGain * (taxRate / 100);

  // Health & Education Cess @ 4%
  const cess = taxOnNetGain * 0.04;

  // Final tax payable (rounded to nearest rupee)
  const finalTaxPayable = Math.round(taxOnNetGain + cess);

  // Tax saved by claiming exemptions
  const taxSaved = Math.round(taxBeforeExemption - finalTaxPayable);

  // ── Asset & date info for display ────────────────────────────────────────

  const assetLabel = ASSET_TYPES.find(t => t.value === formData.assetType)?.label || formData.assetType;
  const isResidential = formData.assetType === 'residential';
  const saleDate = formData.saleDate ? new Date(formData.saleDate) : null;

  // ── Deadline computation helper ──────────────────────────────────────────

  /**
   * Computes a deadline date by adding years/months to the sale date.
   * @param {number} years - Years to add
   * @param {number} months - Additional months to add
   * @returns {string} Formatted date string or '—'
   */
  const computeDeadline = (years, months = 0) => {
    if (!saleDate) return '—';
    const d = new Date(saleDate);
    d.setFullYear(d.getFullYear() + years);
    d.setMonth(d.getMonth() + months);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Format sale date for display
  const saleDateFormatted = saleDate
    ? saleDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  // ── Check which exemptions were claimed ──────────────────────────────────

  const sec54Claimed = isResidential && (
    (Number(formData.sec54Investment) || 0) > 0 || (Number(formData.sec54CGASDeposit) || 0) > 0
  );
  const sec54ECClaimed = (Number(formData.sec54ECInvestment) || 0) > 0;
  const sec54FClaimed = !isResidential && (
    (Number(formData.sec54FInvestment) || 0) > 0 || (Number(formData.sec54FCGASDeposit) || 0) > 0
  );
  const anyExemptionClaimed = sec54Claimed || sec54ECClaimed || sec54FClaimed;

  // ── FAQ toggle state ─────────────────────────────────────────────────────

  const [openFAQ, setOpenFAQ] = React.useState(null);

  /** Toggle a FAQ item open/closed */
  const toggleFAQ = (index) => {
    setOpenFAQ(prev => prev === index ? null : index);
  };

  // FAQ questions and answers
  const faqItems = [
    {
      question: 'What is Long-Term Capital Gain (LTCG)?',
      answer: 'When you sell a property that you have held for more than 24 months (2 years), the profit you make is called a Long-Term Capital Gain. It is taxed at a special rate (12.5% or 20% with indexation for grandfathered properties) instead of your regular income tax slab rate.',
    },
    {
      question: 'What is indexation and how does it help?',
      answer: 'Indexation adjusts the purchase price of your property for inflation using the Cost Inflation Index (CII) published by the government. This increases your "cost" on paper, which reduces your taxable capital gain. However, from 23 July 2024, indexation is only available for properties acquired before that date (grandfathered properties), and the tax rate with indexation is 20% vs 12.5% without.',
    },
    {
      question: 'What is CGAS (Capital Gains Account Scheme)?',
      answer: 'CGAS is a special bank account where you deposit your capital gains amount temporarily if you haven\'t bought or constructed a new property by the income tax return filing deadline (usually 31 July). The money is locked and can only be used for buying/constructing a house. If you don\'t use it within the prescribed time (2 years for purchase, 3 years for construction), it becomes taxable.',
    },
    {
      question: 'Can I claim both Section 54 (or 54F) and Section 54EC together?',
      answer: 'Yes! These exemptions are independent. You can invest part of your capital gain in a new house (Section 54 or 54F) and part in specified bonds (Section 54EC, up to Rs. 50 lakh). Together, they can potentially cover your entire capital gain, making it fully tax-free.',
    },
    {
      question: 'What happens if I sell the new property within 3 years?',
      answer: 'If you sell the new property (bought using the exemption) within 3 years of purchase, the exemption you claimed earlier will be reversed. The original capital gain will become taxable in the year you sell the new property. Similarly, 54EC bonds have a 5-year lock-in period.',
    },
    {
      question: 'Do I have to pay advance tax on capital gains?',
      answer: 'Yes, capital gains tax should ideally be paid as advance tax in the quarter when the sale happens. If you miss advance tax, you may have to pay interest under Sections 234B and 234C. Consult a CA for the exact advance tax schedule.',
    },
  ];

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1 — RESULTS WATERFALL                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/* Header context */}
      <div className="text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Sale of <strong className="text-gray-700 dark:text-gray-200">{assetLabel}</strong> on{' '}
          <strong className="text-gray-700 dark:text-gray-200">{saleDateFormatted}</strong>{' '}
          • Tax Option {taxOption} @ {taxRate}%
        </p>
      </div>

      {/* Waterfall: step-by-step from Sale Price down to Final Tax */}
      <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Sale consideration */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sale Consideration</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {stampDutyValue > salePrice * 1.1
                  ? '(Stamp duty value applied — Section 50C)'
                  : '(Actual sale price)'}
              </p>
            </div>
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">{formatCurrency(effectiveSalePrice)}</span>
          </div>
        </div>

        {/* Transfer expenses */}
        <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/20">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Less: Transfer Expenses (brokerage, legal fees)</span>
            <span className="text-red-600 dark:text-red-400">− {formatCurrency(transferExpenses)}</span>
          </div>
        </div>

        {/* Net sale consideration */}
        <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300 font-medium">Net Sale Consideration</span>
            <span className="font-semibold text-gray-800 dark:text-gray-100">{formatCurrency(netSaleConsideration)}</span>
          </div>
        </div>

        {/* Gross Capital Gain */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50/50 dark:bg-blue-900/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">Long-Term Capital Gain</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                After deducting cost of acquisition{taxOption === 'B' ? ' (indexed)' : ''} & improvements
              </p>
            </div>
            <span className="text-xl font-bold text-blue-700 dark:text-blue-300">{formatCurrency(capitalGain)}</span>
          </div>
        </div>

        {/* Exemptions */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-green-50/50 dark:bg-green-900/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">Less: Exemptions Claimed</p>
              <p className="text-xs text-green-600 dark:text-green-400">
                {anyExemptionClaimed ? (
                  [
                    sec54Claimed && 'Sec 54',
                    sec54FClaimed && 'Sec 54F',
                    sec54ECClaimed && 'Sec 54EC',
                  ].filter(Boolean).join(' + ')
                ) : 'No exemptions claimed'}
              </p>
            </div>
            <span className="text-xl font-bold text-green-700 dark:text-green-300">
              − {formatCurrency(totalExemption)}
            </span>
          </div>
        </div>

        {/* Net Taxable Capital Gain */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-800 dark:text-gray-200">Net Taxable Capital Gain</p>
            <span className={`text-xl font-bold ${netTaxableGain === 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-800 dark:text-gray-100'}`}>
              {formatCurrency(netTaxableGain)}
            </span>
          </div>
        </div>

        {/* Tax computation */}
        <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/20">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Tax @ {taxRate}%</span>
            <span className="text-gray-700 dark:text-gray-300">{formatCurrency(Math.round(taxOnNetGain))}</span>
          </div>
        </div>

        <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/20">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Health & Education Cess @ 4%</span>
            <span className="text-gray-700 dark:text-gray-300">{formatCurrency(Math.round(cess))}</span>
          </div>
        </div>

        {/* FINAL TAX PAYABLE — highlighted */}
        <div className={`px-6 py-5 ${finalTaxPayable === 0
          ? 'bg-green-100 dark:bg-green-900/30'
          : 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20'
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
              Total Tax Payable
            </p>
            <span className={`text-2xl font-bold ${finalTaxPayable === 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(finalTaxPayable)}
            </span>
          </div>
        </div>
      </div>

      {/* Tax savings banner — only if exemptions saved something */}
      {taxSaved > 0 && (
        <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-xl p-5 border border-emerald-300 dark:border-emerald-700 text-center">
          <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">By claiming exemptions, you saved</p>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {formatCurrency(taxSaved)}
          </p>
          <p className="text-xs text-emerald-500 dark:text-emerald-500 mt-1">
            (Tax before exemptions: {formatCurrency(taxBeforeExemption)} → After: {formatCurrency(finalTaxPayable)})
          </p>
        </div>
      )}

      {/* Full exemption celebration */}
      {capitalGain > 0 && finalTaxPayable === 0 && (
        <div className="bg-green-100 dark:bg-green-900/30 rounded-xl p-6 text-center border-2 border-green-300 dark:border-green-700">
          <p className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
            Your entire capital gain is exempt!
          </p>
          <p className="text-sm text-green-600 dark:text-green-400">
            No tax is payable on this capital gain, provided you follow through on the
            reinvestment within the deadlines below.
          </p>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2 — IMPORTANT DEADLINES TIMELINE                          */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {saleDate && anyExemptionClaimed && (
        <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 px-6 py-4 border-b border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <h4 className="text-lg font-bold text-indigo-800 dark:text-indigo-200">
                  Important Deadlines
                </h4>
                <p className="text-sm text-indigo-600 dark:text-indigo-400">
                  Computed from your sale date: {saleDateFormatted}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Timeline visual */}
            <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-indigo-200 dark:bg-indigo-700" />

              <div className="space-y-6">
                {/* Bond investment deadline — 6 months (if 54EC claimed) */}
                {sec54ECClaimed && (
                  <div className="relative flex items-start gap-4 pl-10">
                    <div className="absolute left-2 top-1 w-5 h-5 rounded-full bg-amber-500 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                      <span className="text-[10px] text-white font-bold">1</span>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-700 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-amber-800 dark:text-amber-200 text-sm">
                          Invest in Section 54EC Bonds
                        </p>
                        <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
                          {computeDeadline(0, 6)}
                        </span>
                      </div>
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        Within 6 months from the date of sale. Eligible bonds: REC, PFC, IRFC, HUDCO, IREDA.
                        No CGAS facility — you must invest before this deadline.
                      </p>
                    </div>
                  </div>
                )}

                {/* CGAS deposit deadline — ITR filing date (if Sec 54 or 54F claimed with CGAS) */}
                {((sec54Claimed && Number(formData.sec54CGASDeposit) > 0) ||
                  (sec54FClaimed && Number(formData.sec54FCGASDeposit) > 0)) && (
                  <div className="relative flex items-start gap-4 pl-10">
                    <div className="absolute left-2 top-1 w-5 h-5 rounded-full bg-blue-500 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                      <span className="text-[10px] text-white font-bold">
                        {sec54ECClaimed ? '2' : '1'}
                      </span>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-blue-800 dark:text-blue-200 text-sm">
                          Deposit in CGAS (if house not yet purchased)
                        </p>
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                          Before ITR due date
                        </span>
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        If you haven't purchased/constructed the new house by the income tax return filing
                        deadline (usually 31 July of the assessment year), deposit the unutilised amount
                        in a Capital Gains Account Scheme (CGAS) before filing.
                      </p>
                    </div>
                  </div>
                )}

                {/* Purchase deadline — 2 years (if Sec 54 or 54F claimed) */}
                {(sec54Claimed || sec54FClaimed) && (
                  <div className="relative flex items-start gap-4 pl-10">
                    <div className="absolute left-2 top-1 w-5 h-5 rounded-full bg-green-500 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                      <span className="text-[10px] text-white font-bold">
                        {[sec54ECClaimed, (sec54Claimed && Number(formData.sec54CGASDeposit) > 0) || (sec54FClaimed && Number(formData.sec54FCGASDeposit) > 0)].filter(Boolean).length + 1}
                      </span>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-green-800 dark:text-green-200 text-sm">
                          Purchase New Residential House
                        </p>
                        <span className="text-sm font-bold text-green-700 dark:text-green-300">
                          {computeDeadline(2)}
                        </span>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Within 2 years from the date of sale (for ready-to-move property).
                        You can also purchase 1 year before the sale date.
                      </p>
                    </div>
                  </div>
                )}

                {/* Construction deadline — 3 years (if Sec 54 or 54F claimed) */}
                {(sec54Claimed || sec54FClaimed) && (
                  <div className="relative flex items-start gap-4 pl-10">
                    <div className="absolute left-2 top-1 w-5 h-5 rounded-full bg-teal-500 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                      <span className="text-[10px] text-white font-bold">
                        {[sec54ECClaimed, (sec54Claimed && Number(formData.sec54CGASDeposit) > 0) || (sec54FClaimed && Number(formData.sec54FCGASDeposit) > 0)].filter(Boolean).length + 2}
                      </span>
                    </div>
                    <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4 border border-teal-200 dark:border-teal-700 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-teal-800 dark:text-teal-200 text-sm">
                          Construct New House (if building)
                        </p>
                        <span className="text-sm font-bold text-teal-700 dark:text-teal-300">
                          {computeDeadline(3)}
                        </span>
                      </div>
                      <p className="text-xs text-teal-600 dark:text-teal-400">
                        Within 3 years from the date of sale (if constructing instead of buying).
                        Construction must be completed within this period.
                      </p>
                    </div>
                  </div>
                )}

                {/* Lock-in: new house — 3 years */}
                {(sec54Claimed || sec54FClaimed) && (
                  <div className="relative flex items-start gap-4 pl-10">
                    <div className="absolute left-2 top-1 w-5 h-5 rounded-full bg-purple-500 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                      <span className="text-[10px] text-white font-bold">!</span>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-purple-800 dark:text-purple-200 text-sm">
                          Do Not Sell New House Before
                        </p>
                        <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                          3 years from purchase
                        </span>
                      </div>
                      <p className="text-xs text-purple-600 dark:text-purple-400">
                        The new house has a 3-year lock-in. If you sell it within 3 years of purchase,
                        the exemption will be reversed and the original capital gain will become taxable.
                      </p>
                    </div>
                  </div>
                )}

                {/* Lock-in: 54EC bonds — 5 years */}
                {sec54ECClaimed && (
                  <div className="relative flex items-start gap-4 pl-10">
                    <div className="absolute left-2 top-1 w-5 h-5 rounded-full bg-purple-500 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                      <span className="text-[10px] text-white font-bold">!</span>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-purple-800 dark:text-purple-200 text-sm">
                          Section 54EC Bond Lock-in Period
                        </p>
                        <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                          5 years from investment
                        </span>
                      </div>
                      <p className="text-xs text-purple-600 dark:text-purple-400">
                        54EC bonds cannot be sold, transferred, or converted before 5 years.
                        Doing so will make the original capital gain taxable in that year.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3 — BEGINNER FAQ                                          */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">❓</span>
            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200">
              Frequently Asked Questions
            </h4>
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {faqItems.map((item, index) => (
            <div key={index}>
              {/* Question — clickable toggle */}
              <button
                type="button"
                onClick={() => toggleFAQ(index)}
                className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
              >
                <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">
                  {item.question}
                </span>
                <span className={`text-gray-400 dark:text-gray-500 transition-transform duration-200 flex-shrink-0 ${openFAQ === index ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {/* Answer — collapsible */}
              {openFAQ === index && (
                <div className="px-6 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4 — DISCLAIMER                                            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-5 border border-amber-200 dark:border-amber-700">
        <div className="flex items-start gap-3">
          <span className="text-xl flex-shrink-0">⚠️</span>
          <div className="text-sm text-amber-800 dark:text-amber-200">
            <p className="font-semibold mb-2">Important Disclaimer</p>
            <ul className="list-disc ml-4 space-y-1 text-amber-700 dark:text-amber-300">
              <li>This calculator is for <strong>informational and educational purposes only</strong> and does not constitute tax, legal, or financial advice.</li>
              <li>Tax laws are complex and subject to change. Rules applicable to your specific situation may differ.</li>
              <li>Surcharge (for high-income taxpayers) has not been factored in. Actual tax liability may be higher.</li>
              <li>This calculator covers Sections 54, 54EC, and 54F only. Other exemptions or deductions may be applicable.</li>
              <li>Please consult a <strong>Chartered Accountant (CA)</strong> for professional advice tailored to your situation before making investment decisions.</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};

// ─── Main Wizard Component ──────────────────────────────────────────────────────

const CapitalGainsCalculator = () => {
  // ── Wizard step state ──────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1);

  // ── Form data (shared across all steps) ────────────────────────────────────
  const [formData, setFormData] = useState({
    // Step 1: Asset Details
    assetType: '',           // 'residential' | 'plot' | 'commercial'
    acquisitionMode: '',     // 'purchased' | 'inherited' | 'gifted' | 'will'
    taxpayerType: 'individual', // 'individual' | 'huf'
    previousOwnerDate: '',   // ISO date string (for inherited/gifted/will only)

    // Step 2: Dates & Holding
    purchaseDate: '',        // ISO date string (for purchased assets)
    acquisitionDate: '',     // ISO date string (date user received inherited/gifted/will property)
    saleDate: '',            // ISO date string (date of sale/transfer)

    // Step 3: Cost Computation
    purchasePrice: '',       // Actual cost of acquisition (₹)
    fmvOnApril2001: '',      // Fair Market Value as on 01-04-2001 (₹) — only for pre-2001 properties
    useFMV: false,           // Whether the user opts to use FMV instead of actual cost
    improvements: [],        // Array of { id, description, amount, date } — each improvement after 01-04-2001
    salePrice: '',           // Actual sale consideration received (₹)
    stampDutyValue: '',      // Stamp duty value / circle rate of the property (₹) — for Section 50C
    transferExpenses: '',    // Brokerage, legal fees, advertising, etc. (₹)

    // Step 4: Capital Gain Computation (auto-computed, stored for Steps 5 & 6)
    computedCapitalGain: 0,         // The capital gain from the selected option (₹)
    computedTaxBeforeExemption: 0,  // Tax + cess before any exemptions (₹)
    selectedTaxOption: '',          // 'A' (12.5%) or 'B' (20%)
    selectedTaxRate: 0,             // 12.5 or 20
    computedNetSaleConsideration: 0, // Net sale consideration (₹) — needed by Section 54F

    // Step 5: Exemption Options
    // Section 54 — reinvestment in residential house (available when selling residential house)
    sec54Investment: '',            // Amount invested / to invest in new residential house (₹)
    sec54CGASDeposit: '',           // Amount deposited in Capital Gains Account Scheme (₹)
    sec54TwoHouseOption: false,     // Whether user opts for the 2-house option (LTCG ≤ ₹2 Cr, once-in-lifetime)

    // Section 54EC — investment in specified bonds (available for all property types)
    sec54ECInvestment: '',          // Amount invested in 54EC bonds (₹, max ₹50 lakh)

    // Section 54F — proportional exemption (available when selling plot/commercial, NOT residential)
    sec54FInvestment: '',           // Amount invested in new residential house (₹)
    sec54FCGASDeposit: '',          // Amount deposited in CGAS for Section 54F (₹)
    sec54FOwnsMaxOneHouse: true,    // Confirms: on sale date, assessee owns ≤ 1 other residential house
    sec54FNoFutureHousePurchase: true, // Confirms: will not buy/construct another house within 2/3 years

    // Step 5: Computed (auto-stored for Step 6)
    computedTotalExemption: 0,      // Total exemption across all sections (₹)
  });

  /**
   * Updates a single field in the form data.
   * Uses functional update to avoid stale closures.
   *
   * @param {string} field - Field name in formData
   * @param {*} value - New value for the field
   */
  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // ── Step validation ────────────────────────────────────────────────────────
  // Each step must be valid before the user can proceed to the next step.

  /**
   * Validates Step 1: all required fields must be selected.
   * @returns {boolean} True if Step 1 is complete
   */
  const isStep1Valid = useMemo(() => {
    const { assetType, acquisitionMode, taxpayerType, previousOwnerDate } = formData;

    // Basic fields must be filled
    if (!assetType || !acquisitionMode || !taxpayerType) return false;

    // If inherited/gifted/will, previous owner date is required
    if (['inherited', 'gifted', 'will'].includes(acquisitionMode) && !previousOwnerDate) {
      return false;
    }

    return true;
  }, [formData]);

  /**
   * Validates Step 2: dates must be filled and sale date must be after purchase date.
   * @returns {boolean} True if Step 2 is complete
   */
  const isStep2Valid = useMemo(() => {
    const { acquisitionMode, purchaseDate, previousOwnerDate, saleDate } = formData;
    const isTransferred = ['inherited', 'gifted', 'will'].includes(acquisitionMode);

    // Purchase/acquisition start date must exist
    const startDate = isTransferred ? previousOwnerDate : purchaseDate;
    if (!startDate || !saleDate) return false;

    // Sale date must be after start date
    if (new Date(saleDate) <= new Date(startDate)) return false;

    // Must be LTCG to proceed (STCG doesn't use this calculator's exemption flow)
    const months = calculateMonthsBetween(startDate, saleDate);
    if (months <= LTCG_THRESHOLD_MONTHS) return false;

    return true;
  }, [formData]);

  /**
   * Validates Step 3: purchase price and sale price are required.
   * FMV is required only if property was acquired before 01-04-2001 and user opts for FMV.
   * Improvements must have valid dates (after 01-04-2001) if entered.
   * @returns {boolean} True if Step 3 is complete
   */
  const isStep3Valid = useMemo(() => {
    const { purchasePrice, salePrice, improvements, fmvOnApril2001, useFMV } = formData;

    // Purchase price is always required
    if (!purchasePrice || Number(purchasePrice) <= 0) return false;

    // Sale price is always required
    if (!salePrice || Number(salePrice) <= 0) return false;

    // If user opted for FMV, it must be provided
    const isTransferred = ['inherited', 'gifted', 'will'].includes(formData.acquisitionMode);
    const acquisitionDateStr = isTransferred ? formData.previousOwnerDate : formData.purchaseDate;
    const acquiredBefore2001 = acquisitionDateStr
      ? new Date(acquisitionDateStr) < new Date('2001-04-01')
      : false;

    if (acquiredBefore2001 && useFMV && (!fmvOnApril2001 || Number(fmvOnApril2001) <= 0)) {
      return false;
    }

    // Validate improvements: each must have amount > 0 and date after 01-04-2001
    for (const imp of improvements) {
      if (imp.amount && Number(imp.amount) > 0) {
        // If amount is entered, date is required and must be after 01-04-2001
        if (!imp.date) return false;
        if (new Date(imp.date) < new Date('2001-04-01')) return false;
      }
    }

    return true;
  }, [formData]);

  /**
   * Validates Step 4: capital gain must be computed (scenario must be determined).
   * Step 4 is auto-computed from Steps 1-3 data, so it's valid once the scenario
   * is determinable (dates and costs exist from prior steps).
   * @returns {boolean} True if Step 4 is complete
   */
  const isStep4Valid = useMemo(() => {
    // We need a valid scenario and the computed values to be present
    const isTransferredV = ['inherited', 'gifted', 'will'].includes(formData.acquisitionMode);
    const acqDateV = isTransferredV ? formData.previousOwnerDate : formData.purchaseDate;
    if (!acqDateV || !formData.saleDate) return false;
    // Sale price must exist (from Step 3)
    if (!formData.salePrice || Number(formData.salePrice) <= 0) return false;
    return true;
  }, [formData]);

  /**
   * Validates Step 5: exemption options.
   * Step 5 is always valid — users can proceed even with zero exemptions.
   * The component handles its own display logic (showing exemption sections
   * based on asset type and computing totals). No hard validation needed
   * since claiming exemptions is optional.
   * @returns {boolean} Always true
   */
  const isStep5Valid = useMemo(() => {
    // If capital gain ≤ 0, no exemptions needed — always valid
    if (Number(formData.computedCapitalGain) <= 0) return true;

    // Exemptions are optional — user can proceed without claiming any
    return true;
  }, [formData.computedCapitalGain]);

  /**
   * Checks if the current step is valid (can proceed to next).
   * @returns {boolean}
   */
  const isCurrentStepValid = useMemo(() => {
    switch (currentStep) {
      case 1: return isStep1Valid;
      case 2: return isStep2Valid;
      case 3: return isStep3Valid;
      case 4: return isStep4Valid;
      case 5: return isStep5Valid;
      // Step 6 is placeholder — always valid for now
      default: return true;
    }
  }, [currentStep, isStep1Valid, isStep2Valid, isStep3Valid, isStep4Valid, isStep5Valid]);

  // ── Navigation handlers ────────────────────────────────────────────────────

  /** Go to next step (with validation) */
  const handleNext = useCallback(() => {
    if (isCurrentStepValid && currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
      // Scroll to top of the wizard on step change
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isCurrentStepValid, currentStep]);

  /** Go to previous step */
  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  /** Reset wizard to Step 1 with blank form data */
  const handleStartOver = useCallback(() => {
    setCurrentStep(1);
    setFormData({
      assetType: '',
      acquisitionMode: '',
      taxpayerType: 'individual',
      previousOwnerDate: '',
      purchaseDate: '',
      acquisitionDate: '',
      saleDate: '',
      purchasePrice: '',
      fmvOnApril2001: '',
      useFMV: false,
      improvements: [],
      salePrice: '',
      stampDutyValue: '',
      transferExpenses: '',
      computedCapitalGain: 0,
      computedTaxBeforeExemption: 0,
      selectedTaxOption: '',
      selectedTaxRate: 0,
      computedNetSaleConsideration: 0,
      sec54Investment: '',
      sec54CGASDeposit: '',
      sec54TwoHouseOption: false,
      sec54ECInvestment: '',
      sec54FInvestment: '',
      sec54FCGASDeposit: '',
      sec54FOwnsMaxOneHouse: true,
      sec54FNoFutureHousePurchase: true,
      computedTotalExemption: 0,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ── Render current step ────────────────────────────────────────────────────

  /**
   * Returns the component for the current wizard step.
   * @returns {React.ReactElement}
   */
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1AssetDetails formData={formData} updateField={updateField} />;
      case 2:
        return <Step2DatesHolding formData={formData} updateField={updateField} />;
      case 3:
        return <Step3CostComputation formData={formData} updateField={updateField} />;
      case 4:
        return <Step4CapitalGainComputation formData={formData} updateField={updateField} />;
      case 5:
        return <Step5ExemptionOptions formData={formData} updateField={updateField} />;
      case 6:
        return <Step6Results formData={formData} />;
      default:
        return null;
    }
  };

  // ── Validation message for Next button ────────────────────────────────────

  /**
   * Returns a hint message explaining why the Next button is disabled.
   * @returns {string|null}
   */
  const getValidationHint = () => {
    if (isCurrentStepValid) return null;

    switch (currentStep) {
      case 1: {
        if (!formData.assetType) return 'Please select the type of property you sold.';
        if (!formData.acquisitionMode) return 'Please select how you acquired the property.';
        if (['inherited', 'gifted', 'will'].includes(formData.acquisitionMode) && !formData.previousOwnerDate) {
          return 'Please enter the previous owner\'s original purchase date.';
        }
        if (!formData.taxpayerType) return 'Please select your taxpayer type.';
        return null;
      }
      case 2: {
        const isTransferred = ['inherited', 'gifted', 'will'].includes(formData.acquisitionMode);
        const startDate = isTransferred ? formData.previousOwnerDate : formData.purchaseDate;
        if (!startDate) return 'Please enter the purchase date.';
        if (!formData.saleDate) return 'Please enter the sale date.';
        if (new Date(formData.saleDate) <= new Date(startDate)) {
          return 'Sale date must be after the purchase date.';
        }
        // STCG check
        const months = calculateMonthsBetween(startDate, formData.saleDate);
        if (months <= LTCG_THRESHOLD_MONTHS) {
          return 'This calculator is for Long-Term Capital Gains only. The property must be held for more than 24 months.';
        }
        return null;
      }
      case 3: {
        if (!formData.purchasePrice || Number(formData.purchasePrice) <= 0) {
          return 'Please enter the purchase price / cost of acquisition.';
        }
        if (!formData.salePrice || Number(formData.salePrice) <= 0) {
          return 'Please enter the sale price.';
        }
        // Check FMV if applicable
        const isTransferredV = ['inherited', 'gifted', 'will'].includes(formData.acquisitionMode);
        const acqDateV = isTransferredV ? formData.previousOwnerDate : formData.purchaseDate;
        const before2001V = acqDateV ? new Date(acqDateV) < new Date('2001-04-01') : false;
        if (before2001V && formData.useFMV && (!formData.fmvOnApril2001 || Number(formData.fmvOnApril2001) <= 0)) {
          return 'You selected FMV option — please enter the Fair Market Value as on 01-04-2001.';
        }
        // Check improvements
        for (const imp of formData.improvements) {
          if (imp.amount && Number(imp.amount) > 0 && !imp.date) {
            return 'Please enter the date for all improvements with an amount.';
          }
          if (imp.date && new Date(imp.date) < new Date('2001-04-01')) {
            return 'Improvement dates must be after 01-04-2001.';
          }
        }
        return null;
      }
      default:
        return null;
    }
  };

  const validationHint = getValidationHint();

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <header className="text-center mb-2">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Capital Gains Tax Exemption Calculator
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Step-by-step guide to compute capital gains on property sales and claim tax exemptions
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          AY 2026-27 (FY 2025-26) • For Individuals & HUFs
        </p>
      </header>

      {/* Step indicator */}
      <StepIndicator
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        labels={STEP_LABELS}
      />

      {/* Step content card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 border border-gray-200 dark:border-gray-700">
        {/* Step title */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
            {currentStep}
          </span>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {STEP_LABELS[currentStep - 1]}
          </h3>
        </div>

        {/* Step body */}
        {renderStep()}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        {/* Back button */}
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200
            ${currentStep === 1
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
            }`}
        >
          ← Back
        </button>

        {/* Next / placeholder for future "Calculate" */}
        <div className="flex flex-col items-end gap-1">
          {validationHint && (
            <p className="text-xs text-amber-600 dark:text-amber-400 max-w-sm text-right">
              {validationHint}
            </p>
          )}
          {currentStep === TOTAL_STEPS ? (
            /* On the final step, show "Start Over" to reset the wizard */
            <button
              type="button"
              onClick={handleStartOver}
              className="px-8 py-3 rounded-lg font-semibold transition-all duration-200 bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-400 text-white shadow-md hover:shadow-lg cursor-pointer"
            >
              Start Over
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={!isCurrentStepValid}
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200
                ${isCurrentStepValid
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg cursor-pointer'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
            >
              Next →
            </button>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4 px-4">
        This calculator is for informational purposes only and does not constitute tax advice.
        Tax laws are complex and subject to change. Please consult a Chartered Accountant for
        professional advice tailored to your situation.
      </div>
    </div>
  );
};

export default CapitalGainsCalculator;
