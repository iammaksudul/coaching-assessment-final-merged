import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/get-auth-user"
import { sql } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const [[userCount], [orgCount], [assessmentStats], [subStats]] = await Promise.all([
      sql`SELECT COUNT(*)::int as total FROM users`,
      sql`SELECT COUNT(*)::int as total FROM organizations`,
      sql`SELECT
            COUNT(*)::int as total,
            COUNT(*) FILTER (WHERE status = 'COMPLETED')::int as completed,
            COUNT(*) FILTER (WHERE status IN ('PENDING','IN_PROGRESS'))::int as pending,
            COUNT(*) FILTER (WHERE status = 'EXPIRED')::int as expired
          FROM assessments`,
      sql`SELECT
            COUNT(*) FILTER (WHERE status = 'active')::int as active,
            COUNT(*) FILTER (WHERE status IN ('canceled','past_due'))::int as lapsed
          FROM subscriptions`,
    ])

    return NextResponse.json({
      totalUsers: userCount?.total || 0,
      totalOrganizations: orgCount?.total || 0,
      totalAssessments: assessmentStats?.total || 0,
      completedAssessments: assessmentStats?.completed || 0,
      pendingAssessments: assessmentStats?.pending || 0,
      expiredAssessments: assessmentStats?.expired || 0,
      activeSubscriptions: subStats?.active || 0,
      lapsedAccounts: subStats?.lapsed || 0,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
