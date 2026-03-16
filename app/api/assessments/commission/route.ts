import { NextResponse } from "next/server"
import { createUser, getUserByEmail, createAssessment, sql } from "@/lib/db"
import { sendEmail, createCandidateInvitationEmail } from "@/lib/email"
import { randomBytes } from "crypto"

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { candidateName, candidateEmail, assessmentName, message, organizationName } = await req.json()

    if (!candidateName || !candidateEmail) {
      return NextResponse.json({ error: "Candidate name and email are required" }, { status: 400 })
    }

    // Check if we're in preview mode
    const isPreviewMode = !process.env.DATABASE_URL

    // --- Plan limit enforcement ---
    if (!isPreviewMode) {
      try {
        const orgResult = await sql`
          SELECT o.assessments_used_current_period, o.assessment_bonus_credits,
            o.subscription_tier,
            CASE o.subscription_tier
              WHEN 'FREE' THEN 1
              WHEN 'TIER_1_5' THEN 5
              WHEN 'TIER_6_12' THEN 12
              WHEN 'TIER_13_20' THEN 20
              WHEN 'TIER_21_40' THEN 40
              WHEN 'TIER_40_PLUS' THEN 999
              ELSE 5
            END as plan_limit
          FROM organizations o
          JOIN users u ON u.organization_id = o.id
          WHERE u.id = ${userId}
        `
        const org = orgResult?.[0]
        if (org) {
          const totalCapacity = (org.plan_limit || 5) + (org.assessment_bonus_credits || 0)
          if ((org.assessments_used_current_period || 0) >= totalCapacity) {
            return NextResponse.json({
              error: "You have reached your plan limit for this billing period.",
              code: "OVER_LIMIT",
              usage: {
                used: org.assessments_used_current_period || 0,
                limit: org.plan_limit || 5,
                bonusCredits: org.assessment_bonus_credits || 0,
                tier: org.subscription_tier,
              },
            }, { status: 403 })
          }
        }
      } catch (dbErr) {
        // If the org lookup fails (e.g. tables not seeded), allow the request to proceed
        console.error("Org limit check failed (allowing):", dbErr)
      }
    }

    if (isPreviewMode) {
      // In preview mode, just return success
      return NextResponse.json({
        success: true,
        message: "Assessment commissioned successfully (preview mode)",
        candidateId: "preview-candidate-1",
        assessmentId: "preview-assessment-1",
        invitationSent: true,
      })
    }

    // Check if candidate already exists
    let candidate = await getUserByEmail(candidateEmail)

    if (!candidate) {
      // Create new candidate account
      const temporaryPassword = randomBytes(12).toString("hex")

      candidate = await createUser({
        name: candidateName,
        email: candidateEmail,
        password: temporaryPassword, // Will be hashed in createUser
        accountType: "EMPLOYER_CREATED",
        temporaryPassword: true,
      })
    }

    // Create assessment for the candidate, sponsored by current user's organization
    const assessment = await createAssessment(
      candidate.id,
      assessmentName || `Coachability Assessment for ${candidateName}`,
      userId,
    )

    // Generate invitation token
    const invitationToken = randomBytes(32).toString("hex")

    // Store invitation token (you'd want to add this to your database schema)
    // For now, we'll include it in the email link

    // Send invitation email
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000"
    const invitationLink = `${baseUrl}/assessment/invited/${invitationToken}?assessmentId=${assessment.id}`

    const emailTemplate = createCandidateInvitationEmail({
      candidateName,
      organizationName: organizationName || "Your Organization",
      invitedByName: "Organization Admin",
      assessmentName: assessment.name,
      invitationLink,
      personalMessage: message,
      isNewAccount: !candidate.account_activated,
    })

    const emailResult = await sendEmail({
      to: candidateEmail,
      subject: emailTemplate.subject,
      htmlBody: emailTemplate.htmlBody,
      tag: emailTemplate.tag,
    })

    return NextResponse.json({
      success: true,
      message: "Assessment commissioned successfully",
      candidateId: candidate.id,
      assessmentId: assessment.id,
      invitationSent: emailResult.success,
      isNewAccount: !candidate.account_activated,
    })
  } catch (error) {
    console.error("Error commissioning assessment:", error)
    return NextResponse.json({ error: "Failed to commission assessment" }, { status: 500 })
  }
}
