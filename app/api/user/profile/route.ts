import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/get-auth-user"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request)
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const rows = await sql`SELECT id, name, email, role FROM users WHERE id = ${user.id}`
    if (!rows?.[0]) return NextResponse.json({ error: "User not found" }, { status: 404 })

    return NextResponse.json({ user: rows[0] })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthUser(request)
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { name, email } = await request.json()
    if (!name || !email) return NextResponse.json({ error: "Name and email required" }, { status: 400 })

    // Check email uniqueness if changed
    const existing = await sql`SELECT id FROM users WHERE email = ${email} AND id != ${user.id}`
    if (existing?.length > 0) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }

    await sql`UPDATE users SET name = ${name}, email = ${email}, updated_at = NOW() WHERE id = ${user.id}`

    return NextResponse.json({ success: true, message: "Profile updated successfully" })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
