/**
 * Income Tax Calculator Component
 * 
 * Estimates income tax liability based on FY 2025-26 tax slabs (Budget 2025).
 * Supports both Old and New Tax Regimes.
 * 
 * Features:
 * - Input for Annual Income
 * - Toggle between Old and New Regime
 * - Breakdown of tax calculation
 * - Standard Deduction handling
 */

import React, { useState, useEffect } from 'react';

const IncomeTaxCalculator = () => {
    // State for inputs
    const [income, setIncome] = useState(1200000);
    const [regime, setRegime] = useState('new'); // 'old' or 'new'
    const [deductions, setDeductions] = useState(150000); // Only for Old Regime (80C, etc.)

    // State for results
    const [taxPayable, setTaxPayable] = useState(0);
    const [cess, setCess] = useState(0);
    const [totalTax, setTotalTax] = useState(0);
    const [taxBreakdown, setTaxBreakdown] = useState([]);

    /**
     * Calculates tax based on selected regime and income
     * Uses FY 2025-26 (AY 2026-27) slabs
     */
    const calculateTax = React.useCallback(() => {
        let taxableIncome = parseFloat(income);
        let tax = 0;
        let breakdown = [];

        if (regime === 'new') {
            // New Regime (FY 2025-26) - Budget 2025
            // Standard Deduction: 75,000
            const standardDeduction = 75000;
            let incomeAfterSD = Math.max(0, taxableIncome - standardDeduction);
            let remainingIncome = incomeAfterSD;

            // Tax Slabs for New Regime (FY 2025-26)
            const slabs = [
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
            // Note: The rebate limit applies to taxable income AFTER standard deduction
            if (incomeAfterSD <= 1200000) {
                tax = 0;
                breakdown = [{ label: "Rebate u/s 87A applied", rate: "0%", amount: incomeAfterSD, tax: 0 }];
            }

        } else {
            // Old Regime (Unchanged)
            // Standard Deduction: 50,000
            const standardDeduction = 50000;
            taxableIncome = Math.max(0, taxableIncome - standardDeduction - parseFloat(deductions));

            // Tax Slabs for Old Regime (General Citizen < 60 years)
            // 0 - 2.5L: Nil
            // 2.5L - 5L: 5%
            // 5L - 10L: 20%
            // Above 10L: 30%

            if (taxableIncome <= 250000) {
                tax = 0;
            } else if (taxableIncome <= 500000) {
                tax = (taxableIncome - 250000) * 0.05;
            } else if (taxableIncome <= 1000000) {
                tax = (250000 * 0.05) + (taxableIncome - 500000) * 0.20;
            } else {
                tax = (250000 * 0.05) + (500000 * 0.20) + (taxableIncome - 1000000) * 0.30;
            }

            // Rebate u/s 87A for Old Regime: Taxable income up to 5L is tax-free
            if (taxableIncome <= 500000) {
                tax = 0;
            }
        }

        const cessValue = tax * 0.04; // 4% Health & Education Cess

        setTaxPayable(Math.round(tax));
        setCess(Math.round(cessValue));
        setTotalTax(Math.round(tax + cessValue));
        setTaxBreakdown(breakdown);
    }, [income, regime, deductions]);

    // Calculate tax whenever inputs change
    useEffect(() => {
        calculateTax();
    }, [calculateTax]);

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
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
                            max="5000000"
                            step="50000"
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

                    {/* Deductions Input (Only for Old Regime) */}
                    {regime === 'old' && (
                        <div className="animate-fadeIn">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Total Deductions (80C, 80D, etc.): {formatCurrency(deductions)}
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="500000"
                                step="5000"
                                value={deductions}
                                onChange={(e) => setDeductions(e.target.value)}
                                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            />
                            <div className="mt-2">
                                <input
                                    type="number"
                                    value={deductions}
                                    onChange={(e) => setDeductions(e.target.value)}
                                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Section */}
                <div className="flex flex-col justify-center space-y-6 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
                    <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Tax Payable</p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(totalTax)}
                        </p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">Base Tax</span>
                            <span className="font-semibold dark:text-white">{formatCurrency(taxPayable)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">Health & Education Cess (4%)</span>
                            <span className="font-semibold dark:text-white">{formatCurrency(cess)}</span>
                        </div>

                        {regime === 'new' ? (
                            <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                                <span>Standard Deduction Applied</span>
                                <span>{formatCurrency(75000)}</span>
                            </div>
                        ) : (
                            <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                                <span>Standard Deduction Applied</span>
                                <span>{formatCurrency(50000)}</span>
                            </div>
                        )}
                    </div>

                    {/* Tax Breakdown Table (New Regime Only) */}
                    {regime === 'new' && taxPayable > 0 && (
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
                    <strong>Note:</strong> This is an estimate based on FY 2025-26 tax slabs. Actual tax liability may vary based on specific surcharges and complex deduction rules.
                </p>
            </div>
        </div>
    );
};

export default IncomeTaxCalculator;

