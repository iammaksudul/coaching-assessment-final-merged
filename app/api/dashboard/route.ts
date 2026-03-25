import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/get-auth-user"
import { getAssessmentsByUserId, getRefereeInvitationsByUserId, getAssessmentAccessRequestsByUserId, sql } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = { user: await getAuthUser(req) }
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch all data in parallel
    const [assessments, refereeInvitations, accessRequests, sponsoredRequests] = await Promise.all([
      getAssessmentsByUserId(userId),
      getRefereeInvitationsByUserId(userId),
      getAssessmentAccessRequestsByUserId(userId),
      getSponsoredRequests(userId),
    ])

    // Enrich assessments with referee count and completion rate
    const enrichedAssessments = await Promise.all(
      (assessments || []).map(async (a: any) => {
        let referee_count = 0
        let completion_rate = 0
        try {
          const refs = await sql`
            SELECT status FROM referee_invitations WHERE assessment_id = ${a.id}
          `
          referee_count = refs?.length || 0
          const completed = refs?.filter((r: any) => r.status === "COMPLETED").length || 0
          completion_rate = referee_count > 0 ? Math.round((completed / referee_count) * 100) : 0
        } catch {
          // DB may not have referee_invitations table yet
        }
        return { ...a, referee_count, completion_rate }
      })
    )

    return NextResponse.json({
      assessments: enrichedAssessments,
      refereeInvitations: refereeInvitations || [],
      accessRequests: accessRequests || [],
      sponsoredRequests: sponsoredRequests || [],
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}

async function getSponsoredRequests(userId: string) {
  try {
    const result = await sql`
      SELECT sa.*, o.name as organization_name, u.name as requested_by_name
      FROM sponsored_assessments sa
      LEFT JOIN organizations o ON sa.organization_id = o.id
      LEFT JOIN users u ON sa.sponsored_by = u.id
      WHERE sa.candidate_email = (SELECT email FROM users WHERE id = ${userId})
      AND sa.status = 'PENDING'
      ORDER BY sa.created_at DESC
    `
    return result || []
  } catch {
    return []
  }
}
