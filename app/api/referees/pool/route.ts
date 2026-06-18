import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/get-auth-user"
import { sql } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const referees = await sql`
      SELECT DISTINCT ON (referee_email)
        referee_name as name, referee_email as email, relationship,
        MAX(status) as status, MAX(created_at) as created_at
      FROM referee_invitations
      WHERE user_id = ${user.id} AND referee_email IS NOT NULL
      GROUP BY referee_name, referee_email, relationship
      ORDER BY referee_email, MAX(created_at) DESC
    `
    return NextResponse.json(referees || [])
  } catch (error) {
    console.error("Error fetching referee pool:", error)
    return NextResponse.json([], { status: 200 })
  }
}
