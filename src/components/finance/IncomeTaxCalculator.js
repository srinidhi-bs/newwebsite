/**
 * Income Tax Calculator Component
 *
 * Estimates income tax liability based on FY 2025-26 tax slabs (Budget 2025).
 * Supports both Old and New Tax Regimes.
 * Generates a downloadable PDF comparison report of both regimes.
 *
 * Features:
 * - Input for Annual Income
 * - Toggle between Old and New Regime
 * - Breakdown of tax calculation
 * - Standard Deduction handling
 * - PDF download with side-by-side regime comparison
 */

import React, { useState, useEffect, useMemo } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/**
 * Computes base income tax from slab rates for a given taxable income.
 * Used internally by the surcharge marginal relief calculation to determine
 * what the tax would be at a specific threshold income.
 *
 * @param {Array} slabs - Tax slab definitions with { limit, rate } properties
 * @param {number} taxableIncome - The taxable income to compute tax for
 * @returns {number} Base tax amount (before surcharge and cess)
 */
const computeBaseTaxFromSlabs = (slabs, taxableIncome) => {
    let tax = 0;
    let remaining = taxableIncome;
    for (const slab of slabs) {
        if (remaining <= 0) break;
        const taxable = slab.limit === Infinity ? remaining : Math.min(remaining, slab.limit);
        tax += taxable * slab.rate;
        remaining -= taxable;
    }
    return tax;
};

/**
 * Computes surcharge on income tax with marginal relief (AY 2026-27).
 *
 * Surcharge rates for Individuals:
 * - Up to 50L:    No surcharge
 * - 50L - 1Cr:    10% of income tax
 * - 1Cr - 2Cr:    15% of income tax
 * - 2Cr - 5Cr:    25% of income tax
 * - Above 5Cr:    37% (Old Regime) / 25% max (New Regime, capped)
 *
 * Marginal Relief: Ensures that (tax + surcharge) at the higher rate doesn't
 * exceed (tax + surcharge at threshold) + (excess income over threshold).
 * This prevents a situation where earning Rs 1 more pushes you into a surcharge
 * bracket and increases your total tax by more than that Rs 1.
 *
 * @param {string} regime - 'new' or 'old'
 * @param {number} taxableIncome - Net taxable income (after deductions)
 * @param {number} baseTax - Income tax before surcharge/cess
 * @param {Array} slabs - Tax slab definitions (needed for marginal relief calculations)
 * @returns {{ surcharge: number, marginalRelief: number, surchargeRate: number }}
 */
const computeSurchargeWithRelief = (regime, taxableIncome, baseTax, slabs) => {
    // No surcharge if income is 50L or below, or if there's no tax (rebate applied)
    if (taxableIncome <= 5000000 || baseTax === 0) {
        return { surcharge: 0, marginalRelief: 0, surchargeRate: 0 };
    }

    // Determine the applicable surcharge rate and the threshold that was crossed
    // Each bracket: [threshold, surchargeRate, rateJustBelowThreshold]
    let surchargeRate = 0;
    let crossedThreshold = 0;
    let prevRate = 0; // Surcharge rate applicable just below the crossed threshold

    if (taxableIncome > 50000000 && regime === 'old') {
        // Old Regime: Above 5 Crore → 37%
        surchargeRate = 0.37;
        crossedThreshold = 50000000;
        prevRate = 0.25; // Rate at 2Cr-5Cr bracket
    } else if (taxableIncome > 20000000) {
        // Both Regimes: 2 Crore - 5 Crore → 25%
        // (New Regime: also 25% above 5Cr since max surcharge is capped at 25%)
        surchargeRate = 0.25;
        crossedThreshold = 20000000;
        prevRate = 0.15; // Rate at 1Cr-2Cr bracket
    } else if (taxableIncome > 10000000) {
        // Both Regimes: 1 Crore - 2 Crore → 15%
        surchargeRate = 0.15;
        crossedThreshold = 10000000;
        prevRate = 0.10; // Rate at 50L-1Cr bracket
    } else {
        // Both Regimes: 50 Lakh - 1 Crore → 10%
        surchargeRate = 0.10;
        crossedThreshold = 5000000;
        prevRate = 0; // No surcharge below 50L
    }

    // Calculate raw surcharge
    let surcharge = baseTax * surchargeRate;

    // --- Marginal Relief Calculation ---
    // Compare: (tax + surcharge at actual income) vs (tax + surcharge at threshold) + excess
    // If the jump in tax exceeds the excess income, reduce surcharge by the difference
    const excessIncome = taxableIncome - crossedThreshold;
    const taxAtThreshold = computeBaseTaxFromSlabs(slabs, crossedThreshold);
    const surchargeAtThreshold = taxAtThreshold * prevRate;

    const taxPlusSurchargeAtActual = baseTax + surcharge;
    const taxPlusSurchargeAtThreshold = taxAtThreshold + surchargeAtThreshold;
    const increase = taxPlusSurchargeAtActual - taxPlusSurchargeAtThreshold;

    let marginalRelief = 0;
    if (increase > excessIncome) {
        marginalRelief = increase - excessIncome;
        surcharge = Math.max(0, surcharge - marginalRelief);
    }

    return { surcharge, marginalRelief, surchargeRate };
};

/**
 * Configuration for individual deduction sections under the Old Tax Regime.
 * Each section defines its statutory limit (max), slider step, default value,
 * and a brief description of what qualifies under that section.
 *
 * For sections with no statutory limit (80E, 80G), `max` is null and
 * `sliderMax` provides a practical upper bound for the slider control.
 * The number input remains uncapped for these sections.
 */
const DEDUCTION_SECTIONS = [
    {
        key: 'sec80C',
        label: 'Section 80C',
        description: 'EPF, PPF, ELSS, LIC, NSC, Tax-saving FD, Home Loan Principal, Tuition Fees, SSY, SCSS',
        max: 150000,       // Statutory limit: Rs. 1,50,000
        step: 5000,
        defaultValue: 150000,
    },
    {
        key: 'sec80CCD1B',
        label: 'Section 80CCD(1B)',
        description: 'Additional NPS contributions (over and above Section 80C limit)',
        max: 50000,        // Statutory limit: Rs. 50,000
        step: 5000,
        defaultValue: 0,
    },
    {
        key: 'sec80D',
        label: 'Section 80D',
        description: 'Health insurance premium (self/family + parents). Up to Rs.1,00,000 if both are senior citizens.',
        max: 100000,       // Max Rs. 1,00,000 (25K self + 25K parents; higher for seniors)
        step: 5000,
        defaultValue: 25000,
    },
    {
        key: 'sec80E',
        label: 'Section 80E',
        description: 'Education loan interest (no upper limit)',
        max: null,         // No statutory limit
        sliderMax: 500000, // Practical slider bound; number input is uncapped
        step: 10000,
        defaultValue: 0,
    },
    {
        key: 'sec80G',
        label: 'Section 80G',
        description: 'Charitable donations (enter the eligible deduction amount)',
        max: null,         // No statutory limit
        sliderMax: 500000, // Practical slider bound; number input is uncapped
        step: 10000,
        defaultValue: 0,
    },
    {
        key: 'sec80TTA',
        label: 'Section 80TTA/80TTB',
        description: 'Savings account interest. 80TTA: Rs.10,000 (below 60 yrs), 80TTB: Rs.50,000 (seniors)',
        max: 50000,        // Max Rs. 50,000 (80TTB for senior citizens)
        step: 1000,
        defaultValue: 0,
    },
];

/**
 * Pure function to compute tax for a given regime.
 * Extracted so both the UI and PDF generator can reuse the same logic.
 *
 * @param {string} regime - 'new' or 'old'
 * @param {number} grossIncome - Annual gross income
 * @param {number} oldRegimeDeductions - Deductions under 80C/80D etc. (only used for old regime)
 * @returns {{ tax: number, surcharge: number, surchargeRate: number, marginalRelief: number, cess: number, totalTax: number, breakdown: Array, taxableIncome: number, standardDeduction: number, rebateApplied: boolean }}
 */
const computeTaxForRegime = (regime, grossIncome, oldRegimeDeductions) => {
    let tax = 0;
    let breakdown = [];
    let taxableIncome = 0;
    let standardDeduction = 0;
    let rebateApplied = false;
    let slabs = []; // Slab definitions — shared with surcharge for marginal relief

    if (regime === 'new') {
        // New Regime (FY 2025-26) - Budget 2025
        // Standard Deduction: 75,000
        standardDeduction = 75000;
        taxableIncome = Math.max(0, grossIncome - standardDeduction);
        let remainingIncome = taxableIncome;

        // Tax Slabs for New Regime (FY 2025-26)
        slabs = [
            { limit: 400000, rate: 0, label: "0 - 4L" },
            { limit: 400000, rate: 0.05, label: "4L - 8L" },
            { limit: 400000, rate: 0.10, label: "8L - 12L" },
            { limit: 400000, rate: 0.15, label: "12L - 16L" },
            { limit: 400000, rate: 0.20, label: "16L - 20L" },
            { limit: 400000, rate: 0.25, label: "20L - 24L" },
            { limit: Infinity, rate: 0.30, label: "Above 24L" }
        ];

        for (let slab of slabs) {
            if (remainingIncome <= 0) break;

            let taxableAmountInSlab = 0;
            if (slab.limit === Infinity) {
                taxableAmountInSlab = remainingIncome;
            } else {
                taxableAmountInSlab = Math.min(remainingIncome, slab.limit);
            }

            const taxForSlab = taxableAmountInSlab * slab.rate;

            if (taxableAmountInSlab > 0) {
                breakdown.push({
                    label: slab.label,
                    rate: `${slab.rate * 100}%`,
                    amount: taxableAmountInSlab,
                    tax: taxForSlab
                });
            }

            tax += taxForSlab;
            remainingIncome -= taxableAmountInSlab;
        }

        // Rebate u/s 87A for New Regime: Taxable income up to 12L is tax-free
        if (taxableIncome <= 1200000) {
            tax = 0;
            rebateApplied = true;
            breakdown = [{ label: "Rebate u/s 87A applied", rate: "0%", amount: taxableIncome, tax: 0 }];
        }

    } else {
        // Old Regime
        // Standard Deduction: 50,000
        standardDeduction = 50000;
        taxableIncome = Math.max(0, grossIncome - standardDeduction - oldRegimeDeductions);
        let remainingIncome = taxableIncome;

        // Tax Slabs for Old Regime (General Citizen < 60 years)
        slabs = [
            { limit: 250000, rate: 0, label: "0 - 2.5L" },
            { limit: 250000, rate: 0.05, label: "2.5L - 5L" },
            { limit: 500000, rate: 0.20, label: "5L - 10L" },
            { limit: Infinity, rate: 0.30, label: "Above 10L" }
        ];

        for (let slab of slabs) {
            if (remainingIncome <= 0) break;

            let taxableAmountInSlab = 0;
            if (slab.limit === Infinity) {
                taxableAmountInSlab = remainingIncome;
            } else {
                taxableAmountInSlab = Math.min(remainingIncome, slab.limit);
            }

            const taxForSlab = taxableAmountInSlab * slab.rate;

            if (taxableAmountInSlab > 0) {
                breakdown.push({
                    label: slab.label,
                    rate: `${slab.rate * 100}%`,
                    amount: taxableAmountInSlab,
                    tax: taxForSlab
                });
            }

            tax += taxForSlab;
            remainingIncome -= taxableAmountInSlab;
        }

        // Rebate u/s 87A for Old Regime: Taxable income up to 5L is tax-free
        if (taxableIncome <= 500000) {
            tax = 0;
            rebateApplied = true;
            breakdown = [{ label: "Rebate u/s 87A applied", rate: "0%", amount: taxableIncome, tax: 0 }];
        }
    }

    // Compute surcharge with marginal relief (applicable for income > 50L)
    const surchargeResult = computeSurchargeWithRelief(regime, taxableIncome, tax, slabs);
    const surcharge = surchargeResult.surcharge;
    const marginalRelief = surchargeResult.marginalRelief;
    const surchargeRate = surchargeResult.surchargeRate;

    // 4% Health & Education Cess on (Income Tax + Surcharge)
    // Note: Cess is always calculated on the combined amount, not just base tax
    const cess = (tax + surcharge) * 0.04;

    return {
        tax: Math.round(tax),
        surcharge: Math.round(surcharge),
        surchargeRate,
        marginalRelief: Math.round(marginalRelief),
        cess: Math.round(cess),
        totalTax: Math.round(tax + surcharge + cess),
        breakdown,
        taxableIncome,
        standardDeduction,
        rebateApplied
    };
};

const IncomeTaxCalculator = () => {
    // State for inputs
    const [income, setIncome] = useState(1200000);
    const [regime, setRegime] = useState('new'); // 'old' or 'new'
    // Individual deduction states for Old Regime (each section tracked separately)
    // Initialized from DEDUCTION_SECTIONS config defaults
    const [deductions, setDeductions] = useState(() => {
        const defaults = {};
        DEDUCTION_SECTIONS.forEach(section => {
            defaults[section.key] = section.defaultValue;
        });
        return defaults;
    });

    // State for results
    const [taxPayable, setTaxPayable] = useState(0);
    const [surcharge, setSurcharge] = useState(0);
    const [surchargeRate, setSurchargeRate] = useState(0);
    const [marginalRelief, setMarginalRelief] = useState(0);
    const [cess, setCess] = useState(0);
    const [totalTax, setTotalTax] = useState(0);
    const [taxBreakdown, setTaxBreakdown] = useState([]);

    /**
     * Computes the sum of all individual deduction values.
     * Recalculates only when the deductions object changes.
     * This single number is passed to computeTaxForRegime (unchanged signature).
     */
    const totalDeductions = useMemo(
        () => Object.values(deductions).reduce((sum, val) => sum + val, 0),
        [deductions]
    );

    /**
     * Updates a single deduction field with auto-capping.
     * - Clamps to the section's statutory max (if one exists)
     * - Clamps negative values to 0
     * - Handles NaN from empty input fields (defaults to 0)
     *
     * @param {string} key - The deduction section key (e.g., 'sec80C')
     * @param {string|number} value - The new value from the input
     */
    const updateDeduction = (key, value) => {
        const section = DEDUCTION_SECTIONS.find(s => s.key === key);
        let numericValue = parseFloat(value) || 0;

        // Auto-cap: clamp to statutory maximum if one exists
        if (section.max !== null && numericValue > section.max) {
            numericValue = section.max;
        }

        // Prevent negative values
        if (numericValue < 0) {
            numericValue = 0;
        }

        setDeductions(prev => ({ ...prev, [key]: numericValue }));
    };

    /**
     * Calculates tax based on selected regime and income.
     * Delegates to the pure computeTaxForRegime helper.
     * Uses totalDeductions (sum of all individual sections) as the deductions argument.
     */
    const calculateTax = React.useCallback(() => {
        const result = computeTaxForRegime(regime, parseFloat(income), totalDeductions);

        setTaxPayable(result.tax);
        setSurcharge(result.surcharge);
        setSurchargeRate(result.surchargeRate);
        setMarginalRelief(result.marginalRelief);
        setCess(result.cess);
        setTotalTax(result.totalTax);
        setTaxBreakdown(result.breakdown);
    }, [income, regime, totalDeductions]);

    // Calculate tax whenever inputs change
    useEffect(() => {
        calculateTax();
    }, [calculateTax]);

    // Format currency (uses ₹ symbol for UI display)
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Format currency for PDF (uses "Rs." because pdf-lib standard fonts don't support the ₹ symbol)
    const formatCurrencyPDF = (amount) => {
        const formatted = new Intl.NumberFormat('en-IN', {
            maximumFractionDigits: 0,
        }).format(amount);
        return `Rs. ${formatted}`;
    };

    /**
     * Generates and downloads a PDF comparing tax under both regimes.
     * Uses pdf-lib to draw text, lines, and tables on an A4 page.
     */
    const generatePDF = async () => {
        // Compute tax for both regimes using the shared helper
        const grossIncome = parseFloat(income);
        // Use totalDeductions (sum of all individual sections) for tax computation
        const oldDeductions = totalDeductions;
        const newResult = computeTaxForRegime('new', grossIncome, oldDeductions);
        const oldResult = computeTaxForRegime('old', grossIncome, oldDeductions);

        // Create a new PDF document (A4 size)
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // A4 dimensions in points (595.28 x 841.89)
        const pageWidth = 595.28;
        const pageHeight = 841.89;
        const margin = 50;
        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Colors
        const black = rgb(0, 0, 0);
        const gray = rgb(0.4, 0.4, 0.4);
        const darkBlue = rgb(0.1, 0.2, 0.5);
        const green = rgb(0.1, 0.5, 0.2);
        const lineGray = rgb(0.75, 0.75, 0.75);

        // Track vertical position (top-down, PDF coordinates are bottom-up)
        let y = pageHeight - margin;

        // --- Helper: draw text and move cursor down ---
        const drawText = (text, options = {}) => {
            const {
                size = 10,
                useBold = false,
                color = black,
                x = margin,
                moveDown = true
            } = options;
            page.drawText(text, {
                x,
                y,
                size,
                font: useBold ? fontBold : font,
                color,
            });
            if (moveDown) y -= size + 8;
        };

        // --- Helper: draw a horizontal line ---
        const drawLine = (thickness = 0.5, color = lineGray) => {
            page.drawLine({
                start: { x: margin, y },
                end: { x: pageWidth - margin, y },
                thickness,
                color,
            });
            y -= 18;
        };

        // --- Helper: draw a row with left-aligned label and right-aligned value ---
        const drawRow = (label, value, options = {}) => {
            const { size = 10, useBold = false, color = black } = options;
            const selectedFont = useBold ? fontBold : font;
            page.drawText(label, { x: margin + 10, y, size, font: selectedFont, color });
            const valueWidth = selectedFont.widthOfTextAtSize(value, size);
            page.drawText(value, { x: pageWidth - margin - valueWidth, y, size, font: selectedFont, color });
            y -= size + 7;
        };

        // --- Helper: draw slab breakdown table for a regime ---
        const drawSlabTable = (result) => {
            // Table header
            const colSlab = margin + 10;
            const colRate = margin + 200;
            const colTax = pageWidth - margin;

            page.drawText("Slab", { x: colSlab, y, size: 9, font: fontBold, color: gray });
            page.drawText("Rate", { x: colRate, y, size: 9, font: fontBold, color: gray });
            const taxHeaderWidth = fontBold.widthOfTextAtSize("Tax", 9);
            page.drawText("Tax", { x: colTax - taxHeaderWidth, y, size: 9, font: fontBold, color: gray });
            y -= 16;

            // Table rows
            for (const item of result.breakdown) {
                page.drawText(item.label, { x: colSlab, y, size: 9, font, color: black });
                page.drawText(item.rate, { x: colRate, y, size: 9, font, color: black });
                const taxVal = formatCurrencyPDF(item.tax);
                const taxWidth = font.widthOfTextAtSize(taxVal, 9);
                page.drawText(taxVal, { x: colTax - taxWidth, y, size: 9, font, color: black });
                y -= 15;
            }

            // Total row
            y -= 4;
            page.drawLine({ start: { x: margin + 10, y: y + 8 }, end: { x: pageWidth - margin, y: y + 8 }, thickness: 0.5, color: lineGray });
            page.drawText("Base Tax", { x: colSlab, y, size: 9, font: fontBold, color: black });
            const baseTaxVal = formatCurrencyPDF(result.tax);
            const baseTaxWidth = fontBold.widthOfTextAtSize(baseTaxVal, 9);
            page.drawText(baseTaxVal, { x: colTax - baseTaxWidth, y, size: 9, font: fontBold, color: black });
            y -= 15;

            // Surcharge row (only if applicable)
            if (result.surcharge > 0) {
                const surchargeLabel = `Surcharge (${(result.surchargeRate * 100)}%)`;
                page.drawText(surchargeLabel, { x: colSlab, y, size: 9, font, color: gray });
                const surchargeVal = formatCurrencyPDF(result.surcharge);
                const surchargeWidth = font.widthOfTextAtSize(surchargeVal, 9);
                page.drawText(surchargeVal, { x: colTax - surchargeWidth, y, size: 9, font, color: gray });
                y -= 15;
            }

            // Marginal Relief row (only if applicable)
            if (result.marginalRelief > 0) {
                page.drawText("Marginal Relief", { x: colSlab, y, size: 9, font, color: green });
                const reliefVal = `-${formatCurrencyPDF(result.marginalRelief)}`;
                const reliefWidth = font.widthOfTextAtSize(reliefVal, 9);
                page.drawText(reliefVal, { x: colTax - reliefWidth, y, size: 9, font, color: green });
                y -= 15;
            }

            // Cess row
            const cessLabel = result.surcharge > 0 ? "Health & Education Cess (4% of Tax + Surcharge)" : "Health & Education Cess (4%)";
            page.drawText(cessLabel, { x: colSlab, y, size: 9, font, color: gray });
            const cessVal = formatCurrencyPDF(result.cess);
            const cessWidth = font.widthOfTextAtSize(cessVal, 9);
            page.drawText(cessVal, { x: colTax - cessWidth, y, size: 9, font, color: gray });
            y -= 15;

            // Total tax row
            page.drawText("Total Tax Payable", { x: colSlab, y, size: 10, font: fontBold, color: darkBlue });
            const totalVal = formatCurrencyPDF(result.totalTax);
            const totalWidth = fontBold.widthOfTextAtSize(totalVal, 10);
            page.drawText(totalVal, { x: colTax - totalWidth, y, size: 10, font: fontBold, color: darkBlue });
            y -= 18;
        };

        // ==================== PDF CONTENT ====================

        // --- Title ---
        drawText("Income Tax Comparison Report", { size: 18, useBold: true, color: darkBlue });
        drawText("Financial Year 2025-26 (Assessment Year 2026-27)", { size: 10, color: gray });
        y -= 4;
        drawLine(1, darkBlue);

        // --- Input Summary with individual deduction breakdown ---
        drawText("Input Summary", { size: 12, useBold: true });
        drawRow("Gross Annual Income", formatCurrencyPDF(grossIncome));
        // Show non-zero individual deductions
        for (const section of DEDUCTION_SECTIONS) {
            const value = deductions[section.key];
            if (value > 0) {
                drawRow(`  ${section.label}`, formatCurrencyPDF(value), { color: gray });
            }
        }
        drawRow("Total Deductions", formatCurrencyPDF(oldDeductions), { useBold: true, color: green });
        y -= 4;
        drawLine();

        // --- New Regime Section ---
        drawText("New Tax Regime", { size: 13, useBold: true, color: darkBlue });
        drawRow("Standard Deduction", formatCurrencyPDF(newResult.standardDeduction), { color: green });
        drawRow("Taxable Income", formatCurrencyPDF(newResult.taxableIncome));
        if (newResult.rebateApplied) {
            drawRow("Rebate u/s 87A", "Eligible (income <= 12L)", { color: green });
        }
        y -= 4;
        drawSlabTable(newResult);
        drawLine();

        // --- Old Regime Section ---
        drawText("Old Tax Regime", { size: 13, useBold: true, color: darkBlue });
        drawRow("Standard Deduction", formatCurrencyPDF(oldResult.standardDeduction), { color: green });
        drawRow("Total Deductions (80C, 80D, etc.)", formatCurrencyPDF(oldDeductions), { color: green });
        drawRow("Taxable Income", formatCurrencyPDF(oldResult.taxableIncome));
        if (oldResult.rebateApplied) {
            drawRow("Rebate u/s 87A", "Eligible (income <= 5L)", { color: green });
        }
        y -= 4;
        drawSlabTable(oldResult);
        drawLine(1, darkBlue);

        // --- Comparison Summary ---
        drawText("Comparison Summary", { size: 13, useBold: true, color: darkBlue });
        y -= 4;
        drawRow("New Regime Total Tax", formatCurrencyPDF(newResult.totalTax), { useBold: true });
        drawRow("Old Regime Total Tax", formatCurrencyPDF(oldResult.totalTax), { useBold: true });
        y -= 4;

        // Determine which regime is better
        const savings = Math.abs(newResult.totalTax - oldResult.totalTax);
        if (newResult.totalTax < oldResult.totalTax) {
            drawText(`New Regime saves you ${formatCurrencyPDF(savings)} compared to Old Regime.`, { size: 11, useBold: true, color: green });
            drawText("Recommendation: New Tax Regime is better for you.", { size: 11, useBold: true, color: darkBlue });
        } else if (oldResult.totalTax < newResult.totalTax) {
            drawText(`Old Regime saves you ${formatCurrencyPDF(savings)} compared to New Regime.`, { size: 11, useBold: true, color: green });
            drawText("Recommendation: Old Tax Regime is better for you.", { size: 11, useBold: true, color: darkBlue });
        } else {
            drawText("Both regimes result in the same tax liability.", { size: 11, useBold: true, color: darkBlue });
        }

        // --- Footer disclaimer ---
        y -= 16;
        drawLine();
        drawText("Disclaimer: This is an estimate based on FY 2025-26 tax slabs. Includes surcharge with marginal", { size: 8, color: gray });
        drawText("relief for income above Rs. 50 Lakhs. Actual tax may vary based on exemptions and deduction rules.", { size: 8, color: gray });
        drawText(`Generated on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} from srinidhibs.com`, { size: 8, color: gray });

        // --- Save and download ---
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Income_Tax_Comparison_FY2025-26.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-6 dark:text-gray-100 border-b pb-2 dark:border-gray-700">
                Income Tax Calculator (FY 2025-26)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    {/* Regime Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tax Regime
                        </label>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setRegime('new')}
                                className={`flex-1 py-2 px-4 rounded-md transition-colors ${regime === 'new'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                New Regime
                            </button>
                            <button
                                onClick={() => setRegime('old')}
                                className={`flex-1 py-2 px-4 rounded-md transition-colors ${regime === 'old'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                Old Regime
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {regime === 'new'
                                ? 'New Regime (FY 25-26) offers lower tax rates and higher limits. Default option.'
                                : 'Old Regime allows claiming deductions like 80C, 80D, HRA, etc.'}
                        </p>
                    </div>

                    {/* Annual Income Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Annual Income: {formatCurrency(income)}
                        </label>
                        <input
                            type="range"
                            min="300000"
                            max="50000000"
                            step="100000"
                            value={income}
                            onChange={(e) => setIncome(e.target.value)}
                            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                        <div className="mt-2">
                            <input
                                type="number"
                                value={income}
                                onChange={(e) => setIncome(e.target.value)}
                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Deductions Input — Individual Sections (Only for Old Regime) */}
                    {regime === 'old' && (
                        <div className="animate-fade-in space-y-4">
                            {/* Section header */}
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-1 dark:border-gray-600">
                                Deductions (Chapter VI-A)
                            </h4>

                            {/* Render each deduction section from the config array */}
                            {DEDUCTION_SECTIONS.map((section) => (
                                <div key={section.key}>
                                    {/* Label: section name, current value, and max indicator */}
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {section.label}: {formatCurrency(deductions[section.key])}
                                        {section.max && (
                                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                                                (max {formatCurrency(section.max)})
                                            </span>
                                        )}
                                    </label>
                                    {/* Brief description of eligible items */}
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                                        {section.description}
                                    </p>
                                    {/* Slider — max is statutory limit or practical sliderMax */}
                                    <input
                                        type="range"
                                        min="0"
                                        max={section.max || section.sliderMax}
                                        step={section.step}
                                        value={Math.min(deductions[section.key], section.max || section.sliderMax)}
                                        onChange={(e) => updateDeduction(section.key, e.target.value)}
                                        className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                    />
                                    {/* Number input — uncapped for no-limit sections */}
                                    <div className="mt-1">
                                        <input
                                            type="number"
                                            min="0"
                                            max={section.max || undefined}
                                            value={deductions[section.key]}
                                            onChange={(e) => updateDeduction(section.key, e.target.value)}
                                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            ))}

                            {/* Total Deductions summary — auto-computed from all sections */}
                            <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Total Deductions
                                    </span>
                                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                        {formatCurrency(totalDeductions)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Section */}
                {/* md:self-start prevents stretching to match left column height */}
                {/* md:sticky + md:top-4 keeps results visible while scrolling through deductions */}
                <div className="flex flex-col justify-center space-y-6 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl md:self-start md:sticky md:top-4">
                    <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Tax Payable</p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(totalTax)}
                        </p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                        {/* Income summary: Gross → Deductions → Taxable */}
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">Gross Income</span>
                            <span className="font-semibold dark:text-white">{formatCurrency(income)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                            <span>Standard Deduction</span>
                            <span>-{formatCurrency(regime === 'new' ? 75000 : 50000)}</span>
                        </div>
                        {/* Old regime deductions total — only shown when applicable */}
                        {regime === 'old' && totalDeductions > 0 && (
                            <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                                <span>Deductions (80C, 80D, etc.)</span>
                                <span>-{formatCurrency(totalDeductions)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm font-semibold border-b border-gray-200 dark:border-gray-600 pb-3">
                            <span className="text-gray-700 dark:text-gray-200">Taxable Income</span>
                            <span className="dark:text-white">{formatCurrency(Math.max(0, parseFloat(income) - (regime === 'new' ? 75000 : 50000) - (regime === 'old' ? totalDeductions : 0)))}</span>
                        </div>

                        {/* Tax computation: Base Tax → Surcharge → Cess */}
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">Base Tax</span>
                            <span className="font-semibold dark:text-white">{formatCurrency(taxPayable)}</span>
                        </div>
                        {/* Surcharge row — only shown when applicable (income > 50L) */}
                        {surcharge > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-300">
                                    Surcharge ({(surchargeRate * 100)}%)
                                </span>
                                <span className="font-semibold dark:text-white">{formatCurrency(surcharge)}</span>
                            </div>
                        )}
                        {/* Marginal Relief — shown when surcharge is reduced to prevent unfair burden */}
                        {marginalRelief > 0 && (
                            <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                                <span>Marginal Relief</span>
                                <span>-{formatCurrency(marginalRelief)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">
                                Health & Education Cess (4%{surcharge > 0 ? ' of Tax + Surcharge' : ''})
                            </span>
                            <span className="font-semibold dark:text-white">{formatCurrency(cess)}</span>
                        </div>
                    </div>

                    {/* Tax Breakdown Table */}
                    {taxPayable > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <h4 className="text-sm font-semibold mb-2 dark:text-gray-200">Tax Calculation Breakdown</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                    <thead className="text-gray-500 dark:text-gray-400 border-b dark:border-gray-600">
                                        <tr>
                                            <th className="pb-1">Slab</th>
                                            <th className="pb-1">Rate</th>
                                            <th className="pb-1 text-right">Tax</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-700 dark:text-gray-300">
                                        {taxBreakdown.map((item, index) => (
                                            <tr key={index} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                                                <td className="py-1">{item.label}</td>
                                                <td className="py-1">{item.rate}</td>
                                                <td className="py-1 text-right">{formatCurrency(item.tax)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-2 pt-2 border-t-2 border-gray-300 dark:border-gray-500 flex justify-between text-sm font-bold text-gray-900 dark:text-gray-100">
                                <span>Total</span>
                                <span>{formatCurrency(taxBreakdown.reduce((sum, item) => sum + item.tax, 0))}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-300 text-center">
                    <strong>Note:</strong> This is an estimate based on FY 2025-26 tax slabs. Includes surcharge with marginal relief for income above ₹50 Lakhs. Actual tax liability may vary based on specific exemptions and complex deduction rules.
                </p>
            </div>

            {/* Download PDF Comparison Button */}
            <div className="mt-4 text-center">
                <button
                    onClick={generatePDF}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
                >
                    {/* Download icon (SVG) */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3" />
                    </svg>
                    Download Comparison Report (PDF)
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Compares both Old &amp; New regimes side by side
                </p>
            </div>
        </div>
    );
};

export default IncomeTaxCalculator;

