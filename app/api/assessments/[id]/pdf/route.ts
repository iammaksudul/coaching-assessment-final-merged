import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/get-auth-user"
import { sql } from "@/lib/db"
import jsPDF from "jspdf"

const DOMAINS = [
  "Openness to Feedback", "Self-Awareness", "Learning Orientation", "Change Readiness",
  "Emotional Regulation", "Goal Orientation", "Resilience", "Communication Skills",
  "Relationship Building", "Accountability", "Growth Mindset", "Action Orientation",
]
const DOMAIN_IDS = [
  "openness-to-feedback", "self-awareness", "learning-orientation", "change-readiness",
  "emotional-regulation", "goal-orientation", "resilience", "communication-skills",
  "relationship-building", "accountability", "growth-mindset", "action-orientation",
]

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const assessmentId = params.id

    // Get assessment + participant
    const assessments = await sql`
      SELECT a.*, u.name as participant_name, u.email as participant_email
      FROM assessments a LEFT JOIN users u ON a.user_id = u.id
      WHERE a.id = ${assessmentId}
    `
    const assessment = assessments?.[0]
    if (!assessment) return NextResponse.json({ error: "Assessment not found" }, { status: 404 })

    // Get responses
    const selfResponses = await sql`
      SELECT question_id, COALESCE(answer, value) as score FROM responses
      WHERE assessment_id = ${assessmentId} AND (response_type = 'SELF' OR respondent_type = 'SELF' OR respondent_token IS NULL)
    `
    const refereeResponses = await sql`
      SELECT question_id, COALESCE(answer, value) as score FROM responses
      WHERE assessment_id = ${assessmentId} AND (response_type = 'REFEREE' OR respondent_type = 'REFEREE' OR respondent_token IS NOT NULL)
    `

    // Calculate domain scores
    const qToDomain = (qId: string) => {
      const num = parseInt(qId.replace(/\D/g, ""), 10)
      if (!num || num < 1 || num > 48) return 0
      return Math.floor((num - 1) / 4)
    }

    const selfByDomain: number[][] = Array.from({ length: 12 }, () => [])
    const refByDomain: number[][] = Array.from({ length: 12 }, () => [])
    for (const r of selfResponses) selfByDomain[qToDomain(r.question_id)].push(parseFloat(r.score) || 0)
    for (const r of refereeResponses) refByDomain[qToDomain(r.question_id)].push(parseFloat(r.score) || 0)

    const avg = (arr: number[]) => arr.length ? +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 0

    // Generate PDF
    const doc = new jsPDF()
    const w = doc.internal.pageSize.getWidth()
    let y = 20

    // Title
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("Coachability Assessment Report", w / 2, y, { align: "center" })
    y += 12

    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.text(`Participant: ${assessment.participant_name || user.name}`, 20, y); y += 7
    doc.text(`Assessment: ${assessment.name || "Coachability Assessment"}`, 20, y); y += 7
    doc.text(`Date: ${new Date(assessment.created_at).toLocaleDateString()}`, 20, y); y += 7
    doc.text(`Self Responses: ${selfResponses.length} | Referee Responses: ${refereeResponses.length}`, 20, y); y += 12

    // Domain scores table
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Domain Scores", 20, y); y += 8

    // Table header
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.setFillColor(240, 240, 240)
    doc.rect(20, y - 4, w - 40, 7, "F")
    doc.text("Domain", 22, y)
    doc.text("Self", 120, y, { align: "center" })
    doc.text("Referee", 145, y, { align: "center" })
    doc.text("Combined", 172, y, { align: "center" })
    y += 8

    doc.setFont("helvetica", "normal")
    for (let i = 0; i < 12; i++) {
      const selfScore = avg(selfByDomain[i])
      const refScore = avg(refByDomain[i])
      const combined = selfScore && refScore ? +((selfScore + refScore) / 2).toFixed(1) : selfScore || refScore

      if (i % 2 === 0) {
        doc.setFillColor(248, 248, 248)
        doc.rect(20, y - 4, w - 40, 7, "F")
      }
      doc.text(DOMAINS[i], 22, y)
      doc.text(selfScore ? String(selfScore) : "-", 120, y, { align: "center" })
      doc.text(refScore ? String(refScore) : "-", 145, y, { align: "center" })
      doc.text(combined ? String(combined) : "-", 172, y, { align: "center" })
      y += 7
    }

    y += 10

    // Overall
    const allSelf = selfByDomain.flat()
    const allRef = refByDomain.flat()
    const overallSelf = avg(allSelf)
    const overallRef = avg(allRef)
    const overallCombined = overallSelf && overallRef ? +((overallSelf + overallRef) / 2).toFixed(1) : overallSelf || overallRef

    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text(`Overall Score: ${overallCombined}/5.0  (Self: ${overallSelf}, Referee: ${overallRef})`, 20, y)
    y += 12

    // Recommendations
    if (selfResponses.length > 0) {
      doc.setFontSize(14)
      doc.text("Recommendations", 20, y); y += 8
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      const domainScores = DOMAIN_IDS.map((id, i) => ({
        name: DOMAINS[i],
        score: avg(selfByDomain[i]) && avg(refByDomain[i])
          ? (avg(selfByDomain[i]) + avg(refByDomain[i])) / 2
          : avg(selfByDomain[i]) || avg(refByDomain[i]),
      })).sort((a, b) => a.score - b.score)

      const bottom3 = domainScores.filter(d => d.score > 0).slice(0, 3)
      const top2 = domainScores.filter(d => d.score > 0).slice(-2).reverse()

      for (const d of bottom3) {
        doc.text(`• Focus on ${d.name} (${d.score.toFixed(1)}/5.0) — area for development`, 22, y); y += 6
      }
      for (const d of top2) {
        doc.text(`• ${d.name} (${d.score.toFixed(1)}/5.0) — strength to leverage`, 22, y); y += 6
      }
    }

    // Footer
    y = doc.internal.pageSize.getHeight() - 15
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text("Generated by Coaching Digs — www.coachingdigs.com", w / 2, y, { align: "center" })

    const pdfBuffer = doc.output("arraybuffer")

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="coachability-report-${assessmentId}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
