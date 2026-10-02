/**
 * Session 54 — Capital Gains Calculator fixes, pinned to a real case.
 *
 * Known answers come from a dual-reviewed working (two independent
 * computations that agreed to the rupee) for a residential building sold in
 * FY 2026-27: net sale 1,88,00,000; Option A gain 1,78,20,000 (12.5%, no
 * indexation); Option B gain 1,63,36,000 (20%, indexed with CII 384);
 * new house 75 L + bonds 50 L.
 *
 *  1. sectionLabel     — 54 → 82, 54EC → 85, 54F → 86 for sales from 1-Apr-2026
 *  2. computeExemptions — same formulas Step 5 always used
 *  3. computeFinalOutcome — A vs B compared AFTER exemptions (the law's way);
 *     the FMV-2001 sensitivity is the case where that flips the answer.
 */
import { sectionLabel, computeExemptions, computeFinalOutcome } from './CapitalGainsCalculator';

// The real case's Step-4 output + Step-5 inputs, as formData holds them.
const realCase = (overrides = {}) => ({
  assetType: 'residential',
  computedNetSaleConsideration: 1_88_00_000,
  computedGainA: 1_78_20_000,
  computedGainB: 1_63_36_000,
  sec54Investment: '7500000',
  sec54CGASDeposit: '',
  sec54ECInvestment: '5000000',
  ...overrides,
});

describe('sectionLabel — renumbering follows the sale date', () => {
  test('sale on/after 1-Apr-2026 shows the new number with the old one', () => {
    expect(sectionLabel('54', '2026-11-10')).toBe('Section 82 (old 54)');
    expect(sectionLabel('54EC', '2026-04-01')).toBe('Section 85 (old 54EC)');
    expect(sectionLabel('54F', '2027-01-05')).toBe('Section 86 (old 54F)');
  });
  test('earlier sales, or no date yet, keep the old number', () => {
    expect(sectionLabel('54', '2026-03-31')).toBe('Section 54');
    expect(sectionLabel('54EC', '2025-06-15')).toBe('Section 54EC');
    expect(sectionLabel('54F', '')).toBe('Section 54F');
  });
});

describe('computeExemptions', () => {
  test('house 75 L + bonds 50 L on the Option B gain', () => {
    const e = computeExemptions(1_63_36_000, 1_88_00_000, realCase());
    expect(e).toEqual({ sec54: 75_00_000, sec54F: 0, sec54EC: 50_00_000, total: 1_25_00_000 });
  });
  test('bonds are capped at 50 L and the total never exceeds the gain', () => {
    const e = computeExemptions(60_00_000, 1_88_00_000, realCase({ sec54ECInvestment: '9000000' }));
    expect(e.sec54EC).toBe(50_00_000);
    expect(e.total).toBe(60_00_000);
  });
  test('54F (plot sale) is proportional and needs both ownership ticks', () => {
    const plot = { assetType: 'plot', sec54FInvestment: '9400000', sec54ECInvestment: '',
      sec54FOwnsMaxOneHouse: true, sec54FNoFutureHousePurchase: true };
    // half the net sale reinvested → half the gain exempt
    expect(computeExemptions(1_00_00_000, 1_88_00_000, plot).sec54F).toBe(50_00_000);
    expect(computeExemptions(1_00_00_000, 1_88_00_000, { ...plot, sec54FOwnsMaxOneHouse: false }).sec54F).toBe(0);
  });
});

describe('computeFinalOutcome — A vs B AFTER exemptions', () => {
  test('real case: Option A wins (6,91,600 vs 7,97,888)', () => {
    const o = computeFinalOutcome(realCase());
    expect(o.option).toBe('A');
    expect(o.netTaxableGain).toBe(53_20_000);
    expect(o.totalTax).toBe(6_91_600);
    expect(o.other.option).toBe('B');
    expect(o.other.totalTax).toBe(7_97_888);
  });

  test('FMV-2001 sensitivity: exemptions FLIP the answer to Option B', () => {
    // FMV 10 L instead of cost 4 L: gains A 1,72,20,000 / B 1,40,32,000.
    // Before exemptions A is lower (22,38,600 vs 29,18,656); after house 75 L +
    // bonds 50 L, B is lower — the case the old calculator got wrong.
    const o = computeFinalOutcome(realCase({ computedGainA: 1_72_20_000, computedGainB: 1_40_32_000 }));
    expect(o.option).toBe('B');
    expect(o.totalTax).toBe(3_18_656);
    expect(o.other.totalTax).toBe(6_13_600);
  });

  test('B gain fully covered → nil tax under Option B', () => {
    const o = computeFinalOutcome(realCase({ sec54Investment: '11336000' }));
    expect(o.option).toBe('B');
    expect(o.totalTax).toBe(0);
  });

  test('only one option available (B null) → that option, no comparison', () => {
    const o = computeFinalOutcome(realCase({ computedGainB: null }));
    expect(o.option).toBe('A');
    expect(o.other).toBeNull();
  });

  test('a tie keeps Option A (same tie rule as Step 4)', () => {
    // Both taxable gains nil → both taxes 0 → A
    const o = computeFinalOutcome(realCase({ sec54Investment: '50000000' }));
    expect(o.totalTax).toBe(0);
    expect(o.option).toBe('A');
  });

  test('nothing stored yet → null (Steps 5-6 fall back to Step 4)', () => {
    expect(computeFinalOutcome({ assetType: 'residential' })).toBeNull();
  });
});
