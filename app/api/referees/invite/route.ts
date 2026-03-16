import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { createReferee, createRefereeInvitation } from "@/lib/db"
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

    const createdInvitations = []

    for (const refereeData of referees) {
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
        invitationUrl: `${process.env.NEXTAUTH_URL}/referee/${token}`,
      })
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
