import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/get-auth-user"
import { getAssessmentById, sql } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = { user: await getAuthUser(request) }
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const assessmentId = params.id
    const assessment = await getAssessmentById(assessmentId)

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    // Fetch participant name for the assessment owner
    let participantName = "Unknown"
    try {
      const userRows = await sql`SELECT name FROM users WHERE id = ${assessment.user_id} LIMIT 1`
      if (userRows?.[0]?.name) participantName = userRows[0].name
    } catch {}


    // Get referee invitations for this assessment
    let invitations: any[] = []
    try {
      invitations = await sql`
        SELECT 
          ri.id, ri.referee_name, ri.referee_email, ri.relationship,
          ri.status, ri.token as survey_token, ri.created_at as invited_at,
          ri.expires_at, ri.completed_at, ri.reminder_count,
          ri.last_reminder_sent
        FROM referee_invitations ri
        WHERE ri.assessment_id = ${assessmentId}
        ORDER BY ri.created_at DESC
      `
    } catch {
      invitations = []
    }

    const completedReferees = invitations.filter((i: any) => i.status === "COMPLETED").length

    return NextResponse.json({
      assessment: {
        ...assessment,
        participant_name: participantName,
        can_close_manually: true,
        closure_requirements: {
          self_assessment: true,
          minimum_referees: 2,
          completed_referees: completedReferees,
        },
      },
      invitations: invitations || [],
    })
  } catch (error) {
    console.error("Error fetching assessment referees:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}
