import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/get-auth-user"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const admin = await getAuthUser(request)
    if (!admin?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const check = await sql`SELECT role FROM users WHERE id = ${admin.id}`
    if (check[0]?.role !== "ADMIN") return NextResponse.json({ error: "Admin access required" }, { status: 403 })

    const { userId, confirmEmail } = await request.json()
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

    // Verify the email matches (confirmation challenge)
    const target = await sql`SELECT email FROM users WHERE id = ${userId}`
    if (!target[0]) return NextResponse.json({ error: "User not found" }, { status: 404 })
    if (target[0].email !== confirmEmail) return NextResponse.json({ error: "Email confirmation does not match" }, { status: 400 })
    if (userId === admin.id) return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 })

    // Cascading delete — most FKs have ON DELETE CASCADE, handle remaining manually
    await sql`DELETE FROM password_resets WHERE user_id = ${userId}`
    await sql`DELETE FROM consent_records WHERE user_id = ${userId}`
    await sql`DELETE FROM organization_users WHERE user_id = ${userId}`
    await sql`DELETE FROM sponsored_assessments WHERE sponsored_by = ${userId}`
    await sql`DELETE FROM assessment_sharing_requests WHERE requested_by = ${userId} OR candidate_user_id = ${userId}`
    await sql`DELETE FROM assessment_access_requests WHERE requested_by_user_id = ${userId} OR candidate_user_id = ${userId}`
    await sql`DELETE FROM assessment_sharing_permissions WHERE shared_by_user_id = ${userId}`
    await sql`DELETE FROM assessment_access_logs WHERE accessed_by_user_id = ${userId}`
    // Delete the user — CASCADE handles accounts, sessions, assessments, responses, referee_invitations, reports
    await sql`DELETE FROM users WHERE id = ${userId}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
