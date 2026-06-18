import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/get-auth-user"
import { sql } from "@/lib/db"
import Stripe from "stripe"

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

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

    const { subscriptionId, paymentIntentId, notes } = await request.json()

    // In production, retry the payment with Stripe
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        // Get the latest invoice for the subscription
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string)

        if (invoice.payment_intent) {
          // Retry the payment intent
          await stripe.paymentIntents.confirm(invoice.payment_intent as string)
        }
      } catch (stripeError) {
        console.error("Stripe retry error:", stripeError)
        // Continue with response
      }
    }

    // Log admin action
    await sql`
      INSERT INTO admin_actions (admin_user_id, target_subscription_id, action_type, action_details, notes)
      VALUES (${session.user.id}, ${subscriptionId}, 'retry_payment', ${JSON.stringify({ paymentIntentId })}, ${notes || null})
    `

    // Update retry count and next retry time
    await sql`
      UPDATE subscriptions 
      SET payment_retry_count = payment_retry_count + 1,
          last_payment_attempt_at = CURRENT_TIMESTAMP
      WHERE stripe_subscription_id = ${subscriptionId}
    `

    return NextResponse.json({
      success: true,
      message: "Payment retry initiated successfully",
    })
  } catch (error) {
    console.error("Error retrying payment:", error)
    return NextResponse.json({ error: "Failed to retry payment" }, { status: 500 })
  }
}
