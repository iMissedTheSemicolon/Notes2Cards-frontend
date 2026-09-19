/**
 * Single source of truth for per-plan quota limits + regional tier caps.
 *
 * Used by:
 *  - /api/process (server-side enforcement)
 *  - AppClient.tsx (sidebar usage display)
 *
 * Regional tiers (T1–T4) apply a secondary cap based on the user's IP country.
 * getLimits(plan, country) returns whichever cap is *lower* — the plan cap or
 * the tier cap. This ensures paying users in lower-revenue regions don't get
 * more pages than the revenue supports.
 */

// ── Per-plan limits (unchanged) ──────────────────────────────────────────────
export const PLAN_LIMITS = {
  free:     { pagesPerMonth: 40,  maxPagesPerFile: 20 },
  monthly:  { pagesPerMonth: 600, maxPagesPerFile: 60 },
  annual:   { pagesPerMonth: 600, maxPagesPerFile: 60 },
  lifetime: { pagesPerMonth: 800, maxPagesPerFile: 80 },
} as const;

export type PlanId = keyof typeof PLAN_LIMITS;

// ── Regional tier caps ────────────────────────────────────────────────────────
// Source: regional_pricing_strategy.md
// T1 = full; T2 = 40% less revenue; T3 = 55% less revenue; T4 = 70% less revenue
export type RegionTier = 'T1' | 'T2' | 'T3' | 'T4';

export const TIER_CAPS: Record<RegionTier, { pagesPerMonth: number; maxPagesPerFile: number }> = {
  T1: { pagesPerMonth: 800, maxPagesPerFile: 80 },  // Full
  T2: { pagesPerMonth: 700, maxPagesPerFile: 70 },  // Brazil, Mexico, Turkey, etc.
  T3: { pagesPerMonth: 600, maxPagesPerFile: 60 },  // India, Indonesia, etc.
  T4: { pagesPerMonth: 500, maxPagesPerFile: 50 },  // Bangladesh, Nepal, Pakistan, etc.
};

// ── Country → Tier mapping ────────────────────────────────────────────────────
const COUNTRY_TIERS: Record<string, RegionTier> = {
  // T1 — Premium (default, no entry needed — falls back to T1)

  // T2 — Developing
  BR: 'T2', MX: 'T2', TR: 'T2', PL: 'T2', RO: 'T2',
  CL: 'T2', CO: 'T2', MY: 'T2', TH: 'T2', AR: 'T2',
  ZA: 'T2', PE: 'T2', UA: 'T2', VN: 'T2',

  // T3 — Emerging
  IN: 'T3', ID: 'T3', PH: 'T3', EG: 'T3', MA: 'T3',
  NG: 'T3', TZ: 'T3', KE: 'T3', LK: 'T3',

  // T4 — Frontier
  BD: 'T4', NP: 'T4', PK: 'T4', GH: 'T4', KH: 'T4',
  ET: 'T4', MM: 'T4', UG: 'T4', MZ: 'T4',
};

/** Returns the regional tier for a given ISO country code (default T1). */
export function getTier(country?: string | null): RegionTier {
  if (!country) return 'T1';
  return COUNTRY_TIERS[country.toUpperCase()] ?? 'T1';
}

/**
 * Returns effective limits for a given plan + optional country.
 * Takes the MINIMUM of the plan cap and the regional tier cap so:
 * - Free users always get at most 40 pages regardless of tier.
 * - Pro users in T3 get min(600, 600) = 600 pages per month.
 * - Lifetime users in T3 get min(800, 600) = 600 pages per month.
 * - Lifetime users in T4 get min(800, 500) = 500 pages per month.
 */
export function getLimits(plan: string, country?: string | null) {
  const planCap = PLAN_LIMITS[plan as PlanId] ?? PLAN_LIMITS.free;
  const tier = getTier(country);
  const tierCap = TIER_CAPS[tier];

  return {
    pagesPerMonth: Math.min(planCap.pagesPerMonth, tierCap.pagesPerMonth),
    maxPagesPerFile: Math.min(planCap.maxPagesPerFile, tierCap.maxPagesPerFile),
    tier,
  };
}
