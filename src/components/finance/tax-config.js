/**
 * Tax Configuration — FY-keyed config for Income Tax Calculator
 *
 * Holds all FY-dependent values (slabs, rebate, surcharge, cess, deduction
 * caps) so the calculator can support multiple Financial Years from a single
 * source of truth.
 *
 * Adding a new FY:
 *   1. Add a new entry under TAX_CONFIG keyed by 'YYYY-YY' (e.g., '2027-28')
 *   2. Append the FY string to FY_LIST in display order (newest first)
 *   3. Section number rename (Act 1961 → Act 2025) is documented for reference
 *      but the UI keeps familiar 80C/80D/80TTB labels
 *
 * Current FY is determined by getCurrentFY() based on the April 1 cutover date.
 *
 * Sources:
 *   - FY 2025-26: Finance Act 2025, Memorandum to Finance Bill 2025
 *   - FY 2026-27: Finance Act 2026 (No. 4 of 2026), assent 30-Mar-2026
 *     [docs/research-fy-2026-27.md]
 */

// =============================================================================
// FY 2025-26 (Assessment Year 2026-27)
// =============================================================================
// Source: Finance Act 2025, Income-tax Act 1961
// Slabs, rebate, surcharge — all set by Budget 2025
const FY_2025_26 = {
    // Display label for UI (pill toggle, page title, PDF header)
    label: 'FY 2025-26 (AY 2026-27)',
    // Short label for filenames and tight UI spaces
    shortLabel: 'FY 2025-26',
    // Year string used in PDF filenames: "Income_Tax_Comparison_FY2025-26.pdf"
    fileLabel: 'FY2025-26',

    // ---------- New Regime (Sec 115BAC, default regime) ----------
    newRegime: {
        // Standard Deduction for salaried/pensioner under New Regime
        standardDeduction: 75000,
        // Tax slabs — array of { limit (size of slab, not boundary), rate, label }
        // Last slab uses Infinity to mean "remaining income"
        slabs: [
            { limit: 400000, rate: 0, label: "0 - 4L" },
            { limit: 400000, rate: 0.05, label: "4L - 8L" },
            { limit: 400000, rate: 0.10, label: "8L - 12L" },
            { limit: 400000, rate: 0.15, label: "12L - 16L" },
            { limit: 400000, rate: 0.20, label: "16L - 20L" },
            { limit: 400000, rate: 0.25, label: "20L - 24L" },
            { limit: Infinity, rate: 0.30, label: "Above 24L" }
        ],
        // Rebate u/s 87A: tax-free if taxable income ≤ threshold; max rebate is the tax itself
        rebate: {
            threshold: 1200000,    // ₹12L
            maxAmount: 60000,      // Maximum rebate amount (informational; engine zero-clamps)
            label: "Rebate u/s 87A applied"
        }
    },

    // ---------- Old Regime (legacy, opt-in via Form 10-IEA for business income) ----------
    oldRegime: {
        // Standard Deduction for salaried/pensioner under Old Regime
        standardDeduction: 50000,
        // Slabs broken down by age category (Old Regime only — age irrelevant in New).
        // Only the basic-exemption band differs between age categories; the
        // 5L-10L (20%) and >10L (30%) bands are identical across all three.
        // `limit` is the SIZE of each slab, not its upper boundary.
        // Source: research-fy-2026-27.md §4 (Finance Bill 2026 First Schedule;
        // senior ₹3L and super-senior ₹5L basic exemption unchanged from FY 2025-26).
        slabs: {
            // General citizen (< 60 years): ₹2.5L basic exemption
            general: [
                { limit: 250000, rate: 0, label: "0 - 2.5L" },
                { limit: 250000, rate: 0.05, label: "2.5L - 5L" },
                { limit: 500000, rate: 0.20, label: "5L - 10L" },
                { limit: Infinity, rate: 0.30, label: "Above 10L" }
            ],
            // Senior citizen (60 to < 80 years): ₹3L basic exemption
            senior: [
                { limit: 300000, rate: 0, label: "0 - 3L" },
                { limit: 200000, rate: 0.05, label: "3L - 5L" },
                { limit: 500000, rate: 0.20, label: "5L - 10L" },
                { limit: Infinity, rate: 0.30, label: "Above 10L" }
            ],
            // Super senior citizen (>= 80 years): ₹5L basic exemption (no 5% band)
            superSenior: [
                { limit: 500000, rate: 0, label: "0 - 5L" },
                { limit: 500000, rate: 0.20, label: "5L - 10L" },
                { limit: Infinity, rate: 0.30, label: "Above 10L" }
            ]
        },
        // Rebate u/s 87A under Old Regime
        rebate: {
            threshold: 500000,     // ₹5L
            maxAmount: 12500,      // Maximum rebate amount
            label: "Rebate u/s 87A applied"
        }
    },

    // ---------- Surcharge — both regimes ----------
    // Bracket boundaries are absolute taxable-income thresholds (not slab sizes)
    // Each bracket: { threshold, oldRate, newRate, prevOldRate, prevNewRate }
    // prevRate = surcharge rate just below the threshold (for marginal relief comparison)
    surcharge: {
        // Income at which surcharge first kicks in
        firstThreshold: 5000000,   // ₹50L
        // Brackets in ascending order. Engine picks the highest applicable.
        brackets: [
            { threshold: 5000000,  oldRate: 0.10, newRate: 0.10, prevOldRate: 0,    prevNewRate: 0    }, // 50L–1Cr
            { threshold: 10000000, oldRate: 0.15, newRate: 0.15, prevOldRate: 0.10, prevNewRate: 0.10 }, // 1Cr–2Cr
            { threshold: 20000000, oldRate: 0.25, newRate: 0.25, prevOldRate: 0.15, prevNewRate: 0.15 }, // 2Cr–5Cr
            { threshold: 50000000, oldRate: 0.37, newRate: 0.25, prevOldRate: 0.25, prevNewRate: 0.25 }  // >5Cr (New capped at 25%)
        ]
    },

    // ---------- Health & Education Cess ----------
    cessRate: 0.04 // 4% on (tax + surcharge), levied after rebate
};


// =============================================================================
// Deduction Sections (Old Regime, Chapter VI-A)
// =============================================================================
// Per-FY override planned — currently same shape across FY 2025-26 and FY 2026-27.
// Caps and section labels are unchanged in Finance Act 2026 [research-fy-2026-27.md §6].
// 80TTB cap stays at ₹50,000 — confirmed against incometax.gov.in, ClearTax,
// TaxGuru Finance Act 2026 reproduction (Tier-3 ₹1L claims confuse Sec 194A
// TDS-threshold with Sec 80TTB deduction-limit).
const DEDUCTION_SECTIONS = [
    {
        key: 'sec80C',
        label: 'Section 80C',
        description: 'EPF, PPF, ELSS, LIC, NSC, Tax-saving FD, Home Loan Principal, Tuition Fees, SSY, SCSS',
        max: 150000,       // Statutory limit: ₹1,50,000 (Sec 80CCE / Sec 123(5) of Act 2025)
        step: 5000,
        defaultValue: 150000,
    },
    {
        key: 'sec80CCD1B',
        label: 'Section 80CCD(1B)',
        description: 'Additional NPS contributions (over and above Section 80C limit)',
        max: 50000,        // Statutory limit: ₹50,000 (Sec 124(2) of Act 2025)
        step: 5000,
        defaultValue: 0,
    },
    {
        key: 'sec80D',
        label: 'Section 80D',
        description: 'Health insurance premium (self/family + parents). Up to ₹1,00,000 if both are senior citizens.',
        max: 100000,       // Aggregate max ₹1,00,000 (Sec 126 of Act 2025)
        step: 5000,
        defaultValue: 25000,
    },
    {
        key: 'sec80E',
        label: 'Section 80E',
        description: 'Education loan interest (no upper limit, max 8 years)',
        max: null,         // No statutory limit (Sec 129 of Act 2025)
        sliderMax: 500000, // Practical slider bound; number input is uncapped
        step: 10000,
        defaultValue: 0,
    },
    {
        key: 'sec80G',
        label: 'Section 80G',
        description: 'Charitable donations (enter the eligible deduction amount)',
        max: null,         // No statutory cap; donor-side restrictions apply (Sec 133 of Act 2025)
        sliderMax: 500000,
        step: 10000,
        defaultValue: 0,
    },
    {
        key: 'sec80TTA',
        label: 'Section 80TTA/80TTB',
        description: 'Savings account interest. 80TTA: ₹10,000 (below 60 yrs), 80TTB: ₹50,000 (seniors)',
        max: 50000,        // 80TTB max ₹50,000 — verified vs Sec 153(2)(b) of Act 2025
        step: 1000,
        defaultValue: 0,
    },
];


// =============================================================================
// AGE_CATEGORIES — Old Regime age bands (drive which slab schedule applies)
// =============================================================================
// Single source of truth for the valid `ageCategory` values. Each `key` MUST
// match a key under every FY's oldRegime.slabs. The UI renders one pill per
// entry (in this order); the engine selects oldRegime.slabs[key]. Age is
// irrelevant under the New Regime, so these apply to the Old Regime only.
const AGE_CATEGORIES = [
    { key: 'general',     label: 'General',      ageRange: '< 60 yrs' },
    { key: 'senior',      label: 'Senior',       ageRange: '60–80 yrs' },
    { key: 'superSenior', label: 'Super Senior', ageRange: '80+ yrs' },
];


// =============================================================================
// TAX_CONFIG — keyed by FY string (e.g., '2025-26')
// =============================================================================
// IT-5 will add the '2026-27' entry. IT-2 makes the engine read from this map.
const TAX_CONFIG = {
    '2025-26': FY_2025_26,
};


// =============================================================================
// FY_LIST — display order for UI (newest first)
// =============================================================================
// Defines the available options for the FY pill toggle / dropdown.
// Order = display order in the UI.
const FY_LIST = ['2025-26'];


// =============================================================================
// getCurrentFY — determine the current Financial Year by date
// =============================================================================
/**
 * Returns the current Indian Financial Year string for a given date.
 *
 * Indian FY runs 1 April → 31 March. So:
 *   2026-03-15 → '2025-26'  (still in FY 2025-26)
 *   2026-04-01 → '2026-27'  (FY 2026-27 begins)
 *   2026-05-05 → '2026-27'
 *
 * If the computed current FY is not yet configured in TAX_CONFIG (e.g., we're
 * in FY 2026-27 but haven't shipped its config yet), fall back to the latest
 * FY available in FY_LIST. This prevents a "blank calculator" UX when a new
 * FY arrives before the codebase is updated.
 *
 * @param {Date} now - The reference date (defaults to current time)
 * @returns {string} FY string in 'YYYY-YY' format (e.g., '2025-26')
 */
const getCurrentFY = (now = new Date()) => {
    const year = now.getFullYear();
    const month = now.getMonth(); // 0 = January, 3 = April

    // FY starts in April. If month is Jan/Feb/Mar (0/1/2), we're still in the
    // previous calendar year's FY.
    const fyStart = month >= 3 ? year : year - 1;
    const fyEnd = (fyStart + 1) % 100; // Two-digit year for the end
    const fyEndStr = fyEnd.toString().padStart(2, '0');
    const computed = `${fyStart}-${fyEndStr}`;

    // Fallback: if the computed FY isn't configured, use the latest available
    if (TAX_CONFIG[computed]) {
        return computed;
    }
    // FY_LIST[0] is the newest configured FY (display order = newest first)
    return FY_LIST[0];
};


export {
    TAX_CONFIG,
    FY_LIST,
    DEDUCTION_SECTIONS,
    AGE_CATEGORIES,
    getCurrentFY,
};
