"use server"

import { NextResponse } from "next/server"
import Stripe from "stripe"

/**
 * Helpers you may already have elsewhere.  Replace these with real
 * implementations if the project contains them.
 */
async function createOrganization(data: {
  name: string
  domain?: string
  billingEmail: string
  subscriptionTier: string
}) {
  //
  // 👉 TODO: Persist org to DB here.
  //
  return {
    id: "org_mock_123",
    ...data,
    createdAt: new Date().toISOString(),
  }
}

async function createOrgOwnerUser(data: {
  name: string
  email: string
  password: string
  organizationId: string
  jobTitle?: string
}) {
  //
  // 👉 TODO: Persist user to DB here (hash password, etc.).
  //
  return {
    id: "user_mock_123",
    ...data,
    createdAt: new Date().toISOString(),
  }
}

// POST /api/employer/register -------------------------------------------------
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Basic validation
    const requiredFields = [
      "organizationName",
      "billingEmail",
      "subscriptionTier",
      "name",
      "email",
      "password",
    ] as const

    for (const field of requiredFields) {
      if (!body[field] || String(body[field]).trim() === "") {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    /**
     * 1️⃣  Create / save the organization
     */
    const organization = await createOrganization({
      name: body.organizationName,
      domain: body.organizationDomain || undefined,
      billingEmail: body.billingEmail,
      subscriptionTier: body.subscriptionTier,
    })

    /**
     * 2️⃣  Create the primary account-holder user
     */
    const user = await createOrgOwnerUser({
      name: body.name,
      email: body.email,
      password: body.password,
      organizationId: organization.id,
      jobTitle: body.jobTitle,
    })

    /**
     * 3️⃣  Handle Stripe subscription (skip in Preview mode)
     */
    if (process.env.STRIPE_SECRET_KEY) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2023-10-16",
      })

      // 🔄 DYNAMIC PRICE LOOKUP -----------------------------------------------
      // We assume each Price in Stripe has a unique `lookup_key`
      // that exactly matches the `subscriptionTier` coming from the form
      // (e.g. TIER_1_5, TIER_6_12, …).
      const prices = await stripe.prices.list({
        lookup_keys: [body.subscriptionTier],
        active: true,
        limit: 1,
        expand: ["data.product"],
      })

      if (prices.data.length === 0) {
        return NextResponse.json(
          { error: `Subscription tier ${body.subscriptionTier} is not configured. Please contact support.` },
          { status: 400 },
        )
      }

      const priceId = prices.data[0].id

      // 💳 Create Customer → Subscription
      const customer = await stripe.customers.create({
        email: body.billingEmail,
        name: organization.name,
        metadata: { organizationId: organization.id },
      })

      try {
        await stripe.subscriptions.create({
          customer: customer.id,
          items: [{ price: priceId }],
          payment_behavior: "default_incomplete",
          metadata: { organizationId: organization.id },
        })
      } catch (stripeErr: any) {
        console.error("Stripe subscription error:", stripeErr)
        return NextResponse.json({ error: `Stripe error: ${stripeErr?.message ?? "unknown error"}` }, { status: 400 })
      }
    }

    /**
     * 4️⃣  Respond with success (mock or real — always JSON)
     */
    return NextResponse.json(
      {
        organization,
        user,
        message: process.env.STRIPE_SECRET_KEY
          ? "Organization created – subscription pending payment."
          : "Organization created successfully (preview mode – no Stripe).",
      },
      { status: 201 },
    )
  } catch (err) {
    console.error("Employer registration error:", err)
    return NextResponse.json(
      {
        error: "Registration failed. Please check the server logs or contact support.",
      },
      { status: 500 },
    )
  }
}
