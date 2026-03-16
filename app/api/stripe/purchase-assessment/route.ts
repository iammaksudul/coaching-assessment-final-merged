import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { organizationId, returnUrl } = await req.json()

    // When Stripe is hardened, this will create a real Checkout Session:
    //
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    // const session = await stripe.checkout.sessions.create({
    //   mode: "payment",
    //   line_items: [{
    //     price_data: {
    //       currency: "usd",
    //       unit_amount: 900, // $9.00
    //       product_data: {
    //         name: "Extra Assessment Credit",
    //         description: "One additional coachability assessment credit",
    //       },
    //     },
    //     quantity: 1,
    //   }],
    //   metadata: { organizationId, userId, type: "one_off_assessment" },
    //   success_url: `${returnUrl || process.env.NEXTAUTH_URL}/organization-dashboard?purchase=success`,
    //   cancel_url: `${returnUrl || process.env.NEXTAUTH_URL}/organization-dashboard?purchase=cancelled`,
    // })
    // return NextResponse.json({ url: session.url })

    // Preview mode: simulate purchase success immediately
    return NextResponse.json({
      success: true,
      preview: true,
      creditsAdded: 1,
      message: "Assessment credit purchased for $9.00 (preview mode)",
    })
  } catch (error) {
    console.error("Purchase assessment error:", error)
    return NextResponse.json({ error: "Failed to create purchase session" }, { status: 500 })
  }
}
