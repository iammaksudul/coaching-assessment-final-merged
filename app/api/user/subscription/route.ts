import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/get-auth-user"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request)
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const rows = await sql`
      SELECT s.*, o.name as organization_name
      FROM subscriptions s
      LEFT JOIN organizations o ON s.organization_id = o.id
      WHERE s.user_id = ${user.id}
      ORDER BY s.created_at DESC
      LIMIT 1
    `

    if (!rows?.[0]) {
      // Return free plan info
      const assessmentCount = await sql`SELECT COUNT(*) as count FROM assessments WHERE user_id = ${user.id}`
      return NextResponse.json({
        subscription: null,
        plan: "FREE",
        assessments_used: parseInt(assessmentCount?.[0]?.count || "0"),
        assessments_limit: 1,
      })
    }

    return NextResponse.json({ subscription: rows[0] })
  } catch (error) {
    console.error("Error fetching subscription:", error)
    return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 })
  }
}
