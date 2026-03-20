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

/**
 * Placeholder component for steps that will be implemented in future tasks.
 *
 * @param {Object} props
 * @param {number} props.stepNumber - Which step this placeholder represents
 * @param {string} props.title - Step title
 * @param {string} props.description - Brief description of what this step will do
 */
const StepPlaceholder = ({ stepNumber, title, description }) => (
  <div className="text-center py-16">
    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 mb-6">
      <span className="text-3xl text-gray-400 dark:text-gray-500">🚧</span>
    </div>
    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
      Step {stepNumber}: {title}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
      {description}
    </p>
    <p className="text-sm text-gray-400 dark:text-gray-500 mt-4 italic">
      Coming soon — this step will be implemented in a future session.
    </p>
  </div>
);

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
   * Checks if the current step is valid (can proceed to next).
   * @returns {boolean}
   */
  const isCurrentStepValid = useMemo(() => {
    switch (currentStep) {
      case 1: return isStep1Valid;
      case 2: return isStep2Valid;
      // Steps 3-6 are placeholders — always valid for now
      default: return true;
    }
  }, [currentStep, isStep1Valid, isStep2Valid]);

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
        return (
          <StepPlaceholder
            stepNumber={3}
            title="Cost Computation"
            description="Enter purchase price, Fair Market Value (for pre-2001 properties), improvements/renovations, sale price, and transfer expenses."
          />
        );
      case 4:
        return (
          <StepPlaceholder
            stepNumber={4}
            title="Capital Gain Computation"
            description="Compare Option A (20% with indexation) vs Option B (12.5% without indexation) and see which saves you more tax."
          />
        );
      case 5:
        return (
          <StepPlaceholder
            stepNumber={5}
            title="Exemption Options"
            description="Claim exemptions under Sections 54, 54EC, and 54F based on your reinvestment plans to reduce or eliminate your tax."
          />
        );
      case 6:
        return (
          <StepPlaceholder
            stepNumber={6}
            title="Results & Deadlines"
            description="View your final tax liability, a timeline of important deadlines, and action items for claiming your exemptions."
          />
        );
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
          <button
            type="button"
            onClick={handleNext}
            disabled={!isCurrentStepValid || currentStep === TOTAL_STEPS}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200
              ${isCurrentStepValid && currentStep < TOTAL_STEPS
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg cursor-pointer'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
          >
            {currentStep === TOTAL_STEPS ? 'Done' : 'Next →'}
          </button>
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
