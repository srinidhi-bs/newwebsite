/**
 * HRA Calculator Component
 * 
 * Calculates House Rent Allowance (HRA) exemption for income tax purposes.
 * 
 * Rules:
 * Minimum of the following is exempt:
 * 1. Actual HRA received
 * 2. 50% of Basic Salary (Metro) or 40% (Non-Metro)
 * 3. Rent paid minus 10% of Basic Salary
 * 
 * Features:
 * - Inputs for Basic Salary, DA, HRA, Rent, and City Type
 * - Real-time calculation
 * - Breakdown of exempt vs taxable HRA
 */

import React, { useState, useEffect } from 'react';

const HRACalculator = () => {
    // State for inputs
    const [basicSalary, setBasicSalary] = useState(500000); // Annual
    const [da, setDa] = useState(0); // Dearness Allowance (Annual)
    const [hraReceived, setHraReceived] = useState(200000); // Annual
    const [rentPaid, setRentPaid] = useState(240000); // Annual
    const [isMetro, setIsMetro] = useState(true); // Metro city status

    // State for results
    const [exemptHra, setExemptHra] = useState(0);
    const [taxableHra, setTaxableHra] = useState(0);

    // Calculate HRA whenever inputs change
    useEffect(() => {
        calculateHRA();
    }, [basicSalary, da, hraReceived, rentPaid, isMetro]);

    /**
     * Calculates HRA exemption
     */
    const calculateHRA = () => {
        const basic = parseFloat(basicSalary);
        const dearness = parseFloat(da);
        const hra = parseFloat(hraReceived);
        const rent = parseFloat(rentPaid);

        const salary = basic + dearness;

        // 1. Actual HRA received
        const condition1 = hra;

        // 2. 50% of salary for Metro, 40% for Non-Metro
        const condition2 = isMetro ? salary * 0.5 : salary * 0.4;

        // 3. Rent paid - 10% of salary
        const condition3 = Math.max(0, rent - (salary * 0.1));

        // Exempt HRA is the minimum of the three conditions
        const exempt = Math.min(condition1, condition2, condition3);

        // Taxable HRA is the remainder
        const taxable = Math.max(0, hra - exempt);

        setExemptHra(Math.round(exempt));
        setTaxableHra(Math.round(taxable));
    };

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
                HRA Calculator
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-4">
                    {/* Basic Salary */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Basic Salary (Annual)
                        </label>
                        <input
                            type="number"
                            value={basicSalary}
                            onChange={(e) => setBasicSalary(e.target.value)}
                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    {/* DA */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Dearness Allowance (DA - Annual)
                        </label>
                        <input
                            type="number"
                            value={da}
                            onChange={(e) => setDa(e.target.value)}
                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    {/* HRA Received */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            HRA Received (Annual)
                        </label>
                        <input
                            type="number"
                            value={hraReceived}
                            onChange={(e) => setHraReceived(e.target.value)}
                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    {/* Rent Paid */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Total Rent Paid (Annual)
                        </label>
                        <input
                            type="number"
                            value={rentPaid}
                            onChange={(e) => setRentPaid(e.target.value)}
                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    {/* City Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            City Type
                        </label>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setIsMetro(true)}
                                className={`flex-1 py-2 px-4 rounded-md transition-colors ${isMetro
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                Metro
                            </button>
                            <button
                                onClick={() => setIsMetro(false)}
                                className={`flex-1 py-2 px-4 rounded-md transition-colors ${!isMetro
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                Non-Metro
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Metros: Delhi, Mumbai, Kolkata, Chennai
                        </p>
                    </div>
                </div>

                {/* Results Section */}
                <div className="flex flex-col justify-center space-y-6 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
                    <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Exempt HRA Amount</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(exemptHra)}
                        </p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">Taxable HRA</span>
                            <span className="font-semibold text-red-500 dark:text-red-400">{formatCurrency(taxableHra)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">Total HRA Received</span>
                            <span className="font-semibold dark:text-white">{formatCurrency(hraReceived)}</span>
                        </div>
                    </div>

                    {/* Visual Bar Chart */}
                    <div className="mt-4">
                        <div className="flex h-4 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600">
                            <div
                                className="bg-green-500"
                                style={{ width: `${(exemptHra / hraReceived) * 100}%` }}
                                title="Exempt"
                            ></div>
                            <div
                                className="bg-red-500"
                                style={{ width: `${(taxableHra / hraReceived) * 100}%` }}
                                title="Taxable"
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs mt-2 text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                                Exempt ({hraReceived > 0 ? Math.round((exemptHra / hraReceived) * 100) : 0}%)
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                                Taxable ({hraReceived > 0 ? Math.round((taxableHra / hraReceived) * 100) : 0}%)
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HRACalculator;
