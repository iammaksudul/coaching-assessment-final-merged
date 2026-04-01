import { NextResponse } from "next/server"

const SUBSCRIPTION_TIERS = {
  TIER_1_5: {
    name: "Starter",
    assessments: "1-5 assessments/month",
    productId: "prod_UFXB1y5VSnTxtg",
    monthly: { id: "price_1TH27JBUtOJdpR7kWnVccGJ8", amount: 3900 },
    annual: { id: "price_1THD09BUtOJdpR7kV7dp6ds3", amount: 43300 },
  },
  TIER_6_12: {
    name: "Professional",
    assessments: "6-12 assessments/month",
    productId: "prod_UFXCVxwgqKlXuc",
    monthly: { id: "price_1TH28FBUtOJdpR7kjkom9VW2", amount: 8900 },
    annual: { id: "price_1THD1JBUtOJdpR7k1kbwM9cG", amount: 98800 },
  },
  TIER_13_20: {
    name: "Business",
    assessments: "13-20 assessments/month",
    productId: "prod_UFXDNqxIHcg0hO",
    monthly: { id: "price_1TH297BUtOJdpR7krKkpbg7m", amount: 13900 },
    annual: { id: "price_1THD29BUtOJdpR7kpsruv2hH", amount: 154300 },
  },
  TIER_21_40: {
    name: "Enterprise",
    assessments: "21-40 assessments/month",
    productId: "prod_UFXEMxXVLtfbcr",
    monthly: { id: "price_1TH29yBUtOJdpR7kLYBJCyXu", amount: 23900 },
    annual: { id: "price_1THD3MBUtOJdpR7kq8YEGe8V", amount: 265300 },
  },
  TIER_40_PLUS: {
    name: "Enterprise Plus",
    assessments: "40+ assessments/month",
    productId: "prod_UFXFomFU9qm5zZ",
    monthly: { id: "price_1TH2AsBUtOJdpR7kAPXYiu0Z", amount: 38900 },
    annual: { id: "price_1THD48BUtOJdpR7kcHZpOVpM", amount: 431800 },
  },
}

export { SUBSCRIPTION_TIERS }

export async function GET() {
  try {
    const prices = Object.entries(SUBSCRIPTION_TIERS).map(([tier, config]) => ({
      tier,
      name: config.name,
      assessments: config.assessments,
      monthly: {
        id: config.monthly.id,
        amount: config.monthly.amount,
        currency: "usd",
        interval: "month",
      },
      annual: {
        id: config.annual.id,
        amount: config.annual.amount,
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
