import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/get-auth-user"
import { sql } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const tiers = await sql`SELECT * FROM pricing_tiers ORDER BY sort_order ASC`
    return NextResponse.json({ tiers })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tiers" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { tier } = await req.json()
    if (!tier?.id) return NextResponse.json({ error: "Missing tier id" }, { status: 400 })

    await sql`
      UPDATE pricing_tiers SET
        name = ${tier.name},
        assessments = ${tier.assessments},
        monthly_price = ${tier.monthly_price},
        annual_price = ${tier.annual_price},
        stripe_product_id = ${tier.stripe_product_id || null},
        stripe_monthly_price_id = ${tier.stripe_monthly_price_id || null},
        stripe_annual_price_id = ${tier.stripe_annual_price_id || null},
        features = ${JSON.stringify(tier.features || [])},
        is_free = ${tier.is_free || false},
        is_popular = ${tier.is_popular || false},
        active = ${tier.active !== false},
        updated_at = NOW()
      WHERE id = ${tier.id}
    `
    return NextResponse.json({ message: "Tier updated" })
  } catch (error) {
    console.error("Error updating tier:", error)
    return NextResponse.json({ error: "Failed to update tier" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { tier } = await req.json()
    if (!tier?.id || !tier?.name) return NextResponse.json({ error: "Missing id or name" }, { status: 400 })

    const maxOrder = await sql`SELECT COALESCE(MAX(sort_order), 0) + 1 as next FROM pricing_tiers`
    await sql`
      INSERT INTO pricing_tiers (id, name, assessments, monthly_price, annual_price, stripe_product_id, stripe_monthly_price_id, stripe_annual_price_id, features, is_free, is_popular, sort_order)
      VALUES (${tier.id}, ${tier.name}, ${tier.assessments || ''}, ${tier.monthly_price || 0}, ${tier.annual_price || 0}, ${tier.stripe_product_id || null}, ${tier.stripe_monthly_price_id || null}, ${tier.stripe_annual_price_id || null}, ${JSON.stringify(tier.features || [])}, ${tier.is_free || false}, ${tier.is_popular || false}, ${maxOrder[0].next})
    `
    return NextResponse.json({ message: "Tier created" })
  } catch (error) {
    console.error("Error creating tier:", error)
    return NextResponse.json({ error: "Failed to create tier" }, { status: 500 })
  }
}
