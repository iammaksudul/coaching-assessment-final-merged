import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/get-auth-user"
import { sql } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const assessmentId = params.id

    // Get assessment info
    const assessments = await sql`
      SELECT a.*, u.name as participant_name, u.email as participant_email
      FROM assessments a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.id = ${assessmentId}
    `
    const assessment = assessments?.[0]
    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    // Get referees
    const referees = await sql`
      SELECT referee_name, relationship, status
      FROM referee_invitations
      WHERE assessment_id = ${assessmentId} AND status = 'COMPLETED'
    `

    // Get self responses (response_type=SELF or respondent_type=SELF)
    const selfResponses = await sql`
      SELECT question_id, COALESCE(answer, value) as score
      FROM responses
      WHERE assessment_id = ${assessmentId}
        AND (response_type = 'SELF' OR respondent_type = 'SELF' OR respondent_token IS NULL)
    `

    // Get referee responses
    const refereeResponses = await sql`
      SELECT question_id, COALESCE(answer, value) as score
      FROM responses
      WHERE assessment_id = ${assessmentId}
        AND (response_type = 'REFEREE' OR respondent_type = 'REFEREE' OR respondent_token IS NOT NULL)
    `

    // Map question IDs to domain IDs (q1-q4 = domain 1, q5-q8 = domain 2, etc.)
    const domainIds = [
      "openness-to-feedback", "self-awareness", "learning-orientation", "change-readiness",
      "emotional-regulation", "goal-orientation", "resilience", "communication-skills",
      "relationship-building", "accountability", "growth-mindset", "action-orientation",
    ]

    const qToDomain = (qId: string): string => {
      const num = parseInt(qId.replace(/\D/g, ""), 10)
      if (!num || num < 1 || num > 48) return domainIds[0]
      return domainIds[Math.floor((num - 1) / 4)]
    }

    // Calculate domain scores
    const domainScores: Record<string, { self: number; referee: number }> = {}
    for (const d of domainIds) {
      domainScores[d] = { self: 0, referee: 0 }
    }

    // Self scores
    const selfByDomain: Record<string, number[]> = {}
    for (const r of selfResponses) {
      const d = qToDomain(r.question_id)
      if (!selfByDomain[d]) selfByDomain[d] = []
      selfByDomain[d].push(parseFloat(r.score) || 0)
    }
    for (const [d, scores] of Object.entries(selfByDomain)) {
      domainScores[d].self = scores.length ? +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0
    }

    // Referee scores
    const refByDomain: Record<string, number[]> = {}
    for (const r of refereeResponses) {
      const d = qToDomain(r.question_id)
      if (!refByDomain[d]) refByDomain[d] = []
      refByDomain[d].push(parseFloat(r.score) || 0)
    }
    for (const [d, scores] of Object.entries(refByDomain)) {
      domainScores[d].referee = scores.length ? +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0
    }

    const hasData = selfResponses.length > 0 || refereeResponses.length > 0

    return NextResponse.json({
      id: assessment.id,
      title: assessment.name,
      createdAt: assessment.created_at,
      participant: {
        name: assessment.participant_name || user.name,
        email: assessment.participant_email || user.email,
      },
      referees: referees.map((r: any) => ({ name: r.referee_name, relationship: r.relationship || "Colleague" })),
      domainScores,
      hasData,
      selfResponseCount: selfResponses.length,
      refereeResponseCount: refereeResponses.length,
    })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
