import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/get-auth-user"
import { sendRefereeReminderEmail } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const session = { user: await getAuthUser(req) }

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { refereeId, refereeEmail, refereeName, assessmentName, candidateName, customMessage, surveyToken } =
      await req.json()

    if (!refereeEmail || !refereeName || !surveyToken) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Send reminder email via Postmark
    await sendRefereeReminderEmail({
      refereeEmail,
      refereeName,
      candidateName,
      assessmentName,
      customMessage,
      surveyUrl: `${process.env.NEXTAUTH_URL}/referee-survey/${surveyToken}`,
    })

    return NextResponse.json({
      message: "Reminder email sent successfully",
    })
  } catch (error) {
    console.error("Error sending reminder email:", error)
    return NextResponse.json({ error: "Failed to send reminder email" }, { status: 500 })
  }
}
