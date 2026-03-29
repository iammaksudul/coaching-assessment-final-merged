import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { requestId, action, declineMessage } = await request.json()
    if (!requestId || !["accept", "decline"].includes(action)) {
      return NextResponse.json({ error: "Invalid request. Must provide requestId and action (accept or decline)." }, { status: 400 })
    }

    const newStatus = action === "accept" ? "ACCEPTED" : "DECLINED"
    await sql`
      UPDATE sponsored_assessments
      SET status = ${newStatus}, updated_at = NOW(),
          declined_reason = ${action === "decline" ? (declineMessage || null) : null},
          consent_given_at = ${action === "accept" ? new Date().toISOString() : null}
      WHERE id = ${requestId}
    `

    return NextResponse.json({
      success: true,
      response: {
        requestId, action,
        respondedAt: new Date().toISOString(),
        respondedByUserId: userId,
        ...(action === "decline" && declineMessage ? { declineMessage } : {}),
      },
    })
  } catch (error) {
    console.error("Error responding to sponsored request:", error)
    return NextResponse.json({ error: "Failed to process response" }, { status: 500 })
  }
}
