import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { createReferee, createRefereeInvitation, getRefereeInvitationsByUserId } from "@/lib/db"
import { randomBytes } from "crypto"

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const refereeInvitations = await getRefereeInvitationsByUserId(session.user.id)
    return NextResponse.json({ referees: refereeInvitations })
  } catch (error) {
    console.error("Error fetching referees:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { referees, assessmentId } = await req.json()

    const createdInvitations = []

    for (const refereeData of referees) {
      // Create referee
      const referee = await createReferee(refereeData)

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
      })
    }

    return NextResponse.json({ invitations: createdInvitations }, { status: 201 })
  } catch (error) {
    console.error("Error creating referee invitations:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
