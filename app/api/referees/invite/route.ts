import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { createReferee, createRefereeInvitation } from "@/lib/db"
import { sendEmail, createRefereeInvitationEmail } from "@/lib/email"
import { randomBytes } from "crypto"

export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { referees, assessmentId } = await req.json()

    if (!referees || !Array.isArray(referees) || referees.length === 0) {
      return NextResponse.json({ error: "At least one referee is required" }, { status: 400 })
    }

    if (!assessmentId) {
      return NextResponse.json({ error: "Assessment ID is required" }, { status: 400 })
    }

    // Prevent self-invitation: filter out participant's own email
    const userEmail = session.user.email?.toLowerCase()
    const filteredReferees = referees.filter((r: any) => r.email?.toLowerCase() !== userEmail)
    if (filteredReferees.length === 0) {
      return NextResponse.json({ error: "You cannot invite yourself as a referee" }, { status: 400 })
    }
    if (filteredReferees.length < referees.length) {
      console.warn(`Blocked self-invitation attempt by ${userEmail}`)
    }

    const createdInvitations = []

    for (const refereeData of filteredReferees) {
      // Create referee
      const referee = await createReferee({
        name: refereeData.name,
        email: refereeData.email,
        relationship: refereeData.relationship,
      })

      // Generate invitation token
      const token = randomBytes(32).toString("hex")
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30) // 30 days expiry

      // Create invitation
      const invitation = await createRefereeInvitation({
        assessmentId,
        refereeId: referee.id,
        userId: session.user.id,
        token,
        expiresAt,
      })

      createdInvitations.push({
        ...invitation,
        referee,
        invitationUrl: `${process.env.NEXTAUTH_URL}/referee-survey/${token}`,
      })

      // Send invitation email
      try {
        const emailTemplate = createRefereeInvitationEmail({
          refereeName: refereeData.name,
          candidateName: session.user.name || "A participant",
          relationship: refereeData.relationship || "colleague",
          surveyLink: `${process.env.NEXTAUTH_URL}/referee-survey/${token}`,
          personalMessage: refereeData.message,
        })
        await sendEmail({ ...emailTemplate, to: refereeData.email })
      } catch (emailError) {
        console.error(`Failed to send email to ${refereeData.email}:`, emailError)
      }
    }

    return NextResponse.json(
      {
        message: "Referee invitations created successfully",
        invitations: createdInvitations,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating referee invitations:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
