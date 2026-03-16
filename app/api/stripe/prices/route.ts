import { NextResponse } from "next/server"

// Define subscription tiers with corrected pricing
const SUBSCRIPTION_TIERS = {
  TIER_1_5: {
    name: "Starter",
    assessments: "1-5 assessments/month",
    monthly: 3900, // $39.00 in cents
    annual: 43300, // $433.00 in cents (7.5% discount)
  },
  TIER_6_12: {
    name: "Professional",
    assessments: "6-12 assessments/month",
    monthly: 8900, // $89.00 in cents
    annual: 98800, // $988.00 in cents
  },
  TIER_13_20: {
    name: "Business",
    assessments: "13-20 assessments/month",
    monthly: 13900, // $139.00 in cents
    annual: 154300, // $1,543.00 in cents
  },
  TIER_21_40: {
    name: "Enterprise",
    assessments: "21-40 assessments/month",
    monthly: 23900, // $239.00 in cents
    annual: 265300, // $2,653.00 in cents
  },
  TIER_40_PLUS: {
    name: "Enterprise Plus",
    assessments: "40+ assessments/month",
    monthly: 38900, // $389.00 in cents
    annual: 431800, // $4,318.00 in cents
  },
}

export async function GET() {
  try {
    // In production, these would be actual Stripe price IDs
    // For preview, we'll return mock data
    const prices = Object.entries(SUBSCRIPTION_TIERS).map(([tier, config]) => ({
      tier,
      name: config.name,
      assessments: config.assessments,
      monthly: {
        id: `price_monthly_${tier.toLowerCase()}`,
        amount: config.monthly,
        currency: "usd",
        interval: "month",
      },
      annual: {
        id: `price_annual_${tier.toLowerCase()}`,
        amount: config.annual,
        currency: "usd",
        interval: "year",
      },
    }))

    return NextResponse.json({ prices })
  } catch (error) {
    console.error("Error fetching prices:", error)
    return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 })
  }
}
