import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { sql } from "@/lib/db"
import { SUBSCRIPTION_TIERS } from "@/app/api/stripe/prices/route"

// Map Stripe price IDs back to our tier keys
const PRICE_TO_TIER: Record<string, string> = {}
for (const [tier, config] of Object.entries(SUBSCRIPTION_TIERS)) {
  if (config.monthly.id) PRICE_TO_TIER[config.monthly.id] = tier
  if (config.annual.id) PRICE_TO_TIER[config.annual.id] = tier
}

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
          await sql`
            UPDATE organizations
            SET assessment_bonus_credits = COALESCE(assessment_bonus_credits, 0) + 1
            WHERE id = ${metadata.organizationId}
          `
          console.log(`[Stripe Webhook] +1 assessment credit for org ${metadata.organizationId}`)
        }
        break
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data?.object
        const metadata = sub?.metadata || {}
        const priceId = sub?.items?.data?.[0]?.price?.id
        const tier = priceId ? PRICE_TO_TIER[priceId] : null
        const orgId = metadata.organizationId

        if (orgId && tier) {
          await sql`
            UPDATE organizations
            SET subscription_tier = ${tier},
                stripe_customer_id = ${sub.customer},
                stripe_subscription_id = ${sub.id},
                subscription_status = ${sub.status}
            WHERE id = ${orgId}
          `
          console.log(`[Stripe Webhook] Org ${orgId} → ${tier} (${sub.status})`)
        }
        break
      }

      case "customer.subscription.deleted": {
        const sub = event.data?.object
        const orgId = sub?.metadata?.organizationId
        if (orgId) {
          await sql`
            UPDATE organizations
            SET subscription_status = 'canceled'
            WHERE stripe_subscription_id = ${sub.id} OR id = ${orgId}
          `
          console.log(`[Stripe Webhook] Subscription cancelled for org ${orgId}`)
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data?.object
        const subId = invoice?.subscription
        if (subId) {
          await sql`
            UPDATE organizations
            SET subscription_status = 'past_due'
            WHERE stripe_subscription_id = ${subId}
          `
          console.log(`[Stripe Webhook] Payment failed, sub ${subId} → past_due`)
        }
        break
      }

      default:
        console.log(`[Stripe Webhook] Unhandled: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[Stripe Webhook] Error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 400 })
  }
}
