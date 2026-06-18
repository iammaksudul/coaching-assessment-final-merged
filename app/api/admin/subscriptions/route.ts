import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/get-auth-user"
import { sql } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = { user: await getAuthUser(req) }

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const user = await sql`
      SELECT role FROM users WHERE id = ${session.user.id}
    `

    if (!user[0] || user[0].role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get all subscriptions with user and organization data
    const subscriptions = await sql`
      SELECT 
        s.*,
        o.name as organization_name
      FROM subscriptions s
      LEFT JOIN organizations o ON s.organization_id = o.id
      ORDER BY s.created_at DESC
    `

    return NextResponse.json({ subscriptions })
  } catch (error) {
    console.error("Error fetching admin subscriptions:", error)
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
  }
}
