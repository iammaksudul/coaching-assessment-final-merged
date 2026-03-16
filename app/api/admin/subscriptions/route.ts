import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const user = await sql`
      SELECT role FROM users WHERE id = ${session.user.id}
    `

    if (!user[0] || user[0].role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get all subscriptions with user and organization data
    const subscriptions = await sql`
      SELECT 
        s.*,
        u.email as subscriber_email,
        u.name as subscriber_name,
        o.name as organization_name,
        COUNT(a.id) as total_assessments,
        COUNT(CASE WHEN a.created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as current_month_assessments
      FROM subscriptions s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN organizations o ON s.organization_id = o.id
      LEFT JOIN assessments a ON (s.organization_id IS NOT NULL AND a.sponsored_by_organization = s.organization_id) 
                              OR (s.organization_id IS NULL AND a.user_id = s.user_id)
      GROUP BY s.id, u.email, u.name, o.name
      ORDER BY u.email ASC
    `

    return NextResponse.json({ subscriptions })
  } catch (error) {
    console.error("Error fetching admin subscriptions:", error)
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
  }
}
