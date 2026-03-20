# Capital Gains Tax Exemption Calculator — Research Prompt

I'm building a Capital Gains Tax Exemption Calculator for property sales in India, aimed at **complete beginners** — people who just know "I sold my house, how do I save tax?" and nothing else. The calculator needs to hand-hold them through the entire process.

I need you to do detailed research on the relevant Income Tax Act sections and produce a structured summary that a developer can use to build this calculator. Use **AY 2026-27 (FY 2025-26)** rules as the baseline, and flag anything that changed in Budget 2023, 2024, or 2025.

## The user journey the calculator will follow

The calculator will guide users through these steps:
1. **What did you sell?** (Residential house / Land / Commercial property / Other asset)
2. **When did you buy it and when did you sell it?** (To determine short-term vs long-term)
3. **What were the costs?** (Purchase price, improvements, sale price, expenses)
4. **Compute the capital gain** (with indexation vs without indexation comparison)
5. **Show exemption options available** (based on what they sold, automatically filter which sections apply)
6. **Let them input their reinvestment plans** (buying house, constructing house, buying bonds)
7. **Calculate final tax liability after exemptions**
8. **Show deadlines and action items** (what to do by when)

---

## PART A: Capital Gain Computation Basics

I need this so the calculator can explain things to beginners in simple language.

### 1. Short-term vs Long-term classification

- For immovable property (land, building): What is the holding period threshold? (Was it changed from 36 months to 24 months? When?)
- For other capital assets: different thresholds?
- How is the holding period calculated? (Date of purchase to date of sale, or date of agreement?)
- Special cases: inherited property (holding period includes previous owner's period?), gifted property

### 2. Cost of Acquisition rules

- Property purchased before 01-04-2001: Higher of actual cost or FMV as on 01-04-2001
- Inherited property: Cost to previous owner, but FMV rule still applies if previous owner bought before 2001
- Gifted property: Cost to the person who gifted it
- Property received under will: Same as inheritance?

### 3. Cost Inflation Index (CII)

- Provide the complete CII table from 2001-02 (base year 100) to 2025-26
- Confirm base year is 2001-02 (changed from 1981-82)
- Indexation formula: `Indexed Cost = (Cost × CII of sale year) / CII of purchase year`

### 4. Tax rate options post Budget 2024

- Option A: 20% with indexation benefit (available only for properties acquired before 23-Jul-2024?)
- Option B: 12.5% without indexation
- Clarify the exact rules — which option is available to whom? Is Option A grandfathered only for pre-23-Jul-2024 acquisitions?
- For properties acquired after 23-Jul-2024: Only 12.5% without indexation?
- **This is critical** — please research the exact Budget 2024 amendment and any subsequent clarifications

### 5. Section 50C — Stamp duty value

- If actual sale price is less than stamp duty value, which value is considered as sale consideration?
- Is there a tolerance limit (e.g., 10% or 110% rule)?
- How should the calculator handle this?

---

## PART B: Exemption Sections (detailed research)

For each section below, provide: **Who can claim, What conditions must be met, Exact calculation formula, Time limits, Lock-in rules, What happens if conditions are violated, Recent amendments**

### 1. Section 54 — Buy/construct a new residential house

- **Eligibility**: Individual/HUF only? What about partnership firms, companies?
- **Source asset**: Must be a long-term residential house property? What about plot of land with a house?
- **Destination**: Must be a residential house in India
- **Purchase timeline**: 1 year before sale to 2 years after sale — confirm
- **Construction timeline**: 3 years from date of sale — confirm
- **Exemption calculation**:
  - If amount invested in new house >= capital gain: Full exemption
  - If amount invested < capital gain: Exemption = amount invested only
  - Is the exemption based on the capital gain amount or net sale consideration?
- **Rs. 10 Crore cap**: Introduced in which budget? Does it cap the exemption amount or the investment amount?
- **Two house option**: Budget 2019 amendment — can claim for 2 houses if LTCG ≤ Rs. 2 Crore. Is this a one-time lifetime option? Still valid?
- **CGAS (Capital Gains Account Scheme)**:
  - When must the amount be deposited?
  - Which banks offer CGAS?
  - What if the money is not utilized within the time limit — what happens?
  - Interest earned on CGAS — taxable?
- **Lock-in of new house**: What if sold within 3 years?
  - The exempted capital gain gets added back as LTCG in the year of sale of new house?
- **Under-construction property**: Can you claim exemption for booking an under-construction flat? Payment timeline issues?
- **Joint purchase**: If new house is bought jointly with spouse — does it affect the claim?

### 2. Section 54EC — Invest in specified bonds

- **Eligibility**: Any assessee? Or only Individual/HUF?
- **Source asset**: Any long-term capital asset (land, building, or both)? Or only land and building?
- **Which bonds qualify**: NHAI, REC, PFC, IRFC — confirm the full current list for 2025-26
- **Investment limit**: Rs. 50 Lakhs — is this per financial year or per transaction or per assessee?
  - If sale happens in March and bonds bought in March + more in April (next FY), can you invest Rs. 50L + Rs. 50L = Rs. 1 Crore?
  - Has this loophole been closed?
- **Time limit**: Within 6 months of the date of transfer
- **Lock-in period**: 5 years
- **Early redemption**: What happens if bonds are redeemed/transferred before 5 years?
- **Loan against bonds**: Allowed or not?
- **Current interest rate**: Approximate rate these bonds pay
- **Can be claimed alongside Section 54?** Both for the same transaction?
- **Exemption = amount invested in bonds (subject to Rs. 50L cap)**

### 3. Section 54F — Sale of any long-term capital asset OTHER than a residential house

- **How it differs from Section 54**: Section 54 = sell house, buy house. Section 54F = sell non-house asset, buy house.
- **Source asset**: Must NOT be a residential house. So this applies to: land (without building), commercial property, shares, jewelry, etc.?
  - What about a plot of land — is that a "residential house" or not?
- **Destination**: Purchase or construct ONE residential house in India
- **Key difference from S.54**: Must invest the **entire net sale consideration** (not just capital gain) for full exemption
- **Proportional exemption formula**:
  ```
  Exemption = (Capital Gain × Amount Invested in new house) / Net Sale Consideration
  ```
  - Confirm this formula
- **Ownership condition**: On the date of transfer, the assessee should not own more than one residential house (other than the new one being purchased)
- **Future restriction**: Should not purchase any other residential house within 2 years or construct within 3 years of the transfer (other than the exemption house)
- **Rs. 10 Crore cap**: Applicable to 54F as well?
- **CGAS rules**: Same as Section 54?
- **Lock-in**: Same 3-year rule as Section 54?
- **Time limits**: Same as Section 54 (1yr before / 2yr after purchase, 3yr construction)?

### 4. Section 54GB (if relevant) — Investment in eligible startup

- Brief overview — is this commonly used? Should the calculator include it?

---

## PART C: Interaction rules and combinations

Provide a clear matrix:

| Sold Asset Type | Section 54 | Section 54EC | Section 54F |
|---|---|---|---|
| Residential House (LTCG) | ? | ? | ? |
| Land/Plot (LTCG) | ? | ? | ? |
| Commercial Property (LTCG) | ? | ? | ? |

- Can 54 + 54EC be claimed together on same transaction? (Commonly done?)
- Can 54F + 54EC be claimed together?
- Can 54 + 54F be claimed together? (Should be impossible since they're for different asset types?)
- If someone claims partial exemption under 54 and remaining under 54EC — is this allowed?
- Total exemption cannot exceed the total capital gain — confirm

---

## PART D: Calculator logic pseudocode

Provide step-by-step pseudocode for the calculator:

```
Step 1: Determine asset type sold
Step 2: Determine holding period → short-term or long-term
Step 3: Compute capital gain (with and without indexation if applicable)
Step 4: Based on asset type, show which exemption sections are available
Step 5: For each applicable section, take user inputs (investment amount, dates)
Step 6: Calculate exemption for each section
Step 7: Calculate net taxable capital gain after all exemptions
Step 8: Calculate final tax liability
Step 9: Show timeline/deadlines
```

Include all edge cases and validation rules in the pseudocode.

---

## PART E: Beginner-friendly explanations

For each concept, provide a **one-line plain English explanation** that I can use as helper text/tooltips in the UI. The target audience literally knows nothing about tax — explain like they're 5. Examples:

- "Cost Inflation Index adjusts your old purchase price for inflation, so you're not taxed on inflation gains"
- "CGAS is a special bank account where you park the money temporarily if you haven't bought the new house yet"

Provide these for:
- Indexation
- CII (Cost Inflation Index)
- LTCG vs STCG
- Section 54
- Section 54EC
- Section 54F
- CGAS (Capital Gains Account Scheme)
- Net Sale Consideration
- Cost of Acquisition
- Cost of Improvement
- Stamp Duty Value (Section 50C)
- Lock-in period
- Transfer Expenses

---

## PART F: Important caveats for the calculator

1. Things the calculator should warn users about (as disclaimers)
2. Scenarios where the user should consult a CA (e.g., NRI sales, multiple properties, inherited property disputes)
3. Common mistakes people make when claiming these exemptions
4. Recent tribunal/court rulings that affect interpretation (if any major ones)

---

## Output format

Structure your response with clear headings for each part (A through F). Use tables where helpful. For formulas, use code blocks. Flag anything that changed in Budget 2023/2024/2025 with a **[BUDGET 2023/2024/2025 CHANGE]** tag so I can highlight what's new vs established law.
