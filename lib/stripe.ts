import Stripe from 'stripe'

// Initialize Stripe - will throw at runtime if STRIPE_SECRET_KEY is not set
// This is fine because these routes won't be called during build
function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
    typescript: true,
  })
}

export const stripe = getStripe()

export const formatAmountForStripe = (amount: number): number => {
  // Convert BDT to paisa (smallest currency unit)
  // Stripe expects amounts in the smallest currency unit
  return Math.round(amount * 100)
}

export const formatAmountFromStripe = (amount: number): number => {
  // Convert paisa back to BDT
  return amount / 100
}

