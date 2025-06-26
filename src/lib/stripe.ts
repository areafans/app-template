import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export const stripeConfig = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
}

// Price configurations - these should match your Stripe dashboard
export const SUBSCRIPTION_PLANS = {
  basic: {
    priceId: 'price_basic_monthly', // Replace with actual Stripe price ID
    name: 'Basic Plan',
    price: 999, // $9.99 in cents
    interval: 'month' as const,
    features: ['Feature 1', 'Feature 2', 'Feature 3'],
  },
  premium: {
    priceId: 'price_premium_monthly', // Replace with actual Stripe price ID
    name: 'Premium Plan',
    price: 1999, // $19.99 in cents
    interval: 'month' as const,
    features: ['All Basic features', 'Premium Feature 1', 'Premium Feature 2'],
  },
  annual: {
    priceId: 'price_annual', // Replace with actual Stripe price ID
    name: 'Annual Plan',
    price: 19999, // $199.99 in cents
    interval: 'year' as const,
    features: ['All Premium features', 'Annual discount', 'Priority support'],
  },
}

export const DONATION_AMOUNTS = [
  { amount: 500, label: '$5' },   // $5 in cents
  { amount: 1000, label: '$10' }, // $10 in cents
  { amount: 2500, label: '$25' }, // $25 in cents
  { amount: 5000, label: '$50' }, // $50 in cents
  { amount: 10000, label: '$100' }, // $100 in cents
]