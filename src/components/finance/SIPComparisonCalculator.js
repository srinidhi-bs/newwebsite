/**
 * SIP Comparison Calculator Component
 *
 * Compares Fixed Deposit (FD) returns vs Equity Index Fund SIP returns
 * with interactive sliders, SVG growth chart, year-by-year breakdown,
 * and compounding gap analysis.
 *
 * Features:
 * - 5 adjustable parameters via range sliders (SIP amount, step-up, years, FD rate, Equity rate)
 * - Editable numeric values — click any slider value to type a precise number
 * - Real-time SVG line chart showing corpus growth over time
 * - 4 metric summary cards (invested, FD corpus, Equity corpus, advantage)
 * - Year-by-year mini-bar breakdown for both instruments
 * - Compounding gap section (wealth multipliers + extra wealth)
 * - Disclaimer section with important caveats
 * - Fully responsive with dark mode support
 *
 * Based on: fd_vs_nifty_sip_dashboard.jsx (standalone dark-mode component)
 * Converted to: TailwindCSS, light/dark mode, site-native patterns
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';

// ──────────────────────────────────────────────────────────────
// Currency formatting helpers (abbreviated Indian format)
// These use Cr/L/K suffixes for compact display in cards & charts
// ──────────────────────────────────────────────────────────────

/**
 * Abbreviated currency format for compact display
 * e.g., ₹1.50 Cr, ₹10.20L, ₹5.0K, ₹500
 */
const fmt = (n) => {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
  if (n >= 100000) return '₹' + (n / 100000).toFixed(2) + 'L';
  if (n >= 1000) return '₹' + (n / 1000).toFixed(1) + 'K';
  return '₹' + Math.round(n);
};

/**
 * Full currency format with Indian comma grouping
 * e.g., ₹10,00,000
 */
const fmtFull = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

// ──────────────────────────────────────────────────────────────
// Color constants for the SVG chart and themed elements
// These are kept as hex values because SVG attributes (stroke, fill)
// don't work with Tailwind classes
// ──────────────────────────────────────────────────────────────
const CHART_COLORS = {
  fd: '#f59e0b',       // amber-500 — Fixed Deposit line
  equity: '#06b6d4',   // cyan-500 — Equity Index Fund line
  green: '#10b981',    // emerald-500 — positive advantage
  red: '#ef4444',      // red-500 — negative advantage
  invested: '#94a3b8', // gray-400 — invested amount (dashed line)
};

// ──────────────────────────────────────────────────────────────
// SIP Computation Engine
// ──────────────────────────────────────────────────────────────

/**
 * Computes SIP corpus with optional annual step-up
 *
 * @param {number} monthly     — Monthly SIP amount (₹)
 * @param {number} annualRate  — Expected annual return (%)
 * @param {number} years       — Investment period (years)
 * @param {number} annualStepUp — Annual increase in monthly SIP (₹, default 0)
 * @returns {{ invested: number, corpus: number, gain: number, yearlyData: Array }}
 */
function computeSIP(monthly, annualRate, years, annualStepUp = 0) {
  const monthlyRate = annualRate / 100 / 12;  // Convert annual % to monthly decimal
  const months = years * 12;
  const yearlyData = [];
  let corpus = 0;
  let totalInvested = 0;
  let currentMonthly = monthly;

  for (let m = 1; m <= months; m++) {
    // Step-up: increase monthly SIP at the start of each new year (from year 2 onwards)
    if (m > 1 && (m - 1) % 12 === 0) {
      currentMonthly += annualStepUp;
    }
    // Apply monthly compounding: add SIP, then grow by monthly rate
    corpus = (corpus + currentMonthly) * (1 + monthlyRate);
    totalInvested += currentMonthly;

    // Snapshot at end of each year for the chart and breakdown
    if (m % 12 === 0) {
      yearlyData.push({
        year: m / 12,
        invested: totalInvested,
        corpus: Math.round(corpus),
        gain: Math.round(corpus - totalInvested),
        monthlySip: currentMonthly,
      });
    }
  }

  return {
    invested: totalInvested,
    corpus: Math.round(corpus),
    gain: Math.round(corpus - totalInvested),
    yearlyData,
  };
}

// ──────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────

/**
 * SliderInput — Range slider with label, editable current value, and min/max labels
 *
 * The displayed value is clickable. Clicking it turns it into a text input
 * so the user can type a precise number. Pressing Enter or blurring the input
 * commits the value (clamped to min/max and snapped to the nearest step).
 *
 * Uses a CSS gradient background on the range track to show the filled portion.
 * The thumb is styled via a scoped <style> block in the parent component.
 */
function SliderInput({ label, value, onChange, min, max, step, suffix, color, prefix }) {
  // Calculate fill percentage for the gradient background
  const pct = ((value - min) / (max - min)) * 100;

  // ── Editable value state ──
  const [editing, setEditing] = useState(false);   // true while the text input is shown
  const [draft, setDraft] = useState('');           // raw text the user is typing
  const inputRef = useRef(null);                    // ref to auto-focus the text input

  // Auto-focus the text input when editing begins
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select(); // select all text for easy replacement
    }
  }, [editing]);

  /**
   * Commit the typed value: parse, clamp to [min, max], snap to step, then call onChange.
   * If the typed value is invalid (NaN), revert to the current value.
   */
  const commitEdit = useCallback(() => {
    setEditing(false);
    const parsed = parseFloat(draft);
    if (isNaN(parsed)) return; // invalid input — just close, keep old value

    // Clamp to slider range
    let clamped = Math.min(Math.max(parsed, min), max);
    // Snap to nearest step
    clamped = Math.round(clamped / step) * step;
    // Fix floating-point artifacts (e.g., 7.000000001 → 7.0)
    clamped = parseFloat(clamped.toFixed(10));
    onChange(clamped);
  }, [draft, min, max, step, onChange]);

  /**
   * Handle keydown in the text input:
   * - Enter: commit the value
   * - Escape: cancel editing without changing the value
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      commitEdit();
    } else if (e.key === 'Escape') {
      setEditing(false); // cancel — don't commit
    }
  };

  /**
   * Start editing: show the text input pre-filled with the current numeric value
   */
  const startEditing = () => {
    setDraft(String(value));
    setEditing(true);
  };

  return (
    <div className="mb-5">
      {/* Label row: parameter name on left, current value (or text input) on right */}
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-sm text-gray-500 dark:text-gray-400 tracking-wide">
          {label}
        </span>

        {editing ? (
          /* ── Editing mode: show a compact text input ── */
          <div className="flex items-baseline gap-0.5">
            {prefix && (
              <span className="text-xl font-semibold font-mono tabular-nums" style={{ color }}>
                {prefix}
              </span>
            )}
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleKeyDown}
              className="w-24 text-xl font-semibold font-mono tabular-nums bg-transparent border-b-2 border-indigo-400 outline-none text-right text-gray-900 dark:text-white"
              style={{ caretColor: color }}
            />
            {suffix && (
              <span className="text-xl font-semibold font-mono tabular-nums" style={{ color }}>
                {suffix}
              </span>
            )}
          </div>
        ) : (
          /* ── Display mode: clickable value ── */
          <span
            className="text-xl font-semibold font-mono tabular-nums cursor-pointer hover:opacity-75 transition-opacity select-none"
            style={{ color }}
            onClick={startEditing}
            title="Click to edit"
          >
            {prefix || ''}
            {typeof value === 'number' && value >= 1000
              ? value.toLocaleString('en-IN')
              : value}
            {suffix}
          </span>
        )}
      </div>

      {/* Range slider with gradient fill */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="sip-slider w-full h-1.5 rounded-full outline-none cursor-pointer appearance-none"
        style={{
          background: `linear-gradient(to right, ${color} ${pct}%, var(--slider-track) ${pct}%)`,
        }}
      />

      {/* Min/Max labels below slider */}
      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
        <span>{prefix || ''}{min.toLocaleString('en-IN')}{suffix}</span>
        <span>{prefix || ''}{max.toLocaleString('en-IN')}{suffix}</span>
      </div>
    </div>
  );
}

/**
 * MetricCard — Summary stat card (e.g., "Total Invested", "FD Corpus")
 * Shows label, large formatted value, and optional subtitle
 */
function MetricCard({ label, value, sub, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 relative overflow-hidden">
      {/* Subtle colored glow circle in top-right */}
      <div
        className="absolute -top-5 -right-5 w-20 h-20 rounded-full opacity-10"
        style={{ background: color }}
      />
      {/* Label */}
      <div className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
        {label}
      </div>
      {/* Main value */}
      <div
        className="text-2xl font-bold font-mono tabular-nums"
        style={{ color }}
      >
        {value}
      </div>
      {/* Optional subtitle */}
      {sub && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {sub}
        </div>
      )}
    </div>
  );
}

/**
 * MiniBar — Horizontal stacked bar showing invested vs corpus for a single year
 * Used in the year-by-year breakdown section
 */
function MiniBar({ label, invested, corpus, color, maxVal }) {
  const iPct = (invested / maxVal) * 100;  // Invested portion width
  const cPct = (corpus / maxVal) * 100;    // Corpus portion width

  return (
    <div className="mb-2.5">
      {/* Year label + corpus value */}
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-0.5">
        <span>{label}</span>
        <span className="font-mono tabular-nums font-semibold" style={{ color }}>
          {fmtFull(corpus)}
        </span>
      </div>
      {/* Stacked bar: invested (darker) overlaid on corpus (lighter) */}
      <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded overflow-hidden relative">
        <div
          className="absolute h-full rounded opacity-25"
          style={{ width: cPct + '%', background: color }}
        />
        <div
          className="absolute h-full rounded opacity-40"
          style={{ width: iPct + '%', background: CHART_COLORS.invested }}
        />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────

const SIPComparisonCalculator = () => {
  // ── State: user-adjustable parameters ──
  const [sip, setSip] = useState(10000);            // Monthly SIP amount (₹)
  const [stepUp, setStepUp] = useState(0);           // Annual increase in SIP (₹)
  const [fdRate, setFdRate] = useState(7.0);          // FD interest rate (% p.a.)
  const [equityRate, setEquityRate] = useState(12.0); // Expected Equity return (% p.a.)
  const [years, setYears] = useState(10);             // Investment period (years)

  // ── Derived calculations (memoized for performance) ──
  const fd = useMemo(() => computeSIP(sip, fdRate, years, stepUp), [sip, fdRate, years, stepUp]);
  const equity = useMemo(() => computeSIP(sip, equityRate, years, stepUp), [sip, equityRate, years, stepUp]);

  // Summary metrics
  const maxCorpus = Math.max(fd.corpus, equity.corpus);
  const diff = equity.corpus - fd.corpus;                                    // Absolute difference
  const diffPct = fd.corpus > 0 ? ((diff / fd.corpus) * 100).toFixed(1) : 0; // Percentage difference

  // ── SVG Chart dimensions and scales ──
  const chartH = 240;
  const chartW = 600;
  const padL = 55;   // Left padding (space for Y-axis labels)
  const padR = 20;   // Right padding
  const padT = 20;   // Top padding
  const padB = 34;   // Bottom padding (space for X-axis labels)
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  // Y-axis: compute nice round max value and tick marks
  const niceRound = maxCorpus > 50000000 ? 10000000
    : maxCorpus > 10000000 ? 5000000
    : maxCorpus > 1000000 ? 500000
    : 100000;
  const maxY = Math.ceil(maxCorpus / niceRound) * niceRound;
  const yTicks = 5;

  // Scale functions: map data values to SVG coordinates
  const xScale = (yr) => padL + (yr / years) * plotW;
  const yScale = (val) => padT + plotH - (val / maxY) * plotH;

  // ── SVG Path generation ──
  // Line paths for FD, Equity, and Invested
  const fdPath = fd.yearlyData
    .map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(d.year)},${yScale(d.corpus)}`)
    .join(' ');
  const equityPath = equity.yearlyData
    .map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(d.year)},${yScale(d.corpus)}`)
    .join(' ');
  const investedPath = fd.yearlyData
    .map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(d.year)},${yScale(d.invested)}`)
    .join(' ');

  // Area fills (closed paths for gradient fills beneath lines)
  const fdArea = fdPath + ` L${xScale(years)},${yScale(0)} L${xScale(1)},${yScale(0)} Z`;
  const equityArea = equityPath + ` L${xScale(years)},${yScale(0)} L${xScale(1)},${yScale(0)} Z`;

  // ── Dot and label filtering (avoid overcrowding for long durations) ──
  const showEveryN = years <= 10 ? 1 : years <= 20 ? 2 : 5;
  const dotFilter = (_, i) => {
    const yr = i + 1;
    return yr === years || yr % showEveryN === 0;
  };
  const labelFilter = (d) => {
    if (years <= 5) return true;
    if (years <= 15) return d.year % 2 === 0 || d.year === years;
    if (years <= 25) return d.year % 5 === 0 || d.year === years;
    return d.year % 10 === 0 || d.year === years;
  };

  /**
   * Format Y-axis values in abbreviated form (Cr, L, K)
   */
  const fmtYAxis = (val) => {
    if (val >= 10000000) return (val / 10000000).toFixed(val % 10000000 === 0 ? 0 : 1) + 'Cr';
    if (val >= 100000) return (val / 100000).toFixed(val >= 1000000 && val % 100000 === 0 ? 0 : 1) + 'L';
    return Math.round(val / 1000) + 'K';
  };

  // Colors for light/dark SVG elements (grid lines, axis text)
  // These CSS custom properties are set via a <style> block below
  const gridColor = 'var(--chart-grid)';
  const axisTextColor = 'var(--chart-axis-text)';

  return (
    <div className="max-w-3xl mx-auto">
      {/* Scoped styles for slider thumb and CSS custom properties */}
      <style>{`
        /* CSS custom properties for theme-aware chart colors */
        :root {
          --slider-track: #e5e7eb;
          --chart-grid: #e5e7eb;
          --chart-axis-text: #9ca3af;
          --chart-card-bg: #ffffff;
        }
        .dark {
          --slider-track: #1e293b;
          --chart-grid: #1e293b;
          --chart-axis-text: #64748b;
          --chart-card-bg: #1f2937;
        }

        /* Range slider thumb styling */
        .sip-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          border: 2px solid #6366f1;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .sip-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          border: 2px solid #6366f1;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
      `}</style>

      {/* ── Page Header ── */}
      <div className="mb-7">
        <div className="text-xs uppercase tracking-widest text-cyan-600 dark:text-cyan-400 mb-1.5 font-medium">
          Investment Comparison
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
          Fixed Deposit <span className="text-gray-400 dark:text-gray-500">vs</span> Equity Index Fund
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
          SIP comparison with adjustable parameters
        </p>
      </div>

      {/* ── Input Sliders Card ── */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 md:p-6 mb-5">
        {/* Row 1: SIP amount + Step-up (side by side on md+) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
          <SliderInput
            label="Monthly SIP amount"
            value={sip}
            onChange={setSip}
            min={1000}
            max={100000}
            step={500}
            suffix=""
            prefix="₹"
            color="#818cf8" // indigo-400
          />
          <SliderInput
            label="Yearly SIP increase"
            value={stepUp}
            onChange={setStepUp}
            min={0}
            max={10000}
            step={500}
            suffix=""
            prefix="₹"
            color={CHART_COLORS.green}
          />
        </div>

        {/* Row 2: Investment period (full width) */}
        <SliderInput
          label="Investment period"
          value={years}
          onChange={setYears}
          min={1}
          max={40}
          step={1}
          suffix=" years"
          color="#a78bfa" // violet-400
        />

        {/* Row 3: FD rate + Equity rate (side by side on md+) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
          <SliderInput
            label="FD rate (p.a.)"
            value={fdRate}
            onChange={setFdRate}
            min={3}
            max={10}
            step={0.1}
            suffix="%"
            color={CHART_COLORS.fd}
          />
          <SliderInput
            label="Equity return (p.a.)"
            value={equityRate}
            onChange={setEquityRate}
            min={8}
            max={20}
            step={0.5}
            suffix="%"
            color={CHART_COLORS.equity}
          />
        </div>
      </div>

      {/* ── Summary Metric Cards (4 cards in a row on lg, 2 on sm) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-5">
        <MetricCard
          label="Total invested"
          value={fmt(fd.invested)}
          sub={
            stepUp > 0
              ? `${sip.toLocaleString('en-IN')}/mo → ${(sip + stepUp * (years - 1)).toLocaleString('en-IN')}/mo by yr ${years}`
              : `${sip.toLocaleString('en-IN')}/mo × ${years * 12}`
          }
          color="#94a3b8" // gray-400
        />
        <MetricCard
          label="FD corpus"
          value={fmt(fd.corpus)}
          sub={`Gain: ${fmt(fd.gain)}`}
          color={CHART_COLORS.fd}
        />
        <MetricCard
          label="Equity corpus"
          value={fmt(equity.corpus)}
          sub={`Gain: ${fmt(equity.gain)}`}
          color={CHART_COLORS.equity}
        />
        <MetricCard
          label="Equity advantage"
          value={fmt(Math.abs(diff))}
          sub={`${diff >= 0 ? '+' : '-'}${Math.abs(diffPct)}% more`}
          color={diff >= 0 ? CHART_COLORS.green : CHART_COLORS.red}
        />
      </div>

      {/* ── SVG Growth Chart ── */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 mb-5">
        {/* Chart header with legend */}
        <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Growth over {years} year{years > 1 ? 's' : ''}
          </span>
          <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
            {/* Legend items */}
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-4 h-0.5 rounded" style={{ background: CHART_COLORS.invested }} /> Invested
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-4 h-0.5 rounded" style={{ background: CHART_COLORS.fd }} /> FD
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-4 h-0.5 rounded" style={{ background: CHART_COLORS.equity }} /> Equity
            </span>
          </div>
        </div>

        {/* SVG chart — responsive via viewBox */}
        <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} className="block">
          {/* Y-axis grid lines and labels */}
          {Array.from({ length: yTicks + 1 }, (_, i) => {
            const val = (maxY / yTicks) * i;
            const y = yScale(val);
            return (
              <g key={i}>
                <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke={gridColor} strokeWidth={1} />
                <text
                  x={padL - 8} y={y + 4}
                  textAnchor="end"
                  fontSize={10}
                  fill={axisTextColor}
                  fontFamily="ui-monospace, monospace"
                >
                  {fmtYAxis(val)}
                </text>
              </g>
            );
          })}

          {/* X-axis year labels */}
          {fd.yearlyData.filter(labelFilter).map((d) => (
            <text
              key={d.year}
              x={xScale(d.year)} y={chartH - 6}
              textAnchor="middle"
              fontSize={10}
              fill={axisTextColor}
            >
              Y{d.year}
            </text>
          ))}

          {/* Gradient definitions for area fills */}
          <defs>
            <linearGradient id="sip-equityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.equity} stopOpacity={0.5} />
              <stop offset="100%" stopColor={CHART_COLORS.equity} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="sip-fdGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.fd} stopOpacity={0.4} />
              <stop offset="100%" stopColor={CHART_COLORS.fd} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Area fills beneath the lines */}
          <path d={equityArea} fill="url(#sip-equityGrad)" opacity={0.15} />
          <path d={fdArea} fill="url(#sip-fdGrad)" opacity={0.12} />

          {/* Invested line (dashed) */}
          <path d={investedPath} fill="none" stroke={CHART_COLORS.invested} strokeWidth={2} strokeDasharray="5,4" />

          {/* FD line */}
          <path d={fdPath} fill="none" stroke={CHART_COLORS.fd} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

          {/* Equity line */}
          <path d={equityPath} fill="none" stroke={CHART_COLORS.equity} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

          {/* Data point dots (filtered to avoid overcrowding) */}
          {fd.yearlyData.filter(dotFilter).map((d) => (
            <circle
              key={'fd' + d.year}
              cx={xScale(d.year)} cy={yScale(d.corpus)}
              r={3.5}
              fill={CHART_COLORS.fd}
              stroke="var(--chart-card-bg)"
              strokeWidth={1.5}
            />
          ))}
          {equity.yearlyData.filter(dotFilter).map((d) => (
            <circle
              key={'eq' + d.year}
              cx={xScale(d.year)} cy={yScale(d.corpus)}
              r={3.5}
              fill={CHART_COLORS.equity}
              stroke="var(--chart-card-bg)"
              strokeWidth={1.5}
            />
          ))}

          {/* End-value labels on the right side of chart */}
          <text
            x={xScale(years) + 4} y={yScale(equity.corpus) - 6}
            fontSize={11} fill={CHART_COLORS.equity} fontWeight={600}
            fontFamily="ui-monospace, monospace"
          >
            {fmt(equity.corpus)}
          </text>
          <text
            x={xScale(years) + 4} y={yScale(fd.corpus) + 14}
            fontSize={11} fill={CHART_COLORS.fd} fontWeight={600}
            fontFamily="ui-monospace, monospace"
          >
            {fmt(fd.corpus)}
          </text>
        </svg>
      </div>

      {/* ── Year-by-Year Breakdown ── */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 mb-5">
        <div className="text-sm font-semibold text-gray-900 dark:text-white mb-3.5">
          Year-by-year breakdown
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* FD column */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: CHART_COLORS.fd }}>
              Fixed Deposit
            </div>
            {fd.yearlyData.map((d) => (
              <MiniBar
                key={d.year}
                label={
                  stepUp > 0
                    ? `Yr ${d.year} (₹${d.monthlySip.toLocaleString('en-IN')}/mo)`
                    : `Year ${d.year}`
                }
                invested={d.invested}
                corpus={d.corpus}
                color={CHART_COLORS.fd}
                maxVal={maxCorpus * 1.05}
              />
            ))}
          </div>
          {/* Equity column */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: CHART_COLORS.equity }}>
              Equity Index Fund
            </div>
            {equity.yearlyData.map((d) => (
              <MiniBar
                key={d.year}
                label={
                  stepUp > 0
                    ? `Yr ${d.year} (₹${d.monthlySip.toLocaleString('en-IN')}/mo)`
                    : `Year ${d.year}`
                }
                invested={d.invested}
                corpus={d.corpus}
                color={CHART_COLORS.equity}
                maxVal={maxCorpus * 1.05}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Compounding Gap Section ── */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 mb-5">
        <div className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          The compounding gap
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* FD wealth multiplier */}
          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-3.5">
            <div className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">FD wealth multiplier</div>
            <div className="text-xl font-bold font-mono tabular-nums" style={{ color: CHART_COLORS.fd }}>
              {(fd.corpus / fd.invested).toFixed(2)}x
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {fmtFull(fd.invested)} → {fmtFull(fd.corpus)}
            </div>
          </div>
          {/* Equity wealth multiplier */}
          <div className="bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 rounded-xl p-3.5">
            <div className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Equity wealth multiplier</div>
            <div className="text-xl font-bold font-mono tabular-nums" style={{ color: CHART_COLORS.equity }}>
              {(equity.corpus / equity.invested).toFixed(2)}x
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {fmtFull(equity.invested)} → {fmtFull(equity.corpus)}
            </div>
          </div>
          {/* Extra wealth from Equity */}
          <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-3.5">
            <div className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Extra wealth from Equity</div>
            <div
              className="text-xl font-bold font-mono tabular-nums"
              style={{ color: diff >= 0 ? CHART_COLORS.green : CHART_COLORS.red }}
            >
              {fmt(Math.abs(diff))}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {diff >= 0 ? 'Equity earns' : 'FD earns'} {Math.abs(diffPct)}% more
            </div>
          </div>
        </div>
      </div>

      {/* ── Disclaimers ── */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          Important disclaimers
        </div>
        <p className="mb-1.5">
          FD returns use monthly compounding. Actual rates vary by bank and tenure, and interest is subject to TDS.
        </p>
        <p className="mb-1.5">
          Equity returns assume a constant annual return for illustration. Actual equity returns are volatile.
          The 12% default represents Nifty 50's historical CAGR over 15+ year periods.
        </p>
        <p>
          Consider tax treatment (LTCG vs income tax on FD interest), inflation, liquidity needs,
          and personal risk appetite before investing.
        </p>
      </div>
    </div>
  );
};

export default SIPComparisonCalculator;
