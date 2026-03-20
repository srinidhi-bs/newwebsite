# Indian Capital Gains Tax Exemption: Complete Reference for Calculator Development

**Baseline: AY 2026-27 (FY 2025-26) | Income Tax Act, 1961 as amended through Finance Act 2025**

This reference document covers every rule, formula, edge case, and recent amendment needed to build a Capital Gains Tax Exemption Calculator for Indian property sales. Three budgets materially changed this landscape: **Budget 2023** capped exemptions at ₹10 crore, **Budget 2024** replaced the 20%-with-indexation regime with 12.5%-without-indexation (adding a grandfathering clause), and **Budget 2025** expanded the list of eligible 54EC bonds. All changes are flagged inline.

---

## PART A: Capital Gain Computation Basics

### A1. Short-term vs long-term classification

**Holding period thresholds (current for AY 2026-27):**

| Asset Type | Threshold for LTCG | Governing Provision |
|---|---|---|
| **Immovable property (land, building)** | **>24 months** | Section 2(42A) |
| Unlisted shares | >24 months | Section 2(42A) |
| Gold, jewelry, unlisted bonds/debentures | >24 months | Section 2(42A) [BUDGET 2024 CHANGE] reduced from 36 → 24 months |
| Listed equity shares (STT paid) | >12 months | Section 2(42A) proviso |
| Equity-oriented mutual fund units | >12 months | Section 2(42A) proviso |
| Listed securities, govt securities, zero-coupon bonds | >12 months | Section 2(42A) proviso |
| Business trust units (REITs, InvITs) | >12 months | [BUDGET 2024 CHANGE] reduced from 36 → 12 months |
| Debt mutual funds (purchased on/after 01-04-2023) | **Always STCG** | [BUDGET 2023 CHANGE] Section 50AA — no LTCG concept |

**[BUDGET 2024 CHANGE]** The Finance (No.2) Act, 2024 simplified holding periods into just two buckets: **12 months** (listed securities) and **24 months** (all other assets). The old 36-month category was eliminated entirely.

**History for immovable property:** The threshold was reduced from **36 months to 24 months** by the **Finance Act, 2017**, effective AY 2018-19. Budget 2024 did not change it further.

**How holding period is calculated:**

The period runs from the **date the asset was first "held"** by the assessee to the **date of transfer** (Section 2(42A)). Courts have interpreted "held" broadly — in *Syamala Rao v. CIT* (234 ITR 140, AP HC), possession under an agreement to sell counted as the start date, even though registration occurred years later. For under-construction property, holding period generally starts from the **date of allotment** per *Jitendra Mohan v. ITO* (Delhi HC).

**Special cases — inherited, gifted, and bequeathed property:**

Per **Section 2(42A) Explanation 1**, the **previous owner's holding period is included** in the assessee's holding period for:

- **Inherited property** — includes the deceased's holding period
- **Gifted property** — includes the donor's holding period
- **Property received under will** — includes the testator's holding period
- **HUF partition** — includes the HUF's holding period

*Example:* Father purchased property in 2005, gifted to son in 2024, son sells in 2025. Holding period = 20 years (from father's purchase date) → LTCG.

---

### A2. Cost of acquisition rules

**Property purchased before 01-04-2001 — Section 55(2)(b):**

Cost of acquisition = **higher of actual cost OR Fair Market Value (FMV) as on 01-04-2001**, at the assessee's option. The reference date was changed from **01-04-1981 to 01-04-2001** by the **Finance Act, 2017** (effective AY 2018-19). FMV is determined via a registered valuer's report. Cost of improvement incurred **before 01-04-2001 is ignored** — only post-2001 improvement costs are allowed.

**Inherited property — Section 49(1)(i):**

Cost = **cost to the previous owner** who acquired the asset by purchase (not by gift/inheritance/will). The "previous owner" means the **last person in the chain who actually purchased** the asset. If that person bought before 01-04-2001, the higher-of-actual-cost-or-FMV rule applies. Per *CIT v. Manjula J. Shah* (Bombay HC), **indexation is computed from the year the previous owner first acquired the asset**, since the holding period includes the previous owner's period.

**Gifted property — Section 49(1)(ii):**

Identical rules as inherited property — cost = cost to the donor (or the last previous owner who purchased). Governed by Section 49(1)(ii) read with Section 47(iii).

**Property received under will — Section 49(1)(i):**

Treated identically to inheritance. The statutory text covers succession, inheritance, and devolution under one provision.

**Section 49 — Key sub-sections for the calculator:**

| Sub-section | Mode of Acquisition |
|---|---|
| 49(1)(i) | Succession, inheritance, devolution |
| 49(1)(ii) | Gift |
| 49(1)(iii) | Partition of HUF |
| 49(1)(iv) | Transfer to HUF member under Section 64(2) |

---

### A3. Cost Inflation Index (CII) — complete table

The base year was changed from FY 1981-82 to **FY 2001-02 (CII = 100)** by the Finance Act, 2017 (CBDT Notification No. 44/2017 dated 05.06.2017).

**Complete CII table (FY 2001-02 to FY 2025-26):**

| Financial Year | CII | Financial Year | CII |
|---|---|---|---|
| 2001-02 (Base) | **100** | 2014-15 | 240 |
| 2002-03 | 105 | 2015-16 | 254 |
| 2003-04 | 109 | 2016-17 | 264 |
| 2004-05 | 113 | 2017-18 | 272 |
| 2005-06 | 117 | 2018-19 | 280 |
| 2006-07 | 122 | 2019-20 | 289 |
| 2007-08 | 129 | 2020-21 | 301 |
| 2008-09 | 137 | 2021-22 | 317 |
| 2009-10 | 148 | 2022-23 | 331 |
| 2010-11 | 167 | 2023-24 | 348 |
| 2011-12 | 184 | 2024-25 | **363** |
| 2012-13 | 200 | **2025-26** | **376** |
| 2013-14 | 220 | | |

CII for FY 2025-26 = **376** was notified via **CBDT Notification No. 70/2025 dated 01-07-2025**.

**Indexation formula:**

```
Indexed Cost of Acquisition = (Cost of Acquisition × CII of year of sale) / CII of year of purchase*

Indexed Cost of Improvement = (Cost of Improvement × CII of year of sale) / CII of year of improvement

* For year of purchase: use the later of (a) actual year of purchase, or (b) FY 2001-02
* For inherited/gifted property: use the year the previous owner (who purchased) acquired it
```

**Important:** Post-Budget 2024, indexation is only relevant for the grandfathered cases described in Section A4 below. The CII continues to be notified annually specifically for these transitional computations.

---

### A4. Tax rate options post-Budget 2024

**[BUDGET 2024 CHANGE]** The Finance (No.2) Act, 2024 replaced the old 20%-with-indexation regime with a flat **12.5% without indexation** for all LTCG under Section 112. After massive backlash, a **grandfathering amendment was introduced on 6 August 2024** (not in the original Budget speech — added during Lok Sabha passage).

**The three scenarios the calculator must handle:**

| Scenario | Tax Treatment |
|---|---|
| **Property sold BEFORE 23-Jul-2024** | 20% with indexation (old rules) |
| **Property acquired BEFORE 23-Jul-2024, sold ON/AFTER 23-Jul-2024** | **Lower of**: (A) 12.5% on non-indexed gain, OR (B) 20% on indexed gain — **resident Individual/HUF only** |
| **Property acquired ON/AFTER 23-Jul-2024** | 12.5% without indexation only (no choice) |

**Critical limitations on grandfathering:**

The Option A vs Option B choice is available **only to resident Individuals and HUFs**. It is **not available** to NRIs, companies, partnership firms, or LLPs. These entities pay a flat 12.5% without indexation regardless of acquisition date.

**Calculator logic for grandfathered cases:**

```
# For resident Individual/HUF, property acquired before 23-Jul-2024, sold on/after 23-Jul-2024:

Option_A_Gain = Sale Price - Actual Cost of Acquisition (no indexation)
Option_A_Tax  = Option_A_Gain × 12.5%

Option_B_Gain = Sale Price - Indexed Cost of Acquisition (using CII)
Option_B_Tax  = Option_B_Gain × 20%

# If Option_B produces a loss, it cannot be used to offset Option_A
If Option_B_Gain < 0:
    Final_Tax = Option_A_Tax
Else:
    Final_Tax = min(Option_A_Tax, Option_B_Tax)
```

**STCG on property:** Taxed at **applicable slab rates** (added to total income). Unchanged by any recent budget.

**[BUDGET 2025 CHANGE]** No changes were made to capital gains tax rates or grandfathering provisions in Budget 2025.

---

### A5. Section 50C — stamp duty value deemed consideration

When immovable property is transferred for consideration **less than the stamp duty value (SDV)**, the SDV is deemed to be the full value of consideration for computing capital gains.

**Tolerance limit (10% safe harbour):**

| Year Introduced | Tolerance |
|---|---|
| Finance Act 2018 | 5% |
| Finance Act 2020 (AY 2021-22 onwards) | **10%** |

**Current rule:** If SDV ≤ **110% of actual sale consideration**, the actual sale consideration is accepted and Section 50C is not triggered. If SDV exceeds 110% of actual consideration, the **entire SDV** (not just the excess) becomes the deemed consideration.

```
# Calculator logic for Section 50C:
If stamp_duty_value <= (actual_sale_price × 1.10):
    full_value_of_consideration = actual_sale_price    # Section 50C NOT triggered
Else:
    full_value_of_consideration = stamp_duty_value     # Section 50C triggered
```

**Agreement date vs registration date:** Where the dates differ and part/full consideration was received via banking channels (cheque, bank draft, electronic mode) on or before the agreement date, the **SDV on the date of agreement** may be used instead (Finance Act, 2016 amendment).

**Buyer's side — Section 56(2)(x):** Mirror provision. If the buyer purchases immovable property for less than SDV and the difference exceeds ₹50,000 AND the 10% tolerance, the difference is taxable as "Income from Other Sources" for the buyer. Same 10% safe harbour applies.

---

## PART B: Exemption Sections

### B1. Section 54 — Reinvestment in new residential house

**Who can claim:** Only **Individuals and HUFs**. Companies, firms, LLPs, trusts, AOPs cannot claim.

**Source asset:** Must be a **long-term capital asset being a residential house property** (or land appurtenant thereto). Income from the property must be chargeable under "Income from House Property." Commercial property does not qualify.

**Destination asset:** Must be **one residential house situated in India**. Cannot be outside India (restriction introduced by Finance Act 2014, effective AY 2015-16). Should be purchased in the name of the seller.

**Time limits:**

| Action | Deadline |
|---|---|
| Purchase new house (before sale) | Up to **1 year before** date of transfer |
| Purchase new house (after sale) | Within **2 years after** date of transfer |
| Construct new house | Within **3 years after** date of transfer |
| Deposit in CGAS (if not yet invested) | Before **ITR filing due date** (typically 31 July) |

**Exemption calculation:**

```
Exemption = MINIMUM of:
    (a) Long-term capital gain amount
    (b) Rs. 10,00,00,000 (Rs. 10 crore)
    (c) Amount invested in new house + Amount deposited in CGAS
```

The exemption is based on the **capital gain amount** (not net sale consideration). This is a critical distinction from Section 54F.

**[BUDGET 2023 CHANGE] ₹10 crore cap:** Introduced by **Finance Act 2023**, effective **AY 2024-25 onwards**. A third proviso was inserted in Section 54(1) stating: where the cost of new asset exceeds ₹10 crore, the excess shall not be taken into account. A corresponding proviso in Section 54(2) ensures CGAS deposits also respect this cap. Prior to this, no upper limit existed. The government's stated rationale was to prevent high-net-worth assessees from claiming disproportionate deductions on luxury homes.

**Two-house option (Budget 2019 amendment):**

Provisos inserted after Section 54(1)(ii) by the Finance Act, 2019, effective AY 2020-21. Conditions: (a) the LTCG does not exceed **₹2 crore**, and (b) the assessee may purchase or construct **two residential houses in India**. This is a **strictly one-time lifetime option** — once exercised in any assessment year, it cannot be exercised again. This provision remains valid for AY 2026-27 and applies only to Section 54 (not Section 54F).

**CGAS (Capital Gains Account Scheme):**

If the capital gain is not fully utilized for purchase/construction by the **ITR filing due date** under Section 139(1), the unutilized amount must be deposited in a CGAS account before that date. **19 banks** are now authorized (expanded to include private banks and small finance banks per 2025 notification). Two account types exist: Type A (savings deposit) and Type B (term deposit). **Interest on CGAS is taxable** as "Income from Other Sources" at slab rates. If deposited funds are not utilized within the prescribed period (2 years for purchase, 3 years for construction), the **unutilized amount is deemed LTCG** in the year the deadline expires.

**Lock-in of new house:** If the new house is sold within **3 years** of purchase/construction, the exemption is reversed. The mechanism: the previously exempted amount is **deducted from the cost of acquisition** of the new house when computing capital gains on its sale (effectively increasing the taxable gain). The lock-in remains 3 years — no budget has changed it to 5 years.

**Under-construction property:** Investing in an under-construction flat **qualifies**, but construction must be **completed within 3 years** from the date of sale of the original property. ITAT rulings have generally treated booking/allotment with payment as valid, though some tribunals apply the 3-year construction timeline rather than the 2-year purchase timeline.

**Joint purchase with spouse:** Exemption corresponds to the **seller's portion of investment**. If the entire capital gain is reinvested by the seller (even in a jointly-owned property), full exemption can be claimed. Some ITAT rulings have allowed full exemption for investments in joint names since Section 54 does not explicitly mandate sole ownership.

**Multiple houses sold:** Capital gains from multiple residential houses can be invested in **one new house**, with exemption available separately on each capital gain.

---

### B2. Section 54EC — Investment in specified bonds

**Who can claim:** **Any assessee** — Individuals, HUFs, companies, firms, LLPs, AOPs, NRIs. Unlike Sections 54 and 54F, there is no entity restriction.

**Source asset:** Originally covered any LTCG, but **Finance Act 2018** (effective AY 2019-20) restricted eligibility to **LTCG arising from transfer of land or building or both only**. LTCG from shares, mutual funds, jewelry, or gold does not qualify.

**Qualifying bonds (current for FY 2025-26):**

| Bond Issuer | Status |
|---|---|
| **REC** (Rural Electrification Corporation) | ✅ Active |
| **PFC** (Power Finance Corporation) | ✅ Active |
| **IRFC** (Indian Railway Finance Corporation) | ✅ Active |
| **HUDCO** (Housing & Urban Development Corporation) | ✅ [BUDGET 2025 CHANGE] Newly notified w.e.f. 01-04-2025 (Notification 31/2025) |
| **IREDA** (Indian Renewable Energy Development Agency) | ✅ [BUDGET 2025 CHANGE] Newly notified 2025 (bonds issued post-July 2025) |
| NHAI (National Highways Authority of India) | ❌ Discontinued — stopped issuing from FY 2022-23 |

**Investment limit: ₹50 lakhs** — this limit applies **cumulatively** across the FY in which the original asset was transferred AND the subsequent FY. It is not a per-transaction limit.

**The March-April loophole and its closure:** Before AY 2015-16, taxpayers selling property in January-March could invest ₹50L before 31 March and ₹50L after 1 April (both within 6 months), totaling ₹1 crore. Courts supported this (*CIT v. C. Jaichander*, Madras HC). **Finance Act 2014** closed this loophole by inserting a second proviso to Section 54EC(1) clarifying that the combined investment in the current and subsequent FY cannot exceed ₹50 lakhs. **For AY 2026-27, the maximum exemption is firmly ₹50 lakhs.**

**Time limit:** Investment must be made **within 6 months from date of transfer**. There is **no CGAS facility** for Section 54EC — the actual bond investment must happen within the 6-month window.

**Lock-in period: 5 years** (increased from 3 years by **Finance Act 2018**, applicable to bonds issued on/after 01-04-2018).

**Early redemption consequences:** If bonds are transferred or converted into money before 5 years, the previously exempted capital gain **becomes taxable as LTCG** in the year of transfer/conversion (Section 54EC(2)).

**Loan against bonds: Prohibited.** Per Section 54EC(2), taking any loan or advance on the security of 54EC bonds is **deemed to be a conversion into money** on the date the loan is taken. The exemption is reversed, and the gain becomes taxable.

**Current interest rate: 5.25% per annum**, payable annually. Interest is fully taxable as "Income from Other Sources." No TDS is deducted. Face value per bond: ₹10,000. Minimum investment: ₹20,000 (2 bonds).

**Can 54EC be claimed alongside Section 54?** **Yes.** A taxpayer selling a residential house can split the capital gain: part invested in a new house (exempt under Section 54) and part invested in 54EC bonds (exempt under Section 54EC). Total exemption cannot exceed total capital gain.

**Can 54EC be claimed alongside Section 54F?** **Yes.** When selling commercial property or a plot of land, part of the consideration can be invested in a residential house (54F) and part in bonds (54EC).

---

### B3. Section 54F — Sale of any LTCA other than residential house

**How it differs from Section 54 — comparison matrix:**

| Feature | Section 54 | Section 54F |
|---|---|---|
| Source asset sold | Long-term **residential house** | Any LTCA **other than** residential house |
| Basis for full exemption | Invest the **capital gain amount** | Invest the entire **net sale consideration** |
| Partial investment | Uninvested portion of CG is taxable | **Proportional formula** applies |
| Ownership restriction | None | Must not own >1 residential house on transfer date |
| Future acquisition restriction | None | No other house purchase (2 yrs) / construction (3 yrs) |
| Two-house option | Available (LTCG ≤ ₹2 cr, once in lifetime) | **Not available** |
| Exemption formula | Lower of CG or investment (max ₹10 cr) | (CG × Investment) / Net Sale Consideration |

**Source asset — what qualifies:** Any long-term capital asset that is NOT a residential house property, including:

- **Plot of land (without building)** — yes, qualifies (not a residential house)
- Commercial property (shops, offices, warehouses) — yes
- Listed/unlisted shares, mutual fund units — yes
- Jewelry, gold — yes
- Agricultural land (if it qualifies as a capital asset) — yes

**Investment requirement — critical difference from Section 54:** For **full exemption**, the assessee must invest the entire **net sale consideration** (not just the capital gain) in a new residential house. Net sale consideration = full value of consideration minus transfer expenses (brokerage, legal fees).

**Proportional exemption formula:**

```
Exemption = (A × B) / C

Where:
  A = Amount invested in new residential house + CGAS deposit (capped at Rs. 10 crore)
  B = Long-term capital gain
  C = Net sale consideration

If A >= C: Exemption = B (full capital gain is exempt)
```

*Example:* Net sale consideration = ₹5 crore. LTCG = ₹4.5 crore. Invested in new house = ₹3 crore. Exemption = (3,00,00,000 × 4,50,00,000) / 5,00,00,000 = **₹2,70,00,000**.

**Ownership condition on date of transfer:** Exemption is denied if the assessee **owns more than one residential house** (other than the new house) on the date of transfer. This is heavily litigated — ITAT Delhi (*Kusum Sahgal v. ACIT*, 2023) held that fractional/joint ownership doesn't count, but Karnataka HC and Madras HC have held co-ownership disqualifies. No definitive Supreme Court ruling exists.

**Future restrictions:** After claiming 54F, the assessee must **not purchase** any other residential house within **2 years** or **construct** any within **3 years** of transfer. Violation causes the exempted LTCG to become taxable in the year of violation.

**[BUDGET 2023 CHANGE] ₹10 crore cap:** Yes, applicable to Section 54F as well. A proviso was inserted in Section 54F(1) by Finance Act 2023, effective AY 2024-25. In the proportional formula, the value of A (investment) is **capped at ₹10 crore**.

**CGAS rules, lock-in, and time limits:** Identical to Section 54 — CGAS deposit before ITR filing due date; 3-year lock-in on new house; purchase within 1 year before / 2 years after; construction within 3 years.

---

### B4. Section 54GB — Investment in eligible startup (brief overview)

Available only to **Individuals and HUFs**. Source asset: long-term residential property. Net consideration must be invested in equity shares of an eligible company (>25% shareholding, MSME or certified startup). The company must use funds for new plant and machinery within 1 year. Lock-in: 5 years for shares and assets.

**Practical status for AY 2026-27:** This provision is **effectively expired** — the deadline for transfers to eligible startups was **31 March 2022**, and for manufacturing companies was **31 March 2017**. Section 54GB is essentially a dead provision for new transfers and need not be included in the calculator.

---

## PART C: Interaction Rules and Combinations

### Eligibility matrix

| Sold Asset Type | Section 54 | Section 54EC | Section 54F |
|---|---|---|---|
| **Residential House (LTCG)** | ✅ Yes (Individual/HUF) | ✅ Yes (any assessee) | ❌ No (source must not be residential house) |
| **Plot of Land (LTCG)** | ❌ No (not residential house property) | ✅ Yes (land qualifies) | ✅ Yes (not a residential house) |
| **Commercial Property (LTCG)** | ❌ No | ✅ Yes (building qualifies) | ✅ Yes |
| **Listed Shares (LTCG)** | ❌ No | ❌ No (post-2018: only land/building) | ✅ Yes (Individual/HUF) |
| **Gold/Jewelry (LTCG)** | ❌ No | ❌ No (only land/building) | ✅ Yes (Individual/HUF) |

### Combination rules

**Can Section 54 + Section 54EC be claimed together?** **Yes.** This is a widely practiced and confirmed strategy. Sell residential house → invest part in new house (Section 54) + part in 54EC bonds. Example: LTCG = ₹80 lakhs → ₹30 lakhs in new house (exempt under 54) + ₹50 lakhs in bonds (exempt under 54EC) = **entire gain exempt**.

**Can Section 54F + Section 54EC be claimed together?** **Yes.** Sell commercial building → invest part of net consideration in new house (54F) + invest capital gain portion in bonds (54EC). Both exemptions valid simultaneously.

**Can Section 54 + Section 54F be claimed together?** **Logically impossible on the same transaction** — Section 54 requires the source to be a residential house, while Section 54F requires it to be anything other than a residential house. These are mutually exclusive for a single asset. However, per ITAT Hyderabad (*Venkata Ramana Umareddy v. DCIT*), if a taxpayer sells **multiple assets** in the same year (one residential house and one non-residential asset), they can claim Section 54 for one and Section 54F for the other, potentially investing in the **same new house**.

**Partial 54 + remaining 54EC?** **Yes, fully valid.** If the full capital gain is not covered by the Section 54 investment (e.g., invested less than the LTCG in a new house), the remaining gain can be exempted under 54EC by investing in bonds. Total exemption across all sections **cannot exceed total capital gain**.

```
# Calculator validation rule:
total_exemption = sec54_exemption + sec54EC_exemption + sec54F_exemption
assert total_exemption <= total_LTCG
```

---

## PART D: Calculator Logic Pseudocode

```python
# ============================================================
# INDIAN CAPITAL GAINS TAX EXEMPTION CALCULATOR — PSEUDOCODE
# Baseline: AY 2026-27 (FY 2025-26)
# ============================================================

# ---------- STEP 1: DETERMINE ASSET TYPE SOLD ----------
asset_type = INPUT("Type of asset sold",
    options=["Residential House", "Plot of Land", "Commercial Property",
             "Listed Shares", "Gold/Jewelry", "Other"])

# ---------- STEP 2: DETERMINE HOLDING PERIOD → STCG/LTCG ----------
date_of_purchase = INPUT("Date of purchase/acquisition")
date_of_sale     = INPUT("Date of sale/transfer")
mode_of_acquisition = INPUT("Mode of acquisition",
    options=["Self-purchased", "Inherited", "Gifted", "Under Will", "HUF Partition"])

# For inherited/gifted: get previous owner's purchase date
if mode_of_acquisition in ["Inherited", "Gifted", "Under Will", "HUF Partition"]:
    original_purchase_date = INPUT("Date previous owner originally purchased the asset")
    holding_start_date = original_purchase_date  # Include previous owner's period
else:
    holding_start_date = date_of_purchase

holding_months = months_between(holding_start_date, date_of_sale)

# Threshold determination
if asset_type in ["Residential House", "Plot of Land", "Commercial Property",
                   "Gold/Jewelry", "Other"]:
    ltcg_threshold = 24  # months
elif asset_type == "Listed Shares":
    ltcg_threshold = 12
# Special: Debt MF purchased after 01-04-2023 → always STCG

is_long_term = (holding_months > ltcg_threshold)

if NOT is_long_term:
    DISPLAY("STCG — taxed at applicable slab rates. No exemption under 54/54EC/54F.")
    COMPUTE stcg = sale_price - cost_of_acquisition - cost_of_improvement - transfer_expenses
    EXIT  # No exemptions for STCG

# ---------- STEP 3: COMPUTE CAPITAL GAIN ----------
assessee_type = INPUT("Assessee type",
    options=["Resident Individual", "Resident HUF", "NRI", "Company", "Firm/LLP", "Other"])

sale_price_actual  = INPUT("Actual sale price received")
stamp_duty_value   = INPUT("Stamp duty value (circle rate)")
transfer_expenses  = INPUT("Transfer expenses (brokerage, legal fees)")
cost_of_improvement = INPUT("Cost of improvements (after 01-04-2001 only)")

# --- Section 50C check (only for land/building) ---
if asset_type in ["Residential House", "Plot of Land", "Commercial Property"]:
    if stamp_duty_value > (sale_price_actual * 1.10):
        full_value_of_consideration = stamp_duty_value  # Section 50C applies
        WARN("Section 50C triggered: Stamp duty value exceeds 110% of sale price")
    else:
        full_value_of_consideration = sale_price_actual
else:
    full_value_of_consideration = sale_price_actual

net_sale_consideration = full_value_of_consideration - transfer_expenses

# --- Cost of Acquisition ---
if mode_of_acquisition in ["Inherited", "Gifted", "Under Will", "HUF Partition"]:
    cost_to_previous_owner = INPUT("Cost to previous owner who purchased")
    purchase_year = year_of(original_purchase_date)
else:
    cost_to_previous_owner = INPUT("Original purchase price")
    purchase_year = year_of(date_of_purchase)

# FMV as on 01-04-2001 (if purchased before 2001)
if purchase_year < 2001:
    fmv_2001 = INPUT("Fair Market Value as on 01-04-2001")
    base_cost = max(cost_to_previous_owner, fmv_2001)
    cii_purchase_year = 100  # FY 2001-02
else:
    base_cost = cost_to_previous_owner
    cii_purchase_year = CII_TABLE[purchase_year]

# --- Determine tax regime and compute gain ---
cii_sale_year = CII_TABLE[year_of(date_of_sale)]  # 376 for FY 2025-26

# NON-INDEXED GAIN (always computed)
gain_without_indexation = net_sale_consideration - base_cost - cost_of_improvement

# INDEXED GAIN (computed for grandfathered cases)
indexed_cost = (base_cost * cii_sale_year) / cii_purchase_year
indexed_improvement = (cost_of_improvement * cii_sale_year) / CII_TABLE[improvement_year]
gain_with_indexation = net_sale_consideration - indexed_cost - indexed_improvement

# --- Tax rate determination ---
is_property = asset_type in ["Residential House", "Plot of Land", "Commercial Property"]
acquired_before_jul2024 = date_of_purchase < date(2024, 7, 23)
is_grandfathered = (is_property
                    AND acquired_before_jul2024
                    AND assessee_type in ["Resident Individual", "Resident HUF"])

if is_grandfathered:
    tax_option_A = gain_without_indexation * 0.125   # 12.5% without indexation
    if gain_with_indexation > 0:
        tax_option_B = gain_with_indexation * 0.20   # 20% with indexation
    else:
        tax_option_B = INFINITY  # Cannot use loss from Option B
    
    if tax_option_A <= tax_option_B:
        chosen_regime = "12.5% without indexation"
        ltcg = gain_without_indexation
        tax_rate = 0.125
    else:
        chosen_regime = "20% with indexation"
        ltcg = gain_with_indexation
        tax_rate = 0.20
else:
    chosen_regime = "12.5% without indexation"
    ltcg = gain_without_indexation
    tax_rate = 0.125

# NOTE: For exemption purposes under 54/54EC/54F, the LTCG computed
# under the chosen regime is used. The exemption reduces the taxable gain.

# ---------- STEP 4: DETERMINE ELIGIBLE EXEMPTION SECTIONS ----------
eligible_sections = []

if asset_type == "Residential House" and assessee_type in ["Resident Individual", "Resident HUF", "NRI"]:
    eligible_sections.append("Section 54")

if asset_type in ["Residential House", "Plot of Land", "Commercial Property"]:
    eligible_sections.append("Section 54EC")  # Any assessee

if asset_type != "Residential House" and assessee_type in ["Resident Individual", "Resident HUF", "NRI"]:
    eligible_sections.append("Section 54F")

DISPLAY(f"Eligible exemptions: {eligible_sections}")

# ---------- STEP 5 & 6: TAKE INPUTS AND CALCULATE EACH EXEMPTION ----------

remaining_gain = ltcg  # Track remaining taxable gain

# --- Section 54 ---
if "Section 54" in eligible_sections:
    investment_in_new_house_54 = INPUT("Amount invested/to be invested in new residential house")
    cgas_deposit_54 = INPUT("Amount deposited/to be deposited in CGAS for Section 54")
    total_investment_54 = investment_in_new_house_54 + cgas_deposit_54

    # Two-house option check
    if ltcg <= 20000000:  # Rs. 2 crore
        two_house_option = INPUT("Exercise two-house option? (once in lifetime)", bool)
    
    # Rs. 10 crore cap
    total_investment_54 = min(total_investment_54, 100000000)  # Cap at Rs. 10 crore

    sec54_exemption = min(ltcg, total_investment_54)

    # Validation: investment must be in residential house in India
    # Validation: purchase within 1yr before / 2yr after; construction within 3yr
    remaining_gain -= sec54_exemption

# --- Section 54EC ---
if "Section 54EC" in eligible_sections AND remaining_gain > 0:
    bond_investment = INPUT("Amount invested in 54EC bonds (REC/PFC/IRFC/HUDCO/IREDA)")

    # Validations
    VALIDATE(bond_investment <= 5000000, "Maximum Rs. 50 lakhs in 54EC bonds")
    VALIDATE(investment_date <= date_of_sale + months(6), "Must invest within 6 months")

    sec54EC_exemption = min(remaining_gain, bond_investment)
    remaining_gain -= sec54EC_exemption

# --- Section 54F ---
if "Section 54F" in eligible_sections:
    investment_in_new_house_54F = INPUT("Amount invested in new residential house")
    cgas_deposit_54F = INPUT("CGAS deposit for Section 54F")
    total_investment_54F = investment_in_new_house_54F + cgas_deposit_54F
    
    # Rs. 10 crore cap
    total_investment_54F = min(total_investment_54F, 100000000)

    # Ownership validation
    houses_owned = INPUT("Number of residential houses owned on date of transfer (excluding new house)")
    VALIDATE(houses_owned <= 1, "Must not own more than 1 residential house for Section 54F")

    # Proportional formula
    if total_investment_54F >= net_sale_consideration:
        sec54F_exemption = ltcg  # Full exemption
    else:
        sec54F_exemption = (ltcg * total_investment_54F) / net_sale_consideration

    # Combined with 54EC check
    if "Section 54EC" in eligible_sections:
        total_exemption_check = sec54F_exemption + sec54EC_exemption
        if total_exemption_check > ltcg:
            sec54F_exemption = ltcg - sec54EC_exemption  # Reduce to avoid exceeding gain

    remaining_gain = ltcg - sec54F_exemption - sec54EC_exemption

# ---------- STEP 7: NET TAXABLE CAPITAL GAIN ----------
total_exemption = sec54_exemption + sec54EC_exemption + sec54F_exemption
assert total_exemption <= ltcg  # Cannot exceed total gain

net_taxable_ltcg = ltcg - total_exemption

# ---------- STEP 8: FINAL TAX LIABILITY ----------
tax_on_ltcg = net_taxable_ltcg * tax_rate
surcharge = compute_surcharge(tax_on_ltcg, total_income)  # Based on income slabs
cess = (tax_on_ltcg + surcharge) * 0.04  # 4% Health & Education Cess

total_tax_liability = tax_on_ltcg + surcharge + cess

# ---------- STEP 9: SHOW TIMELINE/DEADLINES ----------
DISPLAY("KEY DEADLINES:")
DISPLAY(f"  54EC bond investment deadline: {date_of_sale + months(6)}")
DISPLAY(f"  CGAS deposit deadline: ITR due date (typically 31 July {year_of(date_of_sale)+1})")
DISPLAY(f"  New house purchase deadline: {date_of_sale + years(2)}")
DISPLAY(f"  New house construction deadline: {date_of_sale + years(3)}")
DISPLAY(f"  Lock-in on new house: 3 years from purchase/construction")
DISPLAY(f"  Lock-in on 54EC bonds: 5 years from investment")
```

**Edge cases and validations the calculator should enforce:**

- If STCG: disable all exemption sections (54/54EC/54F apply only to LTCG)
- Section 54 + 54F cannot both apply to the same asset (mutually exclusive by definition)
- Section 54EC investment must actually occur within 6 months — no CGAS fallback
- Section 54F: validate ownership condition (≤1 house on transfer date)
- Section 54F: future restriction warning (no new house purchase for 2 years / construction for 3 years after claiming)
- Two-house option: disable if LTCG > ₹2 crore; track lifetime usage
- Grandfathering: only for resident Individual/HUF with property acquired before 23-Jul-2024
- NRIs: no grandfathering; always 12.5% without indexation; flag higher TDS requirements
- If Option B (20% with indexation) produces a loss, force Option A
- Section 50C: only for land/building; check 10% tolerance before overriding sale price

---

## PART E: Beginner-Friendly Explanations

**Indexation:** Adjusting your purchase price upward to account for inflation, so you're only taxed on your "real" profit, not the inflation portion.

**CII (Cost Inflation Index):** A number published by the government each year that represents how much prices have risen since 2001; used to calculate the inflation-adjusted purchase price.

**LTCG vs STCG:** Long-term capital gain is profit from selling an asset held beyond the threshold period (24 months for property); short-term is profit from selling sooner — LTCG gets lower tax rates and exemption benefits.

**Section 54:** Sell your old home, buy a new one within the time limit, and you don't have to pay capital gains tax on the amount reinvested.

**Section 54EC:** Instead of buying a new house, invest up to ₹50 lakhs of your property sale profit in government-approved bonds and skip the capital gains tax on that amount.

**Section 54F:** Sell a non-residential asset (like commercial property, land, or shares), invest the sale proceeds in a new residential house, and get capital gains tax exemption proportional to how much you reinvest.

**CGAS (Capital Gains Account Scheme):** A special bank account where you park your sale proceeds if you haven't yet bought/built the new house by the tax-filing deadline — it preserves your right to claim the exemption later.

**Net Sale Consideration:** The amount you actually receive from selling the property after deducting brokerage, legal fees, and other transfer costs.

**Cost of Acquisition:** What you (or the previous owner, in case of inheritance/gift) originally paid to buy the property.

**Cost of Improvement:** Money spent on significant upgrades or additions to the property (not routine maintenance) — only improvements after 01-04-2001 count.

**Stamp Duty Value (Section 50C):** The government-assessed value of the property; if your actual sale price is more than 10% below this value, the government treats the stamp duty value as your sale price for tax purposes.

**Lock-in Period:** The minimum time you must hold the new asset (3 years for a new house under Sections 54/54F, 5 years for 54EC bonds) — selling or encashing before this period reverses your tax exemption.

**Transfer Expenses:** Costs directly incurred to complete the sale — brokerage commissions, legal fees, advertising costs — which are deducted from the sale price to arrive at net sale consideration.

---

## PART F: Important Caveats

### Disclaimers the calculator should display

The calculator should prominently display: "This tool provides estimates based on general provisions of the Income Tax Act, 1961 as amended through Finance Act 2025. It does not constitute tax advice. Actual tax liability may differ based on individual circumstances, applicable surcharge slabs, state-specific stamp duty rules, and ongoing judicial interpretations. Consult a qualified Chartered Accountant before making investment decisions or filing returns. Tax laws are subject to change — verify provisions against the latest Finance Act and CBDT notifications."

Additionally: "Capital gains computation for inherited/gifted properties involves complex provenance tracing. NRI transactions involve additional TDS, repatriation, and DTAA considerations not fully captured here."

### Scenarios requiring CA consultation

- **NRI property sales** — higher TDS (12.5%/30% on entire consideration), Lower Deduction Certificate (Form 13) required, Form 15CA/15CB for repatriation, DTAA implications, and grandfathering not available
- **Multiple property transactions** in the same year — interaction of exemptions across transactions
- **Inherited property disputes** — determining "previous owner" in long inheritance chains, contested FMV as on 01-04-2001
- **Section 54F ownership condition** — conflicting High Court rulings on what constitutes "owning" a residential house (co-ownership, ancestral property, undivided share)
- **Redevelopment/reconstruction** — treatment of TDR/FSI rights, whether area received constitutes one or multiple houses
- **Property received under JDA (Joint Development Agreement)** — timing of capital gains trigger, Section 45(5A) provisions
- **Clubbing provisions** — property purchased in minor child's name, spouse transfers

### Common mistakes in claiming exemptions

**Missing the CGAS deadline** is the most frequent error — if you haven't invested the full capital gain amount by the ITR filing due date (typically 31 July), you must deposit the balance in CGAS before that date. Missing this can result in total denial of exemption, though recent ITAT rulings (*Nitin Bhatia*, Hyderabad ITAT 2025) have provided relief where actual reinvestment occurred within time despite CGAS non-compliance.

**Not completing construction within 3 years** leaves the unutilized CGAS deposits taxable as LTCG. Under-construction bookings with builders carry risk if the builder delays beyond the 3-year window.

**Selling the new house within the 3-year lock-in** reverses the entire Section 54/54F exemption, often resulting in a large unexpected tax bill.

**Exceeding the ₹50 lakh limit on 54EC bonds** — taxpayers sometimes still attempt the old March-April strategy (investing ₹1 crore across two FYs), which was closed by Finance Act 2014.

**Taking a loan against 54EC bonds** during the 5-year lock-in is deemed a conversion into money, triggering immediate taxation.

**Claiming Section 54F while owning multiple houses** — the ownership condition is checked on the date of transfer. Owning even a co-owned second property may disqualify the claim depending on jurisdiction.

**Buying the new house in someone else's name** (child, spouse, parent) — exemption can be denied since the section requires investment by the assessee.

### Recent tribunal and court rulings affecting interpretation (2023–2025)

**ITAT Mumbai (April 2025)** ruled that Section 54 exemption cannot be denied when husband and wife sell two different properties and jointly invest in a single new property — each spouse gets proportionate exemption. This confirms a liberal, purposive interpretation of the provision.

**ITAT Mumbai (February 2026)** held that multiple floors in a **single redeveloped building** constitute "one residential house" for Section 54 purposes — a major relief for taxpayers in redevelopment situations in cities like Mumbai.

**Delhi HC (April 2025)** upheld that investment in **multiple adjacent residential units** qualifies for Section 54F where the units function as a single dwelling, following the earlier *Gita Duggal* precedent.

**ITAT Hyderabad and Ahmedabad (2025)** ruled that Section 54/54F exemption is **not denied merely for failure to deposit in CGAS**, where actual reinvestment occurred within the statutory timeframe — procedural non-compliance does not override substantive compliance.

These rulings collectively indicate a **taxpayer-friendly judicial trend**, but they are tribunal-level decisions and may not bind all jurisdictions. The calculator should flag these as areas of potential dispute.