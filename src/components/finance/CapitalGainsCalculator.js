import React, { useState, useEffect, useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const CapitalGainsCalculator = () => {
    // --- State ---
    const [salePrice, setSalePrice] = useState(18000000);
    const [transferExpenses, setTransferExpenses] = useState(0);
    const [fmv2001, setFmv2001] = useState('');
    const [actualCostPre2001, setActualCostPre2001] = useState(300000);
    const [improvements, setImprovements] = useState([
        { id: 1, year: '2006-07', cost: 400000 },
        { id: 2, year: '2008-09', cost: 400000 }
    ]);
    const [saleDate, setSaleDate] = useState('2025-06-01');

    // Accordion states
    const [showSec54, setShowSec54] = useState(false);
    const [showSec54EC, setShowSec54EC] = useState(false);

    // Breakdown toggles
    const [showCoABreakdown, setShowCoABreakdown] = useState(false);
    const [showCoIBreakdown, setShowCoIBreakdown] = useState(false);

    // --- Constants ---
    const CII = useMemo(() => ({
        '2001-02': 100, '2002-03': 105, '2003-04': 109, '2004-05': 113, '2005-06': 117,
        '2006-07': 122, '2007-08': 129, '2008-09': 137, '2009-10': 148, '2010-11': 167,
        '2011-12': 184, '2012-13': 200, '2013-14': 220, '2014-15': 240, '2015-16': 254,
        '2016-17': 264, '2017-18': 272, '2018-19': 280, '2019-20': 289, '2020-21': 301,
        '2021-22': 317, '2022-23': 331, '2023-24': 348, '2024-25': 363, '2025-26': 381
    }), []);

    const ciiSale = CII['2025-26'];

    // --- Calculations ---
    const results = useMemo(() => {
        const sPrice = parseFloat(salePrice) || 0;
        const tExpenses = parseFloat(transferExpenses) || 0;
        const aCost = parseFloat(actualCostPre2001) || 0;
        const fmv = parseFloat(fmv2001) || 0;

        const netSale = sPrice - tExpenses;

        // Option A: 20% with Indexation
        const costBaseA = (fmv > 0) ? Math.max(aCost, fmv) : aCost;
        const indexedCoA = (costBaseA / CII['2001-02']) * ciiSale;

        let indexedCoI = 0;
        const improvementBreakdown = improvements.map(imp => {
            const ciiImp = CII[imp.year];
            if (ciiImp) {
                const thisIndexedCost = (imp.cost / ciiImp) * ciiSale;
                indexedCoI += thisIndexedCost;
                return { ...imp, ciiImp, thisIndexedCost };
            }
            return { ...imp, ciiImp: 0, thisIndexedCost: 0 };
        });

        const totalIndexedCost = indexedCoA + indexedCoI;
        const gainA = Math.max(0, netSale - totalIndexedCost);
        const taxA = gainA * 0.20;

        // Option B: 12.5% without Indexation
        const costBaseB = (fmv > 0) ? Math.max(aCost, fmv) : aCost;
        let nominalCoI = 0;
        improvements.forEach(imp => nominalCoI += parseFloat(imp.cost) || 0);
        const totalNominalCost = costBaseB + nominalCoI;
        const gainB = Math.max(0, netSale - totalNominalCost);
        const taxB = gainB * 0.125;

        return {
            netSale,
            costBaseA,
            indexedCoA,
            indexedCoI,
            improvementBreakdown,
            gainA,
            taxA,
            costBaseB,
            nominalCoI,
            gainB,
            taxB,
            diff: Math.abs(taxA - taxB),
            betterOption: taxA < taxB ? 'A' : (taxB < taxA ? 'B' : 'Equal')
        };
    }, [salePrice, transferExpenses, actualCostPre2001, fmv2001, improvements, CII, ciiSale]);

    // --- Helpers ---
    const formatCurrency = (num) => {
        if (isNaN(num)) return '₹0';
        return num.toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        });
    };

    const formatShort = (value) => {
        if (value >= 10000000) return '₹' + (value / 10000000).toFixed(2) + 'Cr';
        if (value >= 100000) return '₹' + (value / 100000).toFixed(2) + 'L';
        if (value >= 1000) return '₹' + (value / 1000).toFixed(0) + 'k';
        return '₹' + value;
    };

    const formatDate = (dateObj) => {
        if (isNaN(dateObj.getTime())) return '';
        const day = dateObj.getDate();
        const month = dateObj.toLocaleString('default', { month: 'long' });
        const year = dateObj.getFullYear();

        const j = day % 10, k = day % 100;
        let suffix = "th";
        if (j === 1 && k !== 11) { suffix = "st"; }
        else if (j === 2 && k !== 12) { suffix = "nd"; }
        else if (j === 3 && k !== 13) { suffix = "rd"; }

        return `${day}${suffix} ${month} ${year}`;
    };

    // --- Date Deadlines ---
    const deadlines = useMemo(() => {
        const d = new Date(saleDate);
        if (isNaN(d.getTime())) return {};

        const oneYearBefore = new Date(d); oneYearBefore.setFullYear(d.getFullYear() - 1);
        const twoYearsAfter = new Date(d); twoYearsAfter.setFullYear(d.getFullYear() + 2);
        const threeYearsAfter = new Date(d); threeYearsAfter.setFullYear(d.getFullYear() + 3);
        const sixMonthsAfter = new Date(d); sixMonthsAfter.setMonth(d.getMonth() + 6);

        let ayYear;
        if (d.getMonth() < 3) {
            ayYear = d.getFullYear();
        } else {
            ayYear = d.getFullYear() + 1;
        }
        const itrDeadline = new Date(ayYear, 6, 31);

        return {
            purchaseStart: oneYearBefore,
            purchaseEnd: twoYearsAfter,
            constructEnd: threeYearsAfter,
            cgasEnd: itrDeadline,
            bondsEnd: sixMonthsAfter
        };
    }, [saleDate]);

    // --- Handlers ---
    const addImprovement = () => {
        const newId = improvements.length > 0 ? Math.max(...improvements.map(i => i.id)) + 1 : 1;
        setImprovements([...improvements, { id: newId, year: '2010-11', cost: 100000 }]);
    };

    const updateImprovement = (id, field, value) => {
        setImprovements(improvements.map(imp =>
            imp.id === id ? { ...imp, [field]: value } : imp
        ));
    };

    const removeImprovement = (id) => {
        setImprovements(improvements.filter(imp => imp.id !== id));
    };

    // --- Chart Data ---
    const chartData = {
        labels: ['Taxable Capital Gain', 'Estimated Tax Liability'],
        datasets: [
            {
                label: 'Option A: 20% w/ Indexation',
                data: [results.gainA, results.taxA],
                backgroundColor: '#10b981', // Emerald 500
                borderColor: '#059669',
                borderWidth: 1
            },
            {
                label: 'Option B: 12.5% No Indexation',
                data: [results.gainB, results.taxB],
                backgroundColor: '#3b82f6', // Blue 500 (Changed from Amber to match theme)
                borderColor: '#2563eb',
                borderWidth: 1
            }
        ]
    };

    const dataLabelPlugin = {
        id: 'dataLabels',
        afterDatasetsDraw: (chart) => {
            const { ctx } = chart;
            ctx.save();
            chart.data.datasets.forEach((dataset, i) => {
                const meta = chart.getDatasetMeta(i);
                if (!meta.hidden) {
                    meta.data.forEach((element, index) => {
                        const value = dataset.data[index];
                        if (value > 0) {
                            const label = formatShort(value);
                            ctx.fillStyle = '#4b5563'; // gray-600
                            ctx.font = 'bold 11px sans-serif';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'bottom';
                            ctx.fillText(label, element.x, element.y - 5);
                        }
                    });
                }
            });
            ctx.restore();
        }
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 25 // Ensure space for labels at top
            }
        },
        plugins: {
            legend: { position: 'bottom' },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return context.dataset.label + ': ' + formatCurrency(context.raw);
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grace: '5%',
                ticks: {
                    callback: function (value) {
                        if (value >= 10000000) return '₹' + (value / 10000000).toFixed(1) + 'Cr';
                        if (value >= 100000) return '₹' + (value / 100000).toFixed(1) + 'L';
                        return value;
                    },
                    color: '#6b7280' // gray-500
                },
                grid: {
                    color: '#e5e7eb' // gray-200
                }
            },
            x: {
                ticks: { color: '#6b7280' },
                grid: { display: false }
            }
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <header className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    Capital Gains Optimizer
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">Compare 20% (with Indexation) vs. 12.5% (without Indexation)</p>
            </header>

            {/* INPUT SECTION */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8 border-t-4 border-blue-500">
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">1</span>
                    Property Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Column 1: Basic Values */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Expected Sale Value (2025-26)</label>
                            <input
                                type="number"
                                value={salePrice}
                                onChange={(e) => setSalePrice(e.target.value)}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 dark:bg-gray-700 font-semibold text-gray-800 dark:text-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Transfer Expenses
                                <span className="text-xs font-normal text-gray-400 ml-1">(Brokerage, Legal Fees, Stamp Duty)</span>
                            </label>
                            <input
                                type="number"
                                value={transferExpenses}
                                onChange={(e) => setTransferExpenses(e.target.value)}
                                placeholder="e.g., 100000"
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-gray-100"
                            />
                        </div>

                        <div>
                            <label className="flex items-center text-sm font-medium text-blue-700 dark:text-blue-400 mb-1 font-bold">
                                Fair Market Value (FMV) on 01/04/2001
                                <span title="Crucial for properties bought before 2001. Higher of Actual Cost or FMV is used." className="ml-2 cursor-help rounded-full bg-blue-100 text-blue-800 w-5 h-5 flex items-center justify-center text-xs">?</span>
                            </label>
                            <input
                                type="number"
                                value={fmv2001}
                                onChange={(e) => setFmv2001(e.target.value)}
                                placeholder="ENTER VALUE HERE (Required)"
                                className="w-full p-3 border-2 border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-blue-50 dark:bg-gray-700 dark:text-gray-100"
                                required
                            />
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Try entering 25,00,000 to see effect.</p>
                        </div>
                    </div>

                    {/* Column 2: Historical Costs */}
                    <div className="space-y-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Actual Cost (Pre-2001)</label>
                            <input
                                type="number"
                                value={actualCostPre2001}
                                onChange={(e) => setActualCostPre2001(e.target.value)}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 dark:text-gray-100"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total of Purchase (1997) + Construction (1999)</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Improvements (Renovations)</h3>
                            <div className="space-y-2">
                                {improvements.map((imp) => (
                                    <div key={imp.id} className="flex items-center gap-2 bg-white dark:bg-gray-700 p-2 border border-gray-200 dark:border-gray-600 rounded shadow-sm">
                                        <div className="flex-1 text-sm">
                                            <span className="font-bold text-gray-600 dark:text-gray-300">{imp.year}</span>
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                value={imp.cost}
                                                onChange={(e) => updateImprovement(imp.id, 'cost', e.target.value)}
                                                className="w-full p-1 border border-gray-200 dark:border-gray-500 rounded text-sm text-right dark:bg-gray-600 dark:text-gray-100"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeImprovement(imp.id)}
                                            className="text-red-400 hover:text-red-600 font-bold px-2"
                                        >×</button>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={addImprovement}
                                className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 uppercase tracking-wide"
                            >
                                + Add Expense
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* RESULTS DASHBOARD */}
            <section className="mb-8">
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">2</span>
                    Tax Comparison Analysis
                </h3>

                {/* Winner Banner */}
                <div className={`mb-6 p-4 rounded-lg border-l-4 shadow-sm flex items-start gap-3 ${!fmv2001 ? 'bg-gray-100 border-gray-400 dark:bg-gray-700 dark:border-gray-500' :
                    results.betterOption !== 'Equal' ? 'bg-green-50 border-green-500 dark:bg-green-900/20 dark:border-green-500' :
                        'bg-gray-100 border-gray-400 dark:bg-gray-700 dark:border-gray-500'
                    }`}>
                    <div className="text-3xl">
                        {!fmv2001 ? '⏳' : results.betterOption !== 'Equal' ? '✅' : '⚖️'}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg dark:text-gray-100">
                            {!fmv2001 ? 'Waiting for FMV' :
                                results.betterOption === 'A' ? 'Option A (Indexation) saves you money' :
                                    results.betterOption === 'B' ? 'Option B (New Regime) saves you money' :
                                        'Both options are equal'}
                        </h3>
                        <p className="text-sm md:text-base dark:text-gray-300">
                            {!fmv2001 ? 'Please enter the Fair Market Value (2001) to compare options.' :
                                results.betterOption !== 'Equal' ? <span>You save <strong className="text-green-700 dark:text-green-400">{formatCurrency(results.diff)}</strong> by choosing the {results.betterOption === 'A' ? '20% regime with indexation' : '12.5% regime without indexation'}.</span> :
                                    'The tax liability is identical under both regimes.'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Option A: Indexation */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden relative">
                        <div className="bg-gray-100 dark:bg-gray-700 p-3 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
                            <h3 className="font-bold text-gray-700 dark:text-gray-200">Option A: 20% with Indexation</h3>
                            <span className="text-xs bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300 px-2 py-1 rounded">Traditional</span>
                        </div>
                        <div className="p-6 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Net Sale Consideration</span>
                                <span className="font-medium dark:text-gray-200">{formatCurrency(results.netSale)}</span>
                            </div>

                            {/* Indexed CoA with Toggle */}
                            <div className="flex flex-col">
                                <div className="flex justify-between text-sm items-center">
                                    <div className="flex items-center">
                                        <span className="text-gray-500 dark:text-gray-400">Indexed Cost of Acquisition</span>
                                        <button
                                            onClick={() => setShowCoABreakdown(!showCoABreakdown)}
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 ml-1 font-bold"
                                            title="Show Calculation"
                                        >{showCoABreakdown ? '−' : '+'}</button>
                                    </div>
                                    <span className="font-medium text-green-700 dark:text-green-400">{formatCurrency(results.indexedCoA)}</span>
                                </div>
                                {showCoABreakdown && (
                                    <div className="text-xs text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-gray-700 p-2 mt-1 rounded border border-blue-100 dark:border-gray-600 font-mono">
                                        <div className="flex justify-between">
                                            <span>Base Cost (Higher of Actual/FMV):</span> <span>{formatCurrency(results.costBaseA)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>CII (Base Year 2001-02):</span> <span>{CII['2001-02']}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>CII (Sale Year 2025-26):</span> <span>{ciiSale}</span>
                                        </div>
                                        <div className="border-t border-blue-200 dark:border-gray-500 mt-1 pt-1 font-bold text-blue-700 dark:text-blue-300">
                                            Formula: ({formatCurrency(results.costBaseA)} × {ciiSale}) / 100
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Indexed CoI with Toggle */}
                            <div className="flex flex-col">
                                <div className="flex justify-between text-sm items-center">
                                    <div className="flex items-center">
                                        <span className="text-gray-500 dark:text-gray-400">Indexed Cost of Improvement</span>
                                        <button
                                            onClick={() => setShowCoIBreakdown(!showCoIBreakdown)}
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 ml-1 font-bold"
                                            title="Show Calculation"
                                        >{showCoIBreakdown ? '−' : '+'}</button>
                                    </div>
                                    <span className="font-medium text-green-700 dark:text-green-400">{formatCurrency(results.indexedCoI)}</span>
                                </div>
                                {showCoIBreakdown && (
                                    <div className="text-xs text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-gray-700 p-2 mt-1 rounded border border-blue-100 dark:border-gray-600 space-y-1 font-mono">
                                        {results.improvementBreakdown.length === 0 ? (
                                            <div className="text-center italic">No improvements added</div>
                                        ) : (
                                            results.improvementBreakdown.map((imp, idx) => (
                                                <div key={imp.id} className={`pb-1 ${idx < results.improvementBreakdown.length - 1 ? 'border-b border-blue-200 dark:border-gray-500 mb-1' : ''}`}>
                                                    <div className="flex justify-between">
                                                        <span>Year {imp.year} (CII {imp.ciiImp}):</span> <span>Cost: {formatCurrency(imp.cost)}</span>
                                                    </div>
                                                    <div className="text-blue-700 dark:text-blue-300">
                                                        Result: ({formatCurrency(imp.cost)} × {ciiSale}) / {imp.ciiImp} = {formatCurrency(imp.thisIndexedCost)}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-2"></div>
                            <div className="flex justify-between text-sm font-semibold">
                                <span className="text-gray-800 dark:text-gray-200">Taxable Capital Gain</span>
                                <span className="text-gray-800 dark:text-gray-200">{formatCurrency(results.gainA)}</span>
                            </div>
                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tax Liability (20%)</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(results.taxA)}</p>
                            </div>
                        </div>
                        {results.betterOption === 'A' && (
                            <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                BEST OPTION
                            </div>
                        )}
                    </div>

                    {/* Option B: No Indexation */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden relative">
                        <div className="bg-gray-100 dark:bg-gray-700 p-3 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
                            <h3 className="font-bold text-gray-700 dark:text-gray-200">Option B: 12.5% without Indexation</h3>
                            <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">New Regime</span>
                        </div>
                        <div className="p-6 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Net Sale Consideration</span>
                                <span className="font-medium dark:text-gray-200">{formatCurrency(results.netSale)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Nominal Cost of Acquisition</span>
                                <span className="font-medium text-blue-700 dark:text-blue-400">{formatCurrency(results.costBaseB)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Nominal Cost of Improvement</span>
                                <span className="font-medium text-blue-700 dark:text-blue-400">{formatCurrency(results.nominalCoI)}</span>
                            </div>
                            <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-2"></div>
                            <div className="flex justify-between text-sm font-semibold">
                                <span className="text-gray-800 dark:text-gray-200">Taxable Capital Gain</span>
                                <span className="text-gray-800 dark:text-gray-200">{formatCurrency(results.gainB)}</span>
                            </div>
                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tax Liability (12.5%)</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(results.taxB)}</p>
                            </div>
                        </div>
                        {results.betterOption === 'B' && (
                            <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                BEST OPTION
                            </div>
                        )}
                    </div>
                </div>

                {/* Visualization */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">Capital Gain vs Tax Liability Comparison</h3>
                    <div className="h-[350px] w-full max-w-[650px] mx-auto">
                        <Bar data={chartData} options={chartOptions} plugins={[dataLabelPlugin]} />
                    </div>
                </div>
            </section>

            {/* EXEMPTION OPTIONS */}
            <section className="mb-12">
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">3</span>
                    Available Exemption Options
                </h3>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg mb-6 flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1">
                        <label htmlFor="saleDate" className="block text-sm font-bold text-blue-800 dark:text-blue-300 mb-1">Select Actual Date of Sale:</label>
                        <input
                            type="date"
                            id="saleDate"
                            value={saleDate}
                            onChange={(e) => setSaleDate(e.target.value)}
                            className="p-2 border border-blue-300 dark:border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 dark:text-gray-200 font-medium dark:bg-gray-800"
                        />
                    </div>
                    <div className="flex-2 text-sm text-blue-900 dark:text-blue-200">
                        <strong>Why this matters?</strong> Specific deadlines for reinvestment are calculated from this date. Change the date to see your deadlines below.
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Section 54 */}
                    <div>
                        <button
                            onClick={() => setShowSec54(!showSec54)}
                            className="flex justify-between items-center w-full p-5 font-semibold text-left text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                        >
                            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                                <span className="text-lg">Section 54: New Residential House</span>
                                <span className="text-xs font-normal bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded-full w-fit">Most Popular</span>
                            </div>
                            <span className="text-2xl text-blue-600 dark:text-blue-400">{showSec54 ? '−' : '+'}</span>
                        </button>
                        {showSec54 && (
                            <div className="p-5 border border-t-0 border-gray-200 dark:border-gray-700 rounded-b-lg bg-white dark:bg-gray-800">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">The Basics</h4>
                                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                            <li><strong>Condition:</strong> Sell a Residential House -&gt; Buy another Residential House.</li>
                                            <li><strong>Limit:</strong> Reinvest the <span className="text-blue-700 dark:text-blue-400 font-bold">Capital Gain amount</span> (not necessarily the full sale price).</li>
                                            <li><strong>Location:</strong> New house must be in India.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Deadlines</h4>
                                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                            <li><strong>Purchase:</strong> 1 year before or 2 years after sale.<br />
                                                <span className="text-blue-700 dark:text-blue-400 font-medium bg-blue-50 dark:bg-gray-700 px-1 rounded block mt-1 ml-4">
                                                    Between <strong>{formatDate(deadlines.purchaseStart)}</strong> and <strong>{formatDate(deadlines.purchaseEnd)}</strong>
                                                </span>
                                            </li>
                                            <li><strong>Construct:</strong> Within 3 years after sale.<br />
                                                <span className="text-blue-700 dark:text-blue-400 font-medium bg-blue-50 dark:bg-gray-700 px-1 rounded block mt-1 ml-4">
                                                    Before <strong>{formatDate(deadlines.constructEnd)}</strong>
                                                </span>
                                            </li>
                                            <li><strong>CGAS:</strong> If not invested by tax filing due date.<br />
                                                <span className="text-blue-700 dark:text-blue-400 font-medium bg-blue-50 dark:bg-gray-700 px-1 rounded block mt-1 ml-4">
                                                    Deposit before filing ITR, i.e., approx <strong>{formatDate(deadlines.cgasEnd)}</strong>
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Section 54EC */}
                    <div>
                        <button
                            onClick={() => setShowSec54EC(!showSec54EC)}
                            className="flex justify-between items-center w-full p-5 font-semibold text-left text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                        >
                            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                                <span className="text-lg">Section 54EC: Capital Gain Bonds</span>
                                <span className="text-xs font-normal bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full w-fit">Hassle Free</span>
                            </div>
                            <span className="text-2xl text-blue-600 dark:text-blue-400">{showSec54EC ? '−' : '+'}</span>
                        </button>
                        {showSec54EC && (
                            <div className="p-5 border border-t-0 border-gray-200 dark:border-gray-700 rounded-b-lg bg-white dark:bg-gray-800">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">The Basics</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Invest in specific government bonds if you don't want to buy another property.</p>
                                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                            <li><strong>Eligible Bonds:</strong> REC, NHAI, PFC, IRFC.</li>
                                            <li><strong>Max Limit:</strong> Rs. 50 Lakhs per financial year.</li>
                                            <li><strong>Interest:</strong> Bonds earn interest (taxable).</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Constraints</h4>
                                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                            <li><strong>Time Limit:</strong> Must invest within <span className="text-red-600 dark:text-red-400 font-bold">6 months</span> of the sale date.<br />
                                                <span className="text-blue-700 dark:text-blue-400 font-medium bg-blue-50 dark:bg-gray-700 px-1 rounded block mt-1 ml-4">
                                                    Invest before <strong>{formatDate(deadlines.bondsEnd)}</strong>
                                                </span>
                                            </li>
                                            <li><strong>Lock-in:</strong> Money is locked for <strong>5 years</strong>.</li>
                                            <li><strong>No Loans:</strong> Cannot take a loan against these bonds.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CapitalGainsCalculator;
