import { NextResponse } from "next/server"
import { createAssessment, getAssessmentsByUserId, sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Enforce plan limits
    const existing = await getAssessmentsByUserId(userId)
    let planLimit = 1 // default: free plan = 1 assessment
    try {
      const orgRow = await sql`
        SELECT COALESCE(o.subscription_tier, 'FREE') as tier
        FROM users u
        LEFT JOIN organizations o ON o.id = u.organization_id
        WHERE u.id = ${userId}
        LIMIT 1
      `
      const tier = orgRow?.[0]?.tier || "FREE"
      const limits: Record<string, number> = {
        FREE: 1, TIER_1_5: 5, TIER_6_12: 12, TIER_13_20: 20, TIER_21_40: 40, TIER_40_PLUS: 999
      }
      planLimit = limits[tier] ?? 1
    } catch {}

    if (Array.isArray(existing) && existing.length >= planLimit) {
      return NextResponse.json(
        { error: `You have reached your plan limit of ${planLimit} assessment${planLimit > 1 ? "s" : ""}. Please upgrade your plan to create more.` },
        { status: 403 }
      )
    }

    let name: string | undefined
    try {
      const body = await request.json()
      name = body.name
    } catch {}

    const assessment = await createAssessment(userId, name)

    return NextResponse.json({
      assessment,
      message: "Assessment created successfully",
    })
  } catch (error) {
    console.error("Error creating assessment:", error)
    return NextResponse.json({ error: "Failed to create assessment" }, { status: 500 })
  }
}
