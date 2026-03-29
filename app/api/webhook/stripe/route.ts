import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get("Stripe-Signature") as string

  let event: any

  if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET && signature) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err: any) {
      console.error("Stripe webhook signature verification failed:", err.message)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }
  } else {
    try {
      event = JSON.parse(body)
    } catch {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }
  }

  try {

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data?.object
        const metadata = session?.metadata || {}

        if (metadata.type === "one_off_assessment") {
          // One-off $9 assessment credit purchase
          // In production with DB:
          // await sql`
          //   UPDATE organizations
          //   SET assessment_bonus_credits = COALESCE(assessment_bonus_credits, 0) + 1
          //   WHERE id = ${metadata.organizationId}
          // `
          console.log(
            `[Stripe Webhook] One-off assessment credit purchased for org ${metadata.organizationId} by user ${metadata.userId}`
          )
        }
        break
      }

      case "customer.subscription.updated": {
        // Handle subscription tier changes
        const subscription = event.data?.object
        console.log("[Stripe Webhook] Subscription updated:", subscription?.id)
        break
      }

      case "customer.subscription.deleted": {
        // Handle subscription cancellation
        const subscription = event.data?.object
        console.log("[Stripe Webhook] Subscription cancelled:", subscription?.id)
        break
      }

      case "invoice.payment_failed": {
        // Handle failed payment -- trigger dunning flow
        const invoice = event.data?.object
        console.log("[Stripe Webhook] Payment failed for invoice:", invoice?.id)
        break
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[Stripe Webhook] Error processing event:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 400 })
  }
}
