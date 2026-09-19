import { headers } from 'next/headers';
import LandingPageClient from './LandingPageClient';
import { getTier, TIER_CAPS } from '@/lib/planLimits';
export default async function Page() {
  const user = null;

  const headersList = await headers();
  const country = headersList.get('x-vercel-ip-country') || 'US';
  const tier = getTier(country);
  const disableLifetime = tier === 'T4';

  // ── Default T1 — Full USD ─────────────────────────────────────────────────
  // (USA, UK, EU, Canada, Australia, Japan, Singapore, South Korea, etc.)
  let pricing = {
    basic: { price: '$0', period: '/mo' },
    pro: {
      monthly:  { price: '$5',     period: '/mo', perk: '' },
      yearly:   { price: '$32',    period: '/yr', perk: 'Save ~46%' },
      lifetime: { price: '$69.99', period: '',    perk: 'Pay once, yours forever' },
    },
  };

  // ── T3 — India (INR) ─────────────────────────────────────────────────────
  if (country === 'IN') {
    pricing = {
      basic: { price: '₹0', period: '/mo' },
      pro: {
        monthly:  { price: '₹199',   period: '/mo', perk: '' },
        yearly:   { price: '₹1,199', period: '/yr', perk: 'Save ~50%' },
        lifetime: { price: '₹2,999', period: '',    perk: 'Pay once, yours forever' },
      },
    };
  }

  // ── T2 — Developing markets (discounted USD) ───────────────────────────────
  // Brazil, Mexico, Turkey, SE Asia, Eastern Europe etc.
  else if (T2_COUNTRIES.has(country.toUpperCase())) {
    pricing = {
      basic: { price: '$0', period: '/mo' },
      pro: {
        monthly:  { price: '$3',  period: '/mo', perk: '' },
        yearly:   { price: '$19', period: '/yr', perk: 'Save ~47%' },
        lifetime: { price: '$42', period: '',    perk: 'Pay once, yours forever' },
      },
    };
  }

  // ── T4 — Frontier markets (deeply discounted USD, no lifetime) ────────────
  else if (tier === 'T4') {
    pricing = {
      basic: { price: '$0', period: '/mo' },
      pro: {
        monthly:  { price: '$1.49', period: '/mo', perk: '' },
        yearly:   { price: '$9',    period: '/yr', perk: 'Save ~50%' },
        lifetime: { price: '$0',    period: '',    perk: '' }, // hidden — disableLifetime=true
      },
    };
  }

  // Page limits to display in feature bullets — capped by the user's regional tier
  const tierCap = TIER_CAPS[tier];
  // Pro plan (monthly/yearly) cap = min(600, tierCap)
  const proPageCap = Math.min(600, tierCap.pagesPerMonth);
  const proFileCap = Math.min(60, tierCap.maxPagesPerFile);
  // Lifetime cap = min(800, tierCap)
  const lifetimePageCap = Math.min(800, tierCap.pagesPerMonth);
  const lifetimeFileCap = Math.min(80, tierCap.maxPagesPerFile);

  return (
    <LandingPageClient
      pricing={pricing}
      disableLifetime={disableLifetime}
      limits={{ proPageCap, proFileCap, lifetimePageCap, lifetimeFileCap }}
      isLoggedIn={!!user}
    />
  );
}
