/**
 * EMI Calculator Component
 * 
 * Allows users to calculate Equated Monthly Installments (EMI) for loans.
 * 
 * Features:
 * - Inputs for Loan Amount, Interest Rate, and Tenure
 * - Real-time calculation
 * - Visual breakdown of total payment (Principal vs Interest)
 * - Responsive design with dark mode support
 */

import React, { useState, useEffect } from 'react';

const EMICalculator = () => {
    // State for input values
    const [loanAmount, setLoanAmount] = useState(1000000);
    const [interestRate, setInterestRate] = useState(10.5);
    const [tenure, setTenure] = useState(5); // in years

    // State for results
    const [emi, setEmi] = useState(0);
    const [totalInterest, setTotalInterest] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);

    // State for amortization schedule visibility
    const [showSchedule, setShowSchedule] = useState(false);

    // Calculate EMI whenever inputs change
    useEffect(() => {
        calculateEMI();
    }, [loanAmount, interestRate, tenure]);

    /**
     * Calculates the EMI, total interest, and total amount payable
     * Formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
     * where P = Loan Amount, r = Monthly Interest Rate, n = Tenure in months
     */
    const calculateEMI = () => {
        const principal = parseFloat(loanAmount);
        const rate = parseFloat(interestRate) / 12 / 100; // Monthly interest rate
        const time = parseFloat(tenure) * 12; // Tenure in months

        if (principal > 0 && rate > 0 && time > 0) {
            const emiValue = (principal * rate * Math.pow(1 + rate, time)) / (Math.pow(1 + rate, time) - 1);
            const totalAmountValue = emiValue * time;
            const totalInterestValue = totalAmountValue - principal;

            setEmi(Math.round(emiValue));
            setTotalAmount(Math.round(totalAmountValue));
            setTotalInterest(Math.round(totalInterestValue));
        } else {
            setEmi(0);
            setTotalAmount(0);
            setTotalInterest(0);
        }
    };

    // Format currency for display (Indian Rupee)
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    /**
     * Generates the amortization schedule (month-by-month breakdown)
     * Returns an array of objects with:
     * - month: Month number
     * - openingBalance: Balance at start of month
     * - interest: Interest component for the month
     * - principal: Principal component for the month
     * - closingBalance: Balance at end of month
     */
    const generateAmortizationSchedule = () => {
        const principal = parseFloat(loanAmount);
        const monthlyRate = parseFloat(interestRate) / 12 / 100; // Monthly interest rate
        const totalMonths = parseFloat(tenure) * 12; // Tenure in months
        const schedule = [];

        let remainingBalance = principal;

        // Generate schedule for each month
        for (let month = 1; month <= totalMonths; month++) {
            const openingBalance = remainingBalance;
            const interestPayment = openingBalance * monthlyRate;
            const principalPayment = emi - interestPayment;
            const closingBalance = openingBalance - principalPayment;

            schedule.push({
                month: month,
                openingBalance: Math.round(openingBalance),
                interest: Math.round(interestPayment),
                principal: Math.round(principalPayment),
                closingBalance: Math.max(0, Math.round(closingBalance)), // Ensure no negative balance due to rounding
            });

            remainingBalance = closingBalance;
        }

        return schedule;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-6 dark:text-gray-100 border-b pb-2 dark:border-gray-700">
                EMI Calculator
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    {/* Loan Amount Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Loan Amount: {formatCurrency(loanAmount)}
                        </label>
                        <input
                            type="range"
                            min="100000"
                            max="10000000"
                            step="10000"
                            value={loanAmount}
                            onChange={(e) => setLoanAmount(e.target.value)}
                            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                        <div className="mt-2">
                            <input
                                type="number"
                                value={loanAmount}
                                onChange={(e) => setLoanAmount(e.target.value)}
                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Interest Rate Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Interest Rate (%): {interestRate}%
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            step="0.1"
                            value={interestRate}
                            onChange={(e) => setInterestRate(e.target.value)}
                            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                        <div className="mt-2">
                            <input
                                type="number"
                                value={interestRate}
                                onChange={(e) => setInterestRate(e.target.value)}
                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Tenure Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tenure (Years): {tenure} Years
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="30"
                            step="1"
                            value={tenure}
                            onChange={(e) => setTenure(e.target.value)}
                            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                        <div className="mt-2">
                            <input
                                type="number"
                                value={tenure}
                                onChange={(e) => setTenure(e.target.value)}
                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                <div className="flex flex-col justify-center space-y-6 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
                    <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Monthly EMI</p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(emi)}
                        </p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">Principal Amount</span>
                            <span className="font-semibold dark:text-white">{formatCurrency(loanAmount)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">Total Interest</span>
                            <span className="font-semibold text-red-500 dark:text-red-400">
                                {formatCurrency(totalInterest)}
                            </span>
                        </div>
                        <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200 dark:border-gray-600">
                            <span className="text-gray-800 dark:text-white">Total Amount</span>
                            <span className="text-gray-800 dark:text-white">{formatCurrency(totalAmount)}</span>
                        </div>
                    </div>

                    {/* Visual Bar Chart */}
                    <div className="mt-4">
                        <div className="flex h-4 rounded-full overflow-hidden">
                            <div
                                className="bg-blue-500"
                                style={{ width: `${(loanAmount / totalAmount) * 100}%` }}
                                title="Principal"
                            ></div>
                            <div
                                className="bg-red-500"
                                style={{ width: `${(totalInterest / totalAmount) * 100}%` }}
                                title="Interest"
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs mt-2 text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                                Principal ({Math.round((loanAmount / totalAmount) * 100)}%)
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                                Interest ({Math.round((totalInterest / totalAmount) * 100)}%)
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Amortization Schedule Section */}
            <div className="mt-8">
                {/* Toggle Button */}
                <button
                    onClick={() => setShowSchedule(!showSchedule)}
                    className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                    {showSchedule ? (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                            Hide Repayment Schedule
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            Show Repayment Schedule
                        </>
                    )}
                </button>

                {/* Amortization Schedule Table - Only shown when showSchedule is true */}
                {showSchedule && (
                    <div className="mt-6 overflow-x-auto animate-fadeIn">
                        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                <strong>Repayment Schedule:</strong> This table shows the month-by-month breakdown of your loan repayment, including how much goes towards interest and principal each month.
                            </p>
                        </div>

                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Month
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Opening Balance
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Interest
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Principal
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Closing Balance
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {generateAmortizationSchedule().map((row, index) => (
                                        <tr
                                            key={row.month}
                                            className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}
                                        >
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium">
                                                {row.month}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-right">
                                                {formatCurrency(row.openingBalance)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 dark:text-red-400 text-right font-medium">
                                                {formatCurrency(row.interest)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400 text-right font-medium">
                                                {formatCurrency(row.principal)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-right">
                                                {formatCurrency(row.closingBalance)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary below table */}
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Months</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {tenure * 12} months
                                </p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Interest Paid</p>
                                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                                    {formatCurrency(totalInterest)}
                                </p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Principal Paid</p>
                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {formatCurrency(loanAmount)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EMICalculator;
