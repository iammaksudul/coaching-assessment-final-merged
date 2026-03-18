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

    let requests: any[] = []
    try {
      requests = await sql`
        SELECT 
          aar.id, aar.assessment_id, aar.candidate_email, aar.status,
          aar.request_message, aar.created_at as requested_at, aar.resolved_at,
          aar.expires_at,
          a.name as assessment_name,
          u.name as candidate_name,
          o.name as organization_name,
          requester.name as requested_by_name
        FROM assessment_access_requests aar
        LEFT JOIN assessments a ON aar.assessment_id = a.id
        LEFT JOIN users u ON a.user_id = u.id
        LEFT JOIN organizations o ON aar.organization_id = o.id
        LEFT JOIN users requester ON aar.requested_by = requester.id
        WHERE aar.organization_id = ${orgId}
        ORDER BY aar.created_at DESC
      `
    } catch (e) {
      console.error("Error querying access requests:", e)
    }

    return NextResponse.json(requests || [])
  } catch (error) {
    console.error("assessment-requests route error:", error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { assessmentId, candidateEmail, message } = await req.json()

    if (!assessmentId || !candidateEmail) {
      return NextResponse.json({ error: "Assessment ID and candidate email required" }, { status: 400 })
    }

    const orgs = await getUserOrganizations(session.user.id)
    const orgId = orgs?.[0]?.organization_id || orgs?.[0]?.id

    if (!orgId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 })
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    let result: any = null
    try {
      const rows = await sql`
        INSERT INTO assessment_access_requests 
          (assessment_id, organization_id, requested_by, candidate_email, request_message, status, expires_at)
        VALUES 
          (${assessmentId}, ${orgId}, ${session.user.id}, ${candidateEmail}, ${message || null}, 'PENDING', ${expiresAt})
        RETURNING *
      `
      result = rows?.[0]
    } catch (e) {
      console.error("Error creating access request:", e)
      return NextResponse.json({ error: "Failed to create access request" }, { status: 500 })
    }

    return NextResponse.json({ success: true, request: result }, { status: 201 })
  } catch (error) {
    console.error("POST assessment-requests error:", error)
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 })
  }
}
