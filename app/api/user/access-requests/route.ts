import { getAuthUser } from "@/lib/get-auth-user"
import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = { user: await getAuthUser(req) }

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get pending access requests for this user
    const accessRequests = await sql`
      SELECT 
        aar.*,
        a.name as assessment_name,
        a.created_at as assessment_created_at,
        requester.name as requested_by_name,
        requester.email as requested_by_email,
        o.name as organization_name
      FROM assessment_access_requests aar
      LEFT JOIN assessments a ON aar.assessment_id = a.id
      LEFT JOIN users requester ON aar.requested_by_user_id = requester.id
      LEFT JOIN organizations o ON aar.requesting_organization_id = o.id
      WHERE aar.candidate_user_id = ${session.user.id}
        AND aar.status = 'PENDING'
        AND aar.expires_at > CURRENT_TIMESTAMP
      ORDER BY aar.requested_at DESC
    `

    return NextResponse.json({ accessRequests })
  } catch (error) {
    console.error("Error fetching access requests:", error)
    return NextResponse.json({ error: "Failed to fetch access requests" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = { user: await getAuthUser(req) }

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { requestId, action, accessLevel = "FULL", expiresInDays = 90 } = await request.json()

    if (!requestId || !["approve", "deny"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    // Verify the request belongs to this user
    const request_check = await sql`
      SELECT * FROM assessment_access_requests 
      WHERE id = ${requestId} AND candidate_user_id = ${session.user.id} AND status = 'PENDING'
    `

    if (request_check.length === 0) {
      return NextResponse.json({ error: "Request not found or already processed" }, { status: 404 })
    }

    const accessRequest = request_check[0]

    if (action === "approve") {
      // Update request status
      await sql`
        UPDATE assessment_access_requests 
        SET status = 'APPROVED', 
            responded_at = CURRENT_TIMESTAMP,
            access_granted_until = CURRENT_TIMESTAMP + INTERVAL '${expiresInDays} days'
        WHERE id = ${requestId}
      `

      // Create sharing permission
      await sql`
        INSERT INTO assessment_sharing_permissions (
          assessment_id, 
          shared_with_organization_id, 
          shared_by_user_id, 
          access_request_id,
          access_level,
          expires_at
        ) VALUES (
          ${accessRequest.assessment_id},
          ${accessRequest.requesting_organization_id},
          ${session.user.id},
          ${requestId},
          ${accessLevel},
          CURRENT_TIMESTAMP + INTERVAL '${expiresInDays} days'
        )
      `

      // Log the approval
      await sql`
        INSERT INTO assessment_access_logs (
          assessment_id,
          accessed_by_user_id,
          accessed_by_organization_id,
          access_type
        ) VALUES (
          ${accessRequest.assessment_id},
          ${session.user.id},
          ${accessRequest.requesting_organization_id},
          'APPROVAL_GRANTED'
        )
      `
    } else {
      // Deny the request
      await sql`
        UPDATE assessment_access_requests 
        SET status = 'DENIED', responded_at = CURRENT_TIMESTAMP
        WHERE id = ${requestId}
      `
    }

    return NextResponse.json({ success: true, action })
  } catch (error) {
    console.error("Error processing access request:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
