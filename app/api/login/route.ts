import { NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/db"
import { simpleCompare } from "@/lib/auth-utils"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    if (!user.password || !simpleCompare(password, user.password)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || "PARTICIPANT",
        accountType: user.account_type || "SELF_CREATED",
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
