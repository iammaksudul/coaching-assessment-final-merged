import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { createUser, getUserByEmail } from "@/lib/db"
import { sendEmail } from "@/lib/email"
import { sql } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user
    const user = await createUser({
      name,
      email,
      password: hashedPassword,
    })

    // Notify admin(s) of new signup
    try {
      const admins = await sql`SELECT email FROM users WHERE role = 'ADMIN'`
      for (const admin of admins) {
        await sendEmail({
          to: admin.email,
          subject: "New User Signup — Coaching Digs",
          htmlBody: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#2563eb;">New User Registered</h2>
            <p>A new user has signed up for Coaching Digs:</p>
            <table style="border-collapse:collapse;margin:16px 0;">
              <tr><td style="padding:8px;font-weight:bold;">Name:</td><td style="padding:8px;">${name}</td></tr>
              <tr><td style="padding:8px;font-weight:bold;">Email:</td><td style="padding:8px;">${email}</td></tr>
              <tr><td style="padding:8px;font-weight:bold;">Signed up:</td><td style="padding:8px;">${new Date().toLocaleString()}</td></tr>
            </table>
            <hr style="margin:20px 0;border:none;border-top:1px solid #eee;">
            <p style="font-size:12px;color:#666;">This is an automated notification from Coaching Digs.</p>
          </div>`,
          tag: "new-user-signup",
        })
      }
    } catch (emailErr) {
      console.error("Failed to send admin notification:", emailErr)
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword, message: "User created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
