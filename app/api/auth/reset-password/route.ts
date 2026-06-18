import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { hash } from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()
    if (!token || !password) return NextResponse.json({ error: "Token and password required" }, { status: 400 })
    if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })

    const resets = await sql`
      SELECT pr.user_id FROM password_resets pr
      WHERE pr.token = ${token} AND pr.used = false AND pr.expires_at > NOW()
      LIMIT 1
    `
    if (!resets?.[0]) return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 })

    const hashed = await hash(password, 10)
    await sql`UPDATE users SET password = ${hashed} WHERE id = ${resets[0].user_id}`
    await sql`UPDATE password_resets SET used = true WHERE token = ${token}`

    return NextResponse.json({ message: "Password reset successfully" })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
  }
}
