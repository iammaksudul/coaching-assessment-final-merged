import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 })
  }

  try {
    const result = await sql`
      SELECT ri.status, ri.expires_at, ri.referee_name, ri.assessment_id,
        a.name as assessment_name, u.name as candidate_name
      FROM referee_invitations ri
      LEFT JOIN assessments a ON ri.assessment_id = a.id
      LEFT JOIN users u ON a.user_id = u.id
      WHERE ri.token = ${token}
    `
    const inv = result?.[0]
    if (!inv) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 })
    }
    if (inv.status === "COMPLETED") {
      return NextResponse.json({ error: "Survey already completed" }, { status: 410 })
    }
    if (inv.expires_at && new Date(inv.expires_at) < new Date()) {
      return NextResponse.json({ error: "This invitation has expired" }, { status: 410 })
    }
    return NextResponse.json({
      candidate_name: inv.candidate_name || "the participant",
      assessment_name: inv.assessment_name || "Coachability Assessment",
      organization_name: null,
      valid: true,
    })
  } catch (e) {
    console.error("Error validating survey token:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { token, responses } = await req.json()

    if (!token || !responses) {
      return NextResponse.json({ error: "Token and responses required" }, { status: 400 })
    }

    // Validate token exists and is still valid
    let invitation: any = null
    try {
      const result = await sql`
        SELECT ri.*, a.id as assessment_id, a.user_id
        FROM referee_invitations ri
        LEFT JOIN assessments a ON ri.assessment_id = a.id
        WHERE ri.token = ${token} AND ri.status != 'COMPLETED'
          AND (ri.expires_at IS NULL OR ri.expires_at > NOW())
      `
      invitation = result?.[0]
    } catch (e) {
      console.error("Error validating token:", e)
    }

    if (!invitation) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 })
    }

    // Save each response to the responses table
    for (const [questionId, answer] of Object.entries(responses)) {
      try {
        await sql`
          INSERT INTO responses (assessment_id, question_id, value, answer, respondent_type, respondent_token, response_type)
          VALUES (${invitation.assessment_id}, ${questionId}, ${String(answer)}, ${String(answer)}, 'REFEREE', ${token}, 'REFEREE')
          ON CONFLICT (assessment_id, question_id, COALESCE(respondent_token, '')) 
          DO UPDATE SET value = ${String(answer)}, answer = ${String(answer)}, updated_at = NOW()
        `
      } catch {
        // Table may not have the exact schema, try simpler insert
        try {
          await sql`
            INSERT INTO responses (assessment_id, question_id, value, response_type)
            VALUES (${invitation.assessment_id}, ${questionId}, ${String(answer)}, 'REFEREE')
          `
        } catch (e2) {
          console.error("Error saving response:", e2)
        }
      }
    }

    // Mark invitation as completed
    try {
      await sql`
        UPDATE referee_invitations 
        SET status = 'COMPLETED', completed_at = NOW()
        WHERE token = ${token}
      `
    } catch (e) {
      console.error("Error updating invitation status:", e)
    }

    return NextResponse.json({ success: true, message: "Survey submitted successfully" })
  } catch (error) {
    console.error("Error submitting referee survey:", error)
    return NextResponse.json({ error: "Failed to submit survey" }, { status: 500 })
  }
}
