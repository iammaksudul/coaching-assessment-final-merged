import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/get-auth-user"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function PUT(request: Request) {
  try {
    const user = await getAuthUser(request)
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { currentPassword, newPassword } = await request.json()
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current and new password required" }, { status: 400 })
    }

    const rows = await sql`SELECT password FROM users WHERE id = ${user.id}`
    if (!rows?.[0]?.password) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const valid = await bcrypt.compare(currentPassword, rows[0].password)
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 })
    }

    const hash = await bcrypt.hash(newPassword, 10)
    await sql`UPDATE users SET password = ${hash}, updated_at = NOW() WHERE id = ${user.id}`

    return NextResponse.json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    console.error("Error updating password:", error)
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
  }
}
