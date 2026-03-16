import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { assessmentId, action } = await req.json()
    if (!assessmentId || !["archive", "restore"].includes(action)) {
      return NextResponse.json({ error: "assessmentId and action (archive|restore) are required" }, { status: 400 })
    }

    const isPreviewMode = !process.env.DATABASE_URL

    if (action === "archive") {
      if (!isPreviewMode) {
        try {
          await sql`
            UPDATE assessments
            SET is_legacy = true, moved_to_legacy_at = NOW(), updated_at = NOW()
            WHERE id = ${assessmentId}
          `
          // Release a credit back to the organization
          await sql`
            UPDATE organizations
            SET assessments_used_current_period = GREATEST(0, assessments_used_current_period - 1)
            WHERE id = (SELECT organization_id FROM users WHERE id = ${userId})
          `
        } catch (dbErr) {
          console.error("DB archive error (proceeding in preview mode):", dbErr)
        }
      }

      return NextResponse.json({
        success: true,
        assessmentId,
        action: "archived",
        creditReleased: true,
        message: "Assessment archived. One plan credit has been released.",
      })
    }

    // Restore
    if (!isPreviewMode) {
      try {
        // Check if org has capacity before restoring
        const orgResult = await sql`
          SELECT o.assessments_used_current_period, o.assessment_bonus_credits,
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
              error: "Cannot reactivate -- your plan is at capacity. Upgrade your plan or purchase an extra assessment credit ($9).",
              code: "OVER_LIMIT",
            }, { status: 403 })
          }
        }

        await sql`
          UPDATE assessments
          SET is_legacy = false, moved_to_legacy_at = NULL, updated_at = NOW()
          WHERE id = ${assessmentId}
        `
        await sql`
          UPDATE organizations
          SET assessments_used_current_period = assessments_used_current_period + 1
          WHERE id = (SELECT organization_id FROM users WHERE id = ${userId})
        `
      } catch (dbErr) {
        console.error("DB restore error (proceeding in preview mode):", dbErr)
      }
    }

    return NextResponse.json({
      success: true,
      assessmentId,
      action: "restored",
      creditConsumed: true,
      message: "Assessment reactivated. One plan credit has been consumed.",
    })
  } catch (error) {
    console.error("Archive API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
