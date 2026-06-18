import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { organizationId, returnUrl } = await req.json()

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          unit_amount: 900,
          product_data: {
            name: "Extra Assessment Credit",
            description: "One additional coachability assessment credit",
          },
        },
        quantity: 1,
      }],
      metadata: { organizationId: organizationId || "", userId, type: "one_off_assessment" },
      success_url: `${returnUrl || baseUrl}/organization-dashboard?purchase=success`,
      cancel_url: `${returnUrl || baseUrl}/organization-dashboard?purchase=cancelled`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Purchase assessment error:", error)
    return NextResponse.json({ error: "Failed to create purchase session" }, { status: 500 })
  }
}
