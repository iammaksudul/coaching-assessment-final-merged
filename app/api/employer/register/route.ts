"use server"

import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { sql } from "@/lib/db"
import Stripe from "stripe"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const requiredFields = ["organizationName", "billingEmail", "subscriptionTier", "name", "email", "password"] as const
    for (const field of requiredFields) {
      if (!body[field] || String(body[field]).trim() === "") {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Check if user already exists
    const existing = await sql`SELECT id FROM users WHERE email = ${body.email}`
    if (existing?.length > 0) return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })

    // Create organization
    const orgRows = await sql`
      INSERT INTO organizations (name, domain, billing_email, subscription_tier)
      VALUES (${body.organizationName}, ${body.organizationDomain || null}, ${body.billingEmail}, ${body.subscriptionTier})
      RETURNING *
    `
    const organization = orgRows?.[0]
    if (!organization) return NextResponse.json({ error: "Failed to create organization" }, { status: 500 })

    // Create user
    const hashedPassword = await hash(body.password, 10)
    const userRows = await sql`
      INSERT INTO users (name, email, password, role, account_type, organization_id)
      VALUES (${body.name}, ${body.email}, ${hashedPassword}, 'EMPLOYER', 'EMPLOYER', ${organization.id})
      RETURNING id, name, email, role
    `
    const user = userRows?.[0]
    if (!user) return NextResponse.json({ error: "Failed to create user" }, { status: 500 })

    // Link user to org
    await sql`INSERT INTO organization_users (organization_id, user_id, role, status) VALUES (${organization.id}, ${user.id}, 'OWNER', 'ACTIVE')`

    // Handle Stripe subscription if configured
    if (process.env.STRIPE_SECRET_KEY && body.subscriptionTier !== "FREE") {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" })
        const prices = await stripe.prices.list({ lookup_keys: [body.subscriptionTier], active: true, limit: 1 })
        if (prices.data.length > 0) {
          const customer = await stripe.customers.create({ email: body.billingEmail, name: body.organizationName, metadata: { organizationId: organization.id } })
          await stripe.subscriptions.create({ customer: customer.id, items: [{ price: prices.data[0].id }], payment_behavior: "default_incomplete", metadata: { organizationId: organization.id } })
        }
      } catch (stripeErr: any) {
        console.error("Stripe subscription error:", stripeErr)
      }
    }

    return NextResponse.json({ organization, user, message: "Organization created successfully." }, { status: 201 })
  } catch (err) {
    console.error("Employer registration error:", err)
    return NextResponse.json({ error: "Registration failed." }, { status: 500 })
  }
}
