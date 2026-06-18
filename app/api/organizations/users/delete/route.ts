import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/get-auth-user"
import { sql } from "@/lib/db"

// Allows a group admin (ACCOUNT_HOLDER role in organization_users) to delete users in their own org
export async function POST(request: Request) {
  try {
    const admin = await getAuthUser(request)
    if (!admin?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { userId, organizationId, confirmEmail } = await request.json()
    if (!userId || !organizationId || !confirmEmail) {
      return NextResponse.json({ error: "userId, organizationId, and confirmEmail required" }, { status: 400 })
    }

    // Check caller is ACCOUNT_HOLDER of this org
    const membership = await sql`
      SELECT role FROM organization_users
      WHERE user_id = ${admin.id} AND organization_id = ${organizationId} AND role = 'ACCOUNT_HOLDER'
    `
    if (!membership[0]) return NextResponse.json({ error: "Not authorized for this organization" }, { status: 403 })

    // Verify target is in this org and email matches
    const target = await sql`
      SELECT u.email FROM users u
      JOIN organization_users ou ON ou.user_id = u.id
      WHERE u.id = ${userId} AND ou.organization_id = ${organizationId}
    `
    if (!target[0]) return NextResponse.json({ error: "User not found in organization" }, { status: 404 })
    if (target[0].email !== confirmEmail) return NextResponse.json({ error: "Email confirmation does not match" }, { status: 400 })
    if (userId === admin.id) return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 })

    // Remove from org and cascade their org-related data
    await sql`DELETE FROM organization_users WHERE user_id = ${userId} AND organization_id = ${organizationId}`
    await sql`DELETE FROM sponsored_assessments WHERE sponsored_by = ${userId} AND organization_id = ${organizationId}`
    await sql`DELETE FROM assessment_sharing_requests WHERE (requested_by = ${userId} OR candidate_user_id = ${userId}) AND organization_id = ${organizationId}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing org user:", error)
    return NextResponse.json({ error: "Failed to remove user" }, { status: 500 })
  }
}
