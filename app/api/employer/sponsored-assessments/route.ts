import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { sql, getUserOrganizations } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orgs = await getUserOrganizations(session.user.id)
    const orgId = orgs?.[0]?.organization_id || orgs?.[0]?.id

    if (!orgId) {
      return NextResponse.json([])
    }

    let assessments: any[] = []
    try {
      assessments = await sql`
        SELECT 
          sa.id, sa.assessment_id, sa.candidate_email, sa.status,
          sa.created_at, sa.expires_at,
          a.name as assessment_name, a.status as assessment_status,
          u.name as candidate_name,
          o.name as organization_name,
          sponsor.name as sponsored_by_name
        FROM sponsored_assessments sa
        LEFT JOIN assessments a ON sa.assessment_id = a.id
        LEFT JOIN users u ON a.user_id = u.id
        LEFT JOIN organizations o ON sa.organization_id = o.id
        LEFT JOIN users sponsor ON sa.sponsored_by = sponsor.id
        WHERE sa.organization_id = ${orgId}
        ORDER BY sa.created_at DESC
      `
    } catch (e) {
      console.error("Error querying sponsored assessments:", e)
    }

    return NextResponse.json(assessments || [])
  } catch (error) {
    console.error("Error fetching sponsored assessments:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}
