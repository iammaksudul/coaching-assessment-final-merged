import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/get-auth-user"
import { sql } from "@/lib/db"
import {
  sendEmail,
  createPaymentFailedEmail,
  createPaymentRetryReminderEmail,
  createFinalNoticeEmail,
} from "@/lib/email"

export async function POST(request: Request) {
  try {
    const session = { user: await getAuthUser(request) }

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

    const { subscriptionId, emailType, customMessage } = await request.json()

    // Get subscription and customer details
    const subscription = await sql`
      SELECT s.*, u.email, u.name, o.name as organization_name
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN organizations o ON s.organization_id = o.id
      WHERE s.stripe_subscription_id = ${subscriptionId}
    `

    if (!subscription[0]) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    const sub = subscription[0]
    let emailTemplate

    // Generate appropriate email template
    switch (emailType) {
      case "payment_failed":
        emailTemplate = createPaymentFailedEmail({
          customerName: sub.name,
          organizationName: sub.organization_name,
          amount: "$39.00", // This would come from the actual subscription
          updatePaymentLink: `${process.env.NEXTAUTH_URL}/subscription/manage`,
          customMessage,
        })
        break
      case "retry_reminder":
        emailTemplate = createPaymentRetryReminderEmail({
          customerName: sub.name,
          organizationName: sub.organization_name,
          nextRetryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatePaymentLink: `${process.env.NEXTAUTH_URL}/subscription/manage`,
          customMessage,
        })
        break
      case "final_notice":
        emailTemplate = createFinalNoticeEmail({
          customerName: sub.name,
          organizationName: sub.organization_name,
          suspensionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatePaymentLink: `${process.env.NEXTAUTH_URL}/subscription/manage`,
          customMessage,
        })
        break
      default:
        return NextResponse.json({ error: "Invalid email type" }, { status: 400 })
    }

    // Send email
    const result = await sendEmail({
      to: sub.email,
      ...emailTemplate,
    })

    // Log dunning attempt
    await sql`
      INSERT INTO dunning_attempts (subscription_id, email_type, sent_to, email_subject)
      VALUES (${sub.id}, ${emailType}, ${sub.email}, ${emailTemplate.subject})
    `

    // Log admin action
    await sql`
      INSERT INTO admin_actions (admin_user_id, target_subscription_id, action_type, action_details)
      VALUES (${session.user.id}, ${subscriptionId}, 'send_dunning', ${JSON.stringify({ emailType, customMessage })})
    `

    return NextResponse.json({
      success: true,
      message: "Dunning email sent successfully",
      messageId: result.messageId,
    })
  } catch (error) {
    console.error("Error sending dunning email:", error)
    return NextResponse.json({ error: "Failed to send dunning email" }, { status: 500 })
  }
}
