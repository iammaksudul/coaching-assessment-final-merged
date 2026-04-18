import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { sendEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })

    // Always return success to prevent email enumeration
    const users = await sql`SELECT id, name, email FROM users WHERE email = ${email.toLowerCase()} LIMIT 1`
    const user = users?.[0]

    if (user) {
      const token = crypto.randomBytes(32).toString("hex")
      const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Store reset token
      await sql`
        CREATE TABLE IF NOT EXISTS password_resets (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL,
          token TEXT NOT NULL UNIQUE,
          expires_at TIMESTAMPTZ NOT NULL,
          used BOOLEAN DEFAULT false,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `
      await sql`INSERT INTO password_resets (user_id, token, expires_at) VALUES (${user.id}, ${token}, ${expires.toISOString()})`

      const resetUrl = `${process.env.NEXTAUTH_URL || "https://coachingdigs.com"}/reset-password?token=${token}`
      await sendEmail({
        to: user.email,
        subject: "Reset your Coaching Digs password",
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #8b5cf6;">Password Reset Request</h2>
            <p>Hello ${user.name || "there"},</p>
            <p>We received a request to reset your password. Click the button below to set a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p style="color: #666;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666;">Coaching Digs — www.coachingdigs.com</p>
          </div>
        `,
        tag: "password-reset",
      })
    }

    return NextResponse.json({ message: "If an account exists, a reset email has been sent." })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
