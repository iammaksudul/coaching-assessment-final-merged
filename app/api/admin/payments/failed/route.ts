import { NextResponse } from "next/server"
import Stripe from "stripe"

const MOCK_FAILED_PAYMENTS = [
  {
    id: "pi_3NxVjn2eZvKYlo2C0ltw4mJv",
    subscription_id: "sub_1NxVjn2eZvKYlo2C0ltw4mJv",
    customer_email: "customer1@example.com",
    customer_name: "John Doe",
    organization_name: "Acme Corp",
    amount: 9900,
    currency: "usd",
    failure_code: "card_declined",
    failure_message: "Your card was declined.",
    attempted_at: "2023-09-15T10:00:00.000Z",
    retry_count: 1,
    next_retry_at: "2023-09-18T10:00:00.000Z",
    subscription_status: "past_due",
    grace_period_ends_at: "2023-09-22T10:00:00.000Z",
    last_dunning_sent: "2023-09-16T10:00:00.000Z",
    dunning_type: "email",
  },
  {
    id: "pi_3NxVjo2eZvKYlo2C0ltw4mJw",
    subscription_id: "sub_1NxVjo2eZvKYlo2C0ltw4mJw",
    customer_email: "customer2@example.com",
    customer_name: "Jane Smith",
    organization_name: "Beta Inc",
    amount: 19900,
    currency: "usd",
    failure_code: "incorrect_cvc",
    failure_message: "Your CVC was incorrect.",
    attempted_at: "2023-09-15T11:00:00.000Z",
    retry_count: 2,
    next_retry_at: "2023-09-19T11:00:00.000Z",
    subscription_status: "past_due",
    grace_period_ends_at: "2023-09-23T11:00:00.000Z",
    last_dunning_sent: "2023-09-17T11:00:00.000Z",
    dunning_type: "email",
  },
  {
    id: "pi_3NxVjp2eZvKYlo2C0ltw4mJx",
    subscription_id: "sub_1NxVjp2eZvKYlo2C0ltw4mJx",
    customer_email: "customer3@example.com",
    customer_name: "David Lee",
    organization_name: "Gamma Ltd",
    amount: 29900,
    currency: "usd",
    failure_code: "expired_card",
    failure_message: "Your card has expired.",
    attempted_at: "2023-09-15T12:00:00.000Z",
    retry_count: 0,
    next_retry_at: "2023-09-18T12:00:00.000Z",
    subscription_status: "past_due",
    grace_period_ends_at: "2023-09-22T12:00:00.000Z",
    last_dunning_sent: "2023-09-16T12:00:00.000Z",
    dunning_type: "email",
  },
]

export async function GET() {
  try {
    const hasStripe = !!process.env.STRIPE_SECRET_KEY
    const isPreview = !hasStripe

    // In preview / no-Stripe mode → immediately return mock data
    if (isPreview) {
      return NextResponse.json({ failedPayments: MOCK_FAILED_PAYMENTS })
    }

    // --- live (Stripe) mode below ----
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2023-10-16",
    })

    // Pull the 20 most recent failed payment_intents
    const { data } = await stripe.paymentIntents.list({ limit: 20 })

    // Map Stripe response ➜ UI shape
    const failedPayments = data
      .filter((pi) => pi.status === "requires_payment_method")
      .map((pi) => ({
        id: pi.id,
        subscription_id: (pi.metadata?.subscription_id as string) || "unknown",
        customer_email: (pi.charges.data[0]?.billing_details.email as string) || "unknown",
        customer_name: (pi.charges.data[0]?.billing_details.name as string) || "Unknown",
        organization_name: pi.metadata?.organization_name as string | undefined,
        amount: pi.amount,
        currency: pi.currency,
        failure_code: pi.last_payment_error?.code || "unknown",
        failure_message: pi.last_payment_error?.message || "Failure",
        attempted_at: new Date(pi.created * 1000).toISOString(),
        retry_count: Number(pi.metadata?.retry_count || 0),
        next_retry_at: pi.metadata?.next_retry_at as string | undefined,
        subscription_status: "past_due",
        grace_period_ends_at: pi.metadata?.grace_period_ends_at as string | undefined,
        last_dunning_sent: pi.metadata?.last_dunning_sent as string | undefined,
        dunning_type: pi.metadata?.dunning_type as string | undefined,
      }))

    return NextResponse.json({ failedPayments })
  } catch (err) {
    console.error("Failed-payments route error:", err)
    // Still return mock so UI keeps working
    return NextResponse.json(
      {
        failedPayments: MOCK_FAILED_PAYMENTS,
        warning: "Stripe unavailable; returned mock data instead.",
      },
      { status: 200 },
    )
  }
}
