import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-02-25.clover',
  typescript: true,
});

export const PRICE_MAP = {
  basis: 29900,      // 299 DKK i øre
  standard: 59900,   // 599 DKK
  udvidet: 99900,    // 999 DKK
  akut: 149900,      // 1.499 DKK
} as const;

export type ServiceLevel = keyof typeof PRICE_MAP;

export const PLATFORM_FEE_PERCENT = 15;

export function calculatePlatformFee(amount: number): number {
  return Math.round(amount * PLATFORM_FEE_PERCENT / 100);
}
