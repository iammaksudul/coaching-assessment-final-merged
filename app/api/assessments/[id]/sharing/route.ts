import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/get-auth-user"
import { sql } from "@/lib/db"

// GET: Retrieve sharing history for an assessment
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const history = await sql`
      SELECT asp.id, asp.access_level, asp.granted_at, asp.expires_at, asp.revoked_at,
             o.name as organization_name,
             u.name as shared_with_name, u.email as shared_with_email
      FROM assessment_sharing_permissions asp
      LEFT JOIN organizations o ON asp.shared_with_organization_id = o.id
      LEFT JOIN assessment_access_requests aar ON asp.access_request_id = aar.id
      LEFT JOIN users u ON aar.requested_by_user_id = u.id
      WHERE asp.assessment_id = ${params.id} AND asp.shared_by_user_id = ${user.id}
      ORDER BY asp.granted_at DESC
    `

    return NextResponse.json({ history: history || [] })
  } catch (error) {
    console.error("Error fetching sharing history:", error)
    return NextResponse.json({ history: [] })
  }
}

// POST: Share a report with someone
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { contactEmail, contactPerson, organizationName, accessLevel, expirationDays } = await request.json()
    if (!contactEmail) return NextResponse.json({ error: "Contact email required" }, { status: 400 })

    // Verify user owns this assessment
    const assessment = await sql`SELECT id FROM assessments WHERE id = ${params.id} AND user_id = ${user.id}`
    if (!assessment[0]) return NextResponse.json({ error: "Assessment not found" }, { status: 404 })

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (parseInt(expirationDays) || 30))

    // Find or reference the org
    let orgId = null
    if (organizationName) {
      const org = await sql`SELECT id FROM organizations WHERE name ILIKE ${organizationName} LIMIT 1`
      orgId = org[0]?.id || null
    }

    await sql`
      INSERT INTO assessment_sharing_permissions (assessment_id, shared_by_user_id, shared_with_organization_id, access_level, expires_at)
      VALUES (${params.id}, ${user.id}, ${orgId}, ${accessLevel || 'FULL'}, ${expiresAt.toISOString()})
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sharing report:", error)
    return NextResponse.json({ error: "Failed to share report" }, { status: 500 })
  }
}

// DELETE: Revoke sharing access
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { shareId } = await request.json()
    if (!shareId) return NextResponse.json({ error: "shareId required" }, { status: 400 })

    await sql`
      UPDATE assessment_sharing_permissions SET revoked_at = CURRENT_TIMESTAMP
      WHERE id = ${shareId} AND shared_by_user_id = ${user.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error revoking share:", error)
    return NextResponse.json({ error: "Failed to revoke" }, { status: 500 })
  }
}
