import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { token, consents } = await request.json()
    if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 })

    // Find the sponsored assessment by token/id
    const rows = await sql`
      SELECT sa.*, o.name as organization_name
      FROM sponsored_assessments sa
      LEFT JOIN organizations o ON sa.organization_id = o.id
      WHERE sa.id = ${token} OR sa.assessment_id = ${token}
      LIMIT 1
    `
    const invitation = rows?.[0]
    if (!invitation) return NextResponse.json({ error: "Invalid or expired invitation" }, { status: 404 })
    if (invitation.status !== "PENDING") return NextResponse.json({ error: "Invitation already responded to" }, { status: 400 })

    // Update status to ACCEPTED
    await sql`UPDATE sponsored_assessments SET status = 'ACCEPTED', consent_given_at = NOW(), updated_at = NOW() WHERE id = ${invitation.id}`

    // Store consent if provided
    if (consents && invitation.candidate_email) {
      const users = await sql`SELECT id FROM users WHERE email = ${invitation.candidate_email} LIMIT 1`
      if (users?.[0]) {
        try {
          await sql`INSERT INTO consent_records (user_id, assessment_id, consent_type, consented, consent_text) VALUES (${users[0].id}, ${invitation.assessment_id}, 'CANDIDATE_ASSESSMENT', true, ${JSON.stringify(consents)})`
        } catch {}
      }
    }

    return NextResponse.json({
      success: true,
      message: "Invitation accepted successfully",
      assessment_id: invitation.assessment_id,
      redirect_url: `/dashboard/assessments/new?assessmentId=${invitation.assessment_id}`,
    })
  } catch (error) {
    console.error("Error accepting invitation:", error)
    return NextResponse.json({ success: false, error: "Failed to accept invitation" }, { status: 500 })
  }
}
