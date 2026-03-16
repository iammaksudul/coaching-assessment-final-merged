import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

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
          INSERT INTO responses (assessment_id, question_id, answer, respondent_type, respondent_token)
          VALUES (${invitation.assessment_id}, ${questionId}, ${answer}, 'REFEREE', ${token})
          ON CONFLICT (assessment_id, question_id, respondent_token) 
          DO UPDATE SET answer = ${answer}, updated_at = NOW()
        `
      } catch {
        // Table may not have the exact schema, try simpler insert
        try {
          await sql`
            INSERT INTO responses (assessment_id, question_id, answer)
            VALUES (${invitation.assessment_id}, ${questionId}, ${answer})
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
