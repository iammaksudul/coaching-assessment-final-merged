import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { requestId, action, declineMessage } = await request.json()

    if (!requestId || !["accept", "decline"].includes(action)) {
      return NextResponse.json({ error: "Invalid request. Must provide requestId and action (accept or decline)." }, { status: 400 })
    }

    // In production, this would:
    // 1. Update the sponsored_assessment_requests table with the participant's response
    // 2. Create a notification record for the organization admin
    // 3. If accepted, create a new assessment linked to the sponsoring organization
    // 4. If declined, store the decline message for the admin to review

    const respondedAt = new Date().toISOString()

    // For preview mode, return success with the response data
    // that the organization admin dashboard will be able to query
    return NextResponse.json({
      success: true,
      response: {
        requestId,
        action,
        respondedAt,
        respondedByUserId: userId,
        ...(action === "decline" && declineMessage ? { declineMessage } : {}),
        // This notification payload is what the org admin would see
        adminNotification: {
          type: action === "accept" ? "ASSESSMENT_ACCEPTED" : "ASSESSMENT_DECLINED",
          message:
            action === "accept"
              ? "The participant has accepted the assessment request and will begin shortly."
              : `The participant has respectfully declined the assessment request.${declineMessage ? ` Reason: ${declineMessage}` : ""}`,
          createdAt: respondedAt,
        },
      },
    })
  } catch (error) {
    console.error("Error responding to sponsored request:", error)
    return NextResponse.json({ error: "Failed to process response" }, { status: 500 })
  }
}
