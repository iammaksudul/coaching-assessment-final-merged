import { NextResponse } from "next/server"

// Postmark API integration stub
// To activate: Set POSTMARK_API_TOKEN environment variable
// API docs: https://postmarkapp.com/developer/api/email-api

const RECIPIENT_EMAIL = "todd@guidingstarcc.com"
const FROM_EMAIL = "info@coachingdigs.com" // Verified in Postmark

interface ContactFormData {
  name: string
  organization?: string
  email: string
  message: string
  honeypot?: string // Spam protection field
  timestamp?: number // Timing-based spam protection
}

async function sendViaPostmark(data: ContactFormData): Promise<boolean> {
  const apiToken = process.env.POSTMARK_API_TOKEN

  if (!apiToken) {
    console.log("[Contact Form] Postmark API token not configured - logging submission instead")
    console.log("[Contact Form] Submission:", {
      name: data.name,
      organization: data.organization || "(none)",
      email: data.email,
      message: data.message,
    })
    return true // Return success in dev/preview mode
  }

  try {
    const response = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": apiToken,
      },
      body: JSON.stringify({
        From: FROM_EMAIL,
        To: RECIPIENT_EMAIL,
        Subject: `Contact Form: ${data.name}${data.organization ? ` (${data.organization})` : ""}`,
        TextBody: `
New contact form submission from Coaching Digs website:

Name: ${data.name}
Organization: ${data.organization || "Not provided"}
Email: ${data.email}

Message:
${data.message}

---
This message was sent via the Coaching Digs contact form.
        `.trim(),
        HtmlBody: `
<h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> ${data.name}</p>
<p><strong>Organization:</strong> ${data.organization || "Not provided"}</p>
<p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
<h3>Message:</h3>
<p>${data.message.replace(/\n/g, "<br>")}</p>
<hr>
<p style="color: #666; font-size: 12px;">This message was sent via the Coaching Digs contact form.</p>
        `.trim(),
        ReplyTo: data.email,
        Tag: "contact-form",
        TrackOpens: false,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("[Contact Form] Postmark API error:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("[Contact Form] Failed to send via Postmark:", error)
    return false
  }
}

export async function POST(request: Request) {
  try {
    const data: ContactFormData = await request.json()

    // Spam protection: Check honeypot field (should be empty)
    if (data.honeypot) {
      // Silently reject - likely a bot
      return NextResponse.json({ success: true })
    }

    // Spam protection: Check submission timing (should take at least 3 seconds)
    if (data.timestamp) {
      const submissionTime = Date.now() - data.timestamp
      if (submissionTime < 3000) {
        // Too fast - likely a bot
        return NextResponse.json({ success: true })
      }
    }

    // Validate required fields
    if (!data.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }
    if (!data.email?.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }
    if (!data.message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    // Send via Postmark
    const sent = await sendViaPostmark(data)

    if (!sent) {
      return NextResponse.json(
        { error: "Failed to send message. Please try again later." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for your message. We'll get back to you soon!",
    })
  } catch (error) {
    console.error("[Contact Form] Error processing submission:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    )
  }
}
