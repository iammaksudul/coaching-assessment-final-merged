import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const tiers = await sql`
      SELECT * FROM pricing_tiers WHERE active = true ORDER BY sort_order ASC
    `
    const prices = tiers.map((t: any) => ({
      tier: t.id,
      name: t.name,
      assessments: t.assessments,
      isFree: t.is_free,
      isPopular: t.is_popular,
      features: t.features || [],
      monthly: {
        id: t.stripe_monthly_price_id,
        amount: t.monthly_price,
        currency: "usd",
        interval: "month",
      },
      annual: {
        id: t.stripe_annual_price_id,
        amount: t.annual_price,
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
