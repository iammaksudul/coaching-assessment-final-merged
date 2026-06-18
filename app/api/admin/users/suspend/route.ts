import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/get-auth-user"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const admin = await getAuthUser(request)
    if (!admin?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const check = await sql`SELECT role FROM users WHERE id = ${admin.id}`
    if (check[0]?.role !== "ADMIN") return NextResponse.json({ error: "Admin access required" }, { status: 403 })

    const { userId, reason } = await request.json()
    if (!userId || !reason) return NextResponse.json({ error: "userId and reason required" }, { status: 400 })

    await sql`
      UPDATE users SET status = 'SUSPENDED', suspended_at = CURRENT_TIMESTAMP, suspension_reason = ${reason}
      WHERE id = ${userId} AND id != ${admin.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error suspending user:", error)
    return NextResponse.json({ error: "Failed to suspend user" }, { status: 500 })
  }
}
