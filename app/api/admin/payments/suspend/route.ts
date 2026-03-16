import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { sql } from "@/lib/db"
import { sendEmail, createAccountSuspensionEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

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

    const { subscriptionId, reason, notifyCustomer, notes } = await request.json()

    // Update subscription status
    await sql`
      UPDATE subscriptions 
      SET status = 'SUSPENDED',
          suspended_at = CURRENT_TIMESTAMP,
          suspension_reason = ${reason}
      WHERE stripe_subscription_id = ${subscriptionId}
    `

    // Log admin action
    await sql`
      INSERT INTO admin_actions (admin_user_id, target_subscription_id, action_type, action_details, notes)
      VALUES (${session.user.id}, ${subscriptionId}, 'suspend_account', ${JSON.stringify({ reason, notifyCustomer })}, ${notes || null})
    `

    // Send notification email if requested
    if (notifyCustomer) {
      // Get customer details
      const subscription = await sql`
        SELECT s.*, u.email, u.name, o.name as organization_name
        FROM subscriptions s
        JOIN users u ON s.user_id = u.id
        LEFT JOIN organizations o ON s.organization_id = o.id
        WHERE s.stripe_subscription_id = ${subscriptionId}
      `

      if (subscription[0]) {
        const emailTemplate = createAccountSuspensionEmail({
          customerName: subscription[0].name,
          organizationName: subscription[0].organization_name,
          reason: reason,
          reactivationInstructions: "Please update your payment method to reactivate your account.",
        })

        await sendEmail({
          to: subscription[0].email,
          ...emailTemplate,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Account suspended successfully",
    })
  } catch (error) {
    console.error("Error suspending account:", error)
    return NextResponse.json({ error: "Failed to suspend account" }, { status: 500 })
  }
}
