import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { sql, getUserOrganizations } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orgs = await getUserOrganizations(session.user.id)
    const orgId = orgs?.[0]?.organization_id || orgs?.[0]?.id

    if (!orgId) {
      return NextResponse.json({
        assessmentsCommissioned: 0, assessmentsCompleted: 0, assessmentsPending: 0,
        assessmentsExpired: 0, accessRequestsSent: 0, accessRequestsApproved: 0,
        accessRequestsPending: 0, subscriptionTier: "Free",
        assessmentsUsedThisPeriod: 0, assessmentsAllowedThisPeriod: 5,
        periodEndsAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      })
    }

    let stats = {
      assessmentsCommissioned: 0, assessmentsCompleted: 0, assessmentsPending: 0,
      assessmentsExpired: 0, accessRequestsSent: 0, accessRequestsApproved: 0,
      accessRequestsPending: 0, subscriptionTier: "Free",
      assessmentsUsedThisPeriod: 0, assessmentsAllowedThisPeriod: 5,
      periodEndsAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    }

    try {
      const [sponsored, accessReqs, org] = await Promise.all([
        sql`SELECT status, count(*)::int as count FROM sponsored_assessments WHERE organization_id = ${orgId} GROUP BY status`,
        sql`SELECT status, count(*)::int as count FROM assessment_access_requests WHERE organization_id = ${orgId} GROUP BY status`,
        sql`SELECT * FROM organizations WHERE id = ${orgId}`,
      ])

      for (const row of sponsored || []) {
        if (row.status === "COMPLETED") stats.assessmentsCompleted = row.count
        else if (row.status === "PENDING" || row.status === "IN_PROGRESS") stats.assessmentsPending = row.count
        else if (row.status === "EXPIRED") stats.assessmentsExpired = row.count
        stats.assessmentsCommissioned += row.count
      }

      for (const row of accessReqs || []) {
        if (row.status === "APPROVED") stats.accessRequestsApproved = row.count
        else if (row.status === "PENDING") stats.accessRequestsPending = row.count
        stats.accessRequestsSent += row.count
      }

      if (org?.[0]) {
        stats.assessmentsUsedThisPeriod = org[0].assessments_used_current_period || 0
        stats.assessmentsAllowedThisPeriod = org[0].assessments_allowed_per_period || 5
        stats.subscriptionTier = org[0].subscription_tier || "Free"
      }
    } catch (e) {
      console.error("Error querying employer stats:", e)
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching employer stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
