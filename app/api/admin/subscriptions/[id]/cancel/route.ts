import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { sql } from "@/lib/db"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(request: Request, { params }: { params: { id: string } }) {
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

    const subscriptionId = params.id

    // Cancel subscription in Stripe
    if (process.env.STRIPE_SECRET_KEY) {
      await stripe.subscriptions.cancel(subscriptionId)
    }

    // Update subscription status in database
    await sql`
      UPDATE subscriptions 
      SET status = 'CANCELLED', cancelled_at = CURRENT_TIMESTAMP
      WHERE stripe_subscription_id = ${subscriptionId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error cancelling subscription:", error)
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 })
  }
}
